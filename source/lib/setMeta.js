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

  let ignoringStamps = []
  if (meta.ignoringStamps) {
    ignoringStamps = meta.ignoringStamps.join(', ')
    result += stripIndents `
      /* ph ignoringStamps */
      /* ${ignoringStamps} */
      /* endph */` + '\n'
  }
  return result
}

export default function setMeta (filePath, meta) {
  console.log('set Meta', {filePath})
  return stat(filePath)
    .catch(() => outputFile(filePath, metaToString(meta)))
}
