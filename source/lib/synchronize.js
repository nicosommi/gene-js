import Promise from './promise.js'
import fs from 'fs-extra'
import path from 'path'
import readline from 'readline'
import regexParser from 'regex-parser'
import { takeMeta, getBlocks } from './getMeta.js'

const ensureFile = Promise.promisify(fs.ensureFile)
const stat = Promise.promisify(fs.stat)

export function executeReplacements (line, replacements) {
  let thereAreReplacements = (replacements != null)
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
        finalLine = finalLine.replace(
          key,
          replacements[replacementKey]
        )
      }
    )
    return finalLine
  } else {
    return line
  }
}

function mergeReplacements (sourceReplacements, targetReplacements) {
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

function takeOptions (sourceBlocks, targetBlocks, commentStringStart, commentStringEnd) {
  const options = {}
  const sourceOptions = takeMeta(sourceBlocks, commentStringStart, commentStringEnd)
  const { sourceReplacements, sourceIgnoringStamps } = { sourceReplacements: sourceOptions.replacements, sourceIgnoringStamps: sourceOptions.ignoringStamps }
  const { replacements, ignoringStamps } = takeMeta(targetBlocks, commentStringStart, commentStringEnd)
  options.replacements = mergeReplacements(sourceReplacements, replacements)
  options.ignoringStamps = ignoringStamps
  options.sourceIgnoringStamps = sourceIgnoringStamps
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

                  if (!options || (!options.replacements && !options.ignoringStamps)) {
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

                  deprecated = targetPhBlocks.find((targetPlaceHolder) => {
                    return (targetPlaceHolder.name === 'deprecated')
                  })

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
                      const endPlaceholder = sourcePhBlocks
                        .find(
                          templatePlaceholder => {
                            return templatePlaceholder.to === lineNumber
                          }
                      )
                      if (endPlaceholder) {
                        ignoreLines = false
                      }

                      // if the line matches the line of a newPhs element, put the contents from the ph there
                      const placeholder = sourcePhBlocks
                        .find(
                          templatePlaceholder => {
                            return templatePlaceholder.from === lineNumber
                          }
                      )

                      const stampBegin = sourceStampBlocks.find(
                        templateStamp => {
                          return (templateStamp.from === lineNumber)
                        }
                      )

                      const stampEnd = sourceStampBlocks.find(
                        templateStamp => {
                          return (templateStamp.to === lineNumber)
                        }
                      )

                      const addLine = !ignoreLines
                      const isSpecialLine = (placeholder || endPlaceholder || stampBegin || stampEnd)

                      if (addLine) {
                        let finalLine = line
                        if (!isSpecialLine) { // do not replace ph/stamp lines!
                          finalLine = executeReplacements(line, options.replacements)
                        }
                        concreteFileContent += `${finalLine}\n`
                      }

                      if (placeholder) {
                        const targetPlaceholder = targetPhBlocks
                          .find(
                            targetPlaceHolder => {
                              return targetPlaceHolder.name === placeholder.name
                            }
                        )
                        if (targetPlaceholder) {
                          ignoreLines = true
                          if (!targetPlaceholder.content) {
                            concreteFileContent += ''
                          } else {
                            concreteFileContent += `${targetPlaceholder.content}\n`
                          }
                        }
                      } else {
                        if (stampBegin) {
                          ignoreLines = true
                          const ignored = options.ignoringStamps.find(
                            stampsToIgnore => {
                              return stampsToIgnore === stampBegin.name
                            }
                          )
                          let ignoredOnSource = null
                          if (options.sourceIgnoringStamps) {
                            ignoredOnSource = options.sourceIgnoringStamps.find(
                              stampsToIgnore => {
                                return stampsToIgnore === stampBegin.name
                              }
                            )
                          }

                          if (!ignored) {
                            if (!ignoredOnSource) {
                              const finalLine = executeReplacements(stampBegin.content, options.replacements)
                              if (finalLine) {
                                concreteFileContent += `${finalLine}\n`
                              }
                            } else {
                              // keep his content for stamps that the other is ignoring
                              if (targetStampBlocks) {
                                const currentStamp = targetStampBlocks.find(
                                  targetStamp => {
                                    return targetStamp.name === stampBegin.name
                                  }
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
                          if (stampEnd) {
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
