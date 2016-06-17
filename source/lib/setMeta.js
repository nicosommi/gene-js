import fs from 'fs-extra'
import Promise from './promise.js'
import { stripIndents } from 'common-tags'

const stat = Promise.promisify(fs.stat)
const outputFile = Promise.promisify(fs.outputFile)

function metaToString (meta) {
  const replacements = Object.keys(meta.replacements).map(
    replacementKey => {
      return `${replacementKey}, ${meta.replacements[replacementKey].regex}, ${meta.replacements[replacementKey].value}`
    }
  ).join('\n')
  const ignoringStamps = meta.ignoringStamps.join(', ')
  return stripIndents `
    /* ph replacements */
    ${replacements}
    /* endph */
    /* ph ignoringStamps */
    ${ignoringStamps}
    /* endph */` + '\n'
}

export default function setMeta (filePath, meta) {
  return stat(filePath)
    .catch(() => outputFile(filePath, metaToString(meta)))
}
