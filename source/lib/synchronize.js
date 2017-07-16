import Promise from './promise.js'
import fs from 'fs-extra'
import path from 'path'
import readline from 'readline'
import regexParser from 'regex-parser'
import { takeMeta, getBlocks } from './getMeta.js'
import { getDelimiters } from 'block-js'
import cuid from 'cuid'

const debug = require('debug')('nicosommi.gene-js.synchronize')
const ensureFile = Promise.promisify(fs.ensureFile)
const stat = Promise.promisify(fs.stat)


function flushReplacementQueue (line, queue) {
  let newLine = line
  queue.forEach(
    queueItem => {
      const regex = new RegExp(queueItem.id, 'g')
      newLine = newLine.replace(
        regex,
        queueItem.realValue
      )
    }
  )
  return newLine
}

export function executeReplacements (line, replacements) {
  let thereAreReplacements = (replacements != null)
  const queue = []
  if (thereAreReplacements && line && line.length > 0) {
    let finalLine = line
    Object.keys(replacements).forEach(
      (replacementKey) => {
        let key = regexParser(replacementKey)
        if (replacementKey && replacementKey.indexOf('/') === 0 && replacementKey.lastIndexOf('/') > 0) {
          key = regexParser(replacementKey)
        } else {
          key = new RegExp(replacementKey, 'g')
        }
        const queueElement = {
          id: cuid(),
          realValue: replacements[replacementKey]
        }
        finalLine = finalLine.replace(
          key,
          queueElement.id
        )

        queue.push(queueElement)
      }
    )
    finalLine = flushReplacementQueue(finalLine, queue)
    return finalLine
  } else {
    return line
  }
}

function mergeReplacements (sourceReplacements, targetReplacements) {
  if (!sourceReplacements) {
    if (targetReplacements) {
      const replacements = {}
      Object.keys(targetReplacements).forEach(
        targetReplacementKey => {
          replacements[targetReplacements[targetReplacementKey].regex] = targetReplacements[targetReplacementKey].value
        }
      )
      return replacements
    } else {
      return undefined
    }
  } else if (!targetReplacements) {
    const replacements = {}
    Object.keys(sourceReplacements).forEach(
      sourceReplacementKey => {
        replacements[sourceReplacements[sourceReplacementKey].regex] = sourceReplacements[sourceReplacementKey].value
      }
    )
    return replacements
  } else {
    const replacements = {}
    const sourceReplacementKeys = Object.keys(sourceReplacements)
    const targetReplacementKeys = Object.keys(targetReplacements)
    targetReplacementKeys.forEach(
      targetReplacementKey => {
        const matchingSourceReplacementKey = sourceReplacementKeys.find(sourceReplacementKey => (sourceReplacementKey === targetReplacementKey))
        if (matchingSourceReplacementKey) {
          const regex = sourceReplacements[matchingSourceReplacementKey].regex
          const value = targetReplacements[targetReplacementKey].value
          replacements[regex] = value
        } else {
          throw new Error(`Missing replacement key on the source (${targetReplacementKey})`)
        }
      }
    )
    return replacements
  }
}

function takeOptions (sourceBlocks, targetBlocks, commentStringStart, commentStringEnd) {
  const options = {}
  const sourceOptions = takeMeta(sourceBlocks, commentStringStart, commentStringEnd)
  const { sourceReplacements, sourceStamps } = { sourceReplacements: sourceOptions.replacements, sourceStamps: sourceOptions.stamps }
  const { replacements, stamps } = takeMeta(targetBlocks, commentStringStart, commentStringEnd)
  options.replacements = mergeReplacements(sourceReplacements, replacements)
  options.stamps = stamps
  options.sourceStamps = sourceStamps
  return options
}

