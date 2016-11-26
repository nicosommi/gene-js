import Promise from './promise.js'
import Blocks from 'block-js'
import fs from 'fs-extra'
import readline from 'readline'

const writeFile = Promise.promisify(fs.writeFile)
const ensureFile = Promise.promisify(fs.ensureFile)

export default function cleanTo (source, target, options) {
  return new Promise(
    (resolve, reject) => {
      let delimiters
      let dirtyPhs = [ 'replacements', 'stamps' ]
      if (options) {
        delimiters = options.delimiters
        if (options.dirtyPhs && Array.isArray(dirtyPhs)) {
          dirtyPhs = options.dirtyPhs.concat(dirtyPhs)
        }
      }

      const sourcePhsBlocksClass = new Blocks(source, 'ph', delimiters)
      const sourceStampsBlocksClass = new Blocks(source, 'stamp', delimiters)

      ensureFile(target)
        .then(
          () => {
            Promise.props({
              sourcePhBlocks: sourcePhsBlocksClass.extractBlocks(),
              sourceStampBlocks: sourceStampsBlocksClass.extractBlocks()
            })
              .then(
                (results) => {
                  let blocks = results.sourcePhBlocks
                  blocks = blocks.concat(results.sourceStampBlocks)

                  // read file line by line creating a concrete new file
                  // prepare concrete contents
                  let concreteFileContent = ''
                  // read template file line by line
                  const lineReader = readline.createInterface({ input: fs.createReadStream(source, { encoding: 'utf8' }) })
                  let lineNumber = 0
                  let ignoreLines = false
                  lineReader.on('line',
                    (line) => {
                      lineNumber++
                      const beginPh = blocks
                        .find(
                          currentPh => {
                            return (currentPh.from === lineNumber)
                          }
                      )
                      const endPh = blocks
                        .find(
                          currentPh => {
                            return (currentPh.to === lineNumber)
                          }
                      )

                      // core block to ignore block delimiters and deprecated content
                      if (!beginPh && !endPh && !ignoreLines) {
                        concreteFileContent += `${line}\n`
                      } else if ((beginPh && !ignoreLines) && (beginPh.name === 'deprecated' || dirtyPhs.find(dirtyPhName => (beginPh.name === dirtyPhName)))) {
                        ignoreLines = true
                      } else if (endPh && ignoreLines) {
                        ignoreLines = false
                      }
                    })
                  lineReader.on('close',
                    () => {
                      writeFile(target, concreteFileContent, {encoding: 'utf8'})
                        .then(() => resolve())
                        .catch(reject)
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
