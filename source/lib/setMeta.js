import fs from 'fs-extra'
import Promise from './promise.js'
import { stripIndents } from 'common-tags'

const stat = Promise.promisify(fs.stat)
const outputFile = Promise.promisify(fs.outputFile)

function metaToString (meta) {
  let replacements = {}
  let result = ''
  if (meta.replacements) {
    replacements = Object.keys(meta.replacements).map(
      replacementKey => {
        return `${replacementKey}, ${meta.replacements[replacementKey].regex}, ${meta.replacements[replacementKey].value}`
      }
    ).join('\n')

    result += stripIndents `
      /* ph replacements */
      /* ${replacements} */
      /* endph */` + '\n'
  }

  let stamps = []
  if (meta.stamps) {
    stamps = meta.stamps.toString()
    result += stripIndents `
      /* ph stamps */
      /* ${stamps} */
      /* endph */` + '\n'
  }
  return result
}

export default function setMeta (filePath, meta, options) {
  return stat(filePath)
    .catch(() => outputFile(filePath, metaToString(meta)))
}
