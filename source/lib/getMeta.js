import Blocks from 'block-js'
import fs from 'fs-extra'
import Promise from './promise.js'

const stat = Promise.promisify(fs.stat)

function cleanContent (content, dirtyStrings) {
  dirtyStrings.forEach((dirtyString) => {
    content = content.replace(dirtyString, '')
  })
  return content
}

function takeReplacements (blocks, commentStringStart, commentStringEnd) {
  const replacementsPh = blocks.find(targetBlock => (targetBlock.name === 'replacements'))
  if (replacementsPh) {
    const replacements = {}
    if (replacementsPh.content) {
      const replacementLines = replacementsPh.content.split('\n')
      replacementLines.forEach(
        replacementLine => {
          const tokens = cleanContent(replacementLine, [commentStringStart, commentStringEnd])
            .split(', ')
            .map(token => token.trim())
          const name = tokens[0]
          const regex = tokens[1]
          const value = tokens[2]
          replacements[name] = {
            regex, value
          }
        }
      )
      return replacements
    } else {
      return {}
    }
  } else {
    return {}
  }
}

function takeIgnoringStamps (blocks, commentStringStart, commentStringEnd) {
  const ignoringStampsPh = blocks.find(targetBlock => (targetBlock.name === 'ignoringStamps'))
  if (ignoringStampsPh) {
    let ignoringStamps = []
    if (ignoringStampsPh.content) {
      const ignoringStampLines = ignoringStampsPh.content.split('\n')
      ignoringStampLines.forEach(
        ignoringStampLine => {
          const tokens = cleanContent(ignoringStampLine, [commentStringStart, commentStringEnd])
            .split(',')
            .map(token => token.trim())
          ignoringStamps = ignoringStamps.concat(tokens)
        }
      )
      return ignoringStamps
    } else {
      return []
    }
  } else {
    return []
  }
}

export function takeMeta (blocks, commentStringStart, commentStringEnd) {
  const options = {}
  options.replacements = takeReplacements(blocks, commentStringStart, commentStringEnd)
  options.ignoringStamps = takeIgnoringStamps(blocks, commentStringStart, commentStringEnd)
  return options
}

export function getBlocks (filePath, options) {
  let delimiters
  if (options) {
    delimiters = options.delimiters
  }

  // TODO: suppport block array name on blocks to reduce file reading
  const phsBlocksClass = new Blocks(filePath, 'ph', delimiters)
  const stampsBlocksClass = new Blocks(filePath, 'stamp', delimiters)

  return Promise.props({
    phBlocks: phsBlocksClass.extractBlocks(),
    stampBlocks: stampsBlocksClass.extractBlocks(),
    commentStringStart: phsBlocksClass.startBlockString,
    commentStringEnd: phsBlocksClass.endBlockString
  })
}

export default function getMeta (filePath, options) {
  return new Promise(
    (resolve) => {
      const emptyMetaInfo = {
        replacements: {},
        ignoringStamps: []
      }

      return stat(filePath)
        .then(
          () => {
            return getBlocks(filePath, options)
              .then((results) => {
                let metaInfo = emptyMetaInfo

                if (!options || (!options.replacements && !options.ignoringStamps)) {
                  metaInfo = takeMeta(results.phBlocks, results.commentStringStart, results.commentStringEnd)
                } else {
                  const { replacements, ignoringStamps } = options
                  Object.assign(metaInfo, {replacements, ignoringStamps})
                }

                resolve(metaInfo)
              })
          },
          () => {
            resolve(emptyMetaInfo)
          }
      )
    }
  )
}