export default function synchronize (source, target, options) {
  return new Promise(
    (resolve, reject) => {
      let force
      if (options) {
        force = options.force
      }

      let commentStringStart
      let commentStringEnd
      let delimiters = getDelimiters(source)

      let fileExist = true

      let sourcePhBlocks = []
      let sourceStampBlocks = []
      let targetPhBlocks = []
      let targetStampBlocks = []

      stat(target)
        .then(() => Promise.resolve())
        .catch(() => {
          fileExist = false
        })
        .then(() => ensureFile(target))
        .then(
          () => {
            Promise.props({
              source: getBlocks(source),
              target: getBlocks(target)
            })
              .then(
                (results) => {
                  sourcePhBlocks = results.source.phBlocks
                  sourceStampBlocks = results.source.stampBlocks
                  targetPhBlocks = results.target.phBlocks
                  targetStampBlocks = results.target.stampBlocks
                  commentStringStart = results.source.commentStringStart
                  commentStringEnd = results.source.commentStringEnd

                  if (!options || (!options.replacements && !options.stamps)) {
                    debug(`taking options for file ${target}`)
                    options = takeOptions(sourcePhBlocks, targetPhBlocks, commentStringStart, commentStringEnd)
                  }

                  if (fileExist && sourcePhBlocks.length > 1 && targetPhBlocks.length === 0 && !force) {
                    throw new Error(`Warning, there is too much difference between ${path.basename(source)} and ${path.basename(target)}. Make sure it's OK and use force flag.`)
                  }

                  return Promise.resolve()
                }
            )
              .then(
                () => {
                  const result = []
                  let deprecated

                  sourcePhBlocks.forEach((templatePlaceHolder) => {
                    let placeHolder = targetPhBlocks.find((targetPlaceHolder) => {
                      const found = targetPlaceHolder.name === templatePlaceHolder.name
                      if (found) {
                        targetPlaceHolder.found = true
                      }
                      return found
                    })
                    if (!placeHolder) {
                      placeHolder = templatePlaceHolder
                    }
                    result.push(placeHolder)
                  })

                  deprecated = targetPhBlocks.find((targetPlaceHolder) => (targetPlaceHolder.name === 'deprecated'))

                  // find if there is a deprecated ph already there
                  if (!deprecated) {
                    deprecated = {name: 'deprecated', content: ''}
                  }

                  let deprecatedPhs = targetPhBlocks.filter(
                    (ph) => {
                      return (ph.name !== 'deprecated') && !(ph.found)
                    }
                  )

                  deprecatedPhs.forEach((deprecatedPh) => {
                    if (deprecated.content.length > 0) {
                      deprecated.content += `
`
                    }
                    let finalContent = ''
                    if (deprecatedPh.content) {
                      finalContent = deprecatedPh.content.replace(/\n/g, ` ${commentStringEnd}\n${commentStringStart}`)
                    }
                    const replacedContent = finalContent
                    deprecated.content += `${commentStringStart} name: ${deprecatedPh.name} ${commentStringEnd}\n${commentStringStart} content: ${replacedContent} ${commentStringEnd}`
                  })

                  if (deprecated.content.length > 0) {
                    result.push(deprecated)
                  }

                  // prepare concrete contents
                  let concreteFileContent = ''
                  // read template file line by line
                  const lineReader = readline.createInterface({ input: fs.createReadStream(source, { encoding: 'utf8' }) })
                  let lineNumber = 0
                  let ignoreLines = false
                  lineReader.on('line',
                    (line) => {
                      lineNumber++
                      const endPlaceholder = sourcePhBlocks.find(templatePlaceholder => templatePlaceholder.to === lineNumber)
                      if (endPlaceholder) {
                        ignoreLines = false
                      }

                      // if the line matches the line of a newPhs element, put the contents from the ph there
                      const placeholder = sourcePhBlocks.find(templatePlaceholder => templatePlaceholder.from === lineNumber)

                      const addLine = !ignoreLines
                      let isSpecialLine = (placeholder || endPlaceholder)
                      let stampBegin
                      let stampEnd
                      if (sourceStampBlocks) {
                        stampBegin = sourceStampBlocks.find(templateStamp => (templateStamp.from === lineNumber))

                        stampEnd = sourceStampBlocks.find(templateStamp => (templateStamp.to === lineNumber))

                        isSpecialLine = (placeholder || endPlaceholder || stampBegin || stampEnd)
                      }

                      function addLineFunction () {
                        if (addLine) {
                          let finalLine = line
                          if (!isSpecialLine && options.replacements) { // do not replace ph/stamp title lines!
                            finalLine = executeReplacements(line, options.replacements)
                          }
                          if(stampBegin && stampBegin.from === stampBegin.to) {
                            finalLine = `${executeReplacements(stampBegin.content, options.replacements)}${delimiters.inline} stamp ${stampBegin.name}`
                          }
                          concreteFileContent += `${finalLine}\n`
                        }
                      }

                      if (placeholder) {
                        const targetPlaceholder = targetPhBlocks.find(targetPlaceHolder => targetPlaceHolder.name === placeholder.name)
                        if (targetPlaceholder) {
                          ignoreLines = true
                          if (!targetPlaceholder.content) {
                            addLineFunction()
                            concreteFileContent += ''
                          } else if(placeholder.from === placeholder.to && targetPlaceholder.content) {
                            concreteFileContent += `${targetPlaceholder.content}${delimiters.inline} ph ${placeholder.name}\n`
                            ignoreLines = false
                          } else {
                            addLineFunction()
                            concreteFileContent += `${targetPlaceholder.content}\n`
                          }
                        } else {
                          addLineFunction()
                        }
                      } else {
                        addLineFunction()
                        if (stampBegin && options.stamps) {
                          if(stampBegin.from !== stampBegin.to) ignoreLines = true
                          // if matchs stamps it is a candidate to be included
                          let candidate = options.stamps.test(stampBegin.name)
                          // only if matchs in the source too it worth to take it here
                          let itWorthToTakeIt = false
                          if(options.sourceStamps) {
                            debug(`testing stamp ${stampBegin.name} with the regexp ${options.sourceStamps.toString()}`);
                            itWorthToTakeIt = options.sourceStamps.test(stampBegin.name)
                          }

                          if(candidate && stampBegin.from !== stampBegin.to) {
                            if(itWorthToTakeIt) {
                              const finalLine = executeReplacements(stampBegin.content, options.replacements)
                              if (finalLine) {
                                concreteFileContent += `${finalLine}\n`
                              }
                            } else {
                              // keep his content for stamps that the other is ignoring
                              if (targetStampBlocks) {
                                const currentStamp = targetStampBlocks.find(
                                  targetStamp => targetStamp.name === stampBegin.name
                                )
                                if (currentStamp && currentStamp.content) {
                                  concreteFileContent += `${currentStamp.content}\n`
                                } else {
                                  concreteFileContent += ''
                                }
                              }
                            }
                          } else {
                            concreteFileContent += `` // nothing
                          }
                        } else {
                          if (stampEnd && options.stamps && stampEnd.from !== stampEnd.to) {
                            ignoreLines = false
                            concreteFileContent += `${line}\n`
                          }
                        }
                      }
                    })
                  lineReader.on('close',
                    () => {
                      // put the deprecated ph if there is one
                      if (deprecated && deprecated.content && deprecated.content.length > 0) {
                        concreteFileContent += `${commentStringStart} ph deprecated ${commentStringEnd}\n${deprecated.content}\n${commentStringStart} endph ${commentStringEnd}\n`
                      }
                      fs.writeFileSync(target, concreteFileContent, {encoding: 'utf8'})
                      resolve()
                    })
                }
            )
              .catch(reject)
          }
      )
        .catch(reject)
    }
  )
}
