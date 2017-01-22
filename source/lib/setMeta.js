import fs from 'fs-extra'
import { getDelimiters } from 'block-js'
import { stripIndents } from 'common-tags'

import Promise from './promise.js'

const stat = Promise.promisify(fs.stat)
const outputFile = Promise.promisify(fs.outputFile)

function metaToString (meta, delimiters) {
  let replacements = {}
  let result = ''
  if (meta.replacements) {
    replacements = Object.keys(meta.replacements).map(
      replacementKey => {
        return `${replacementKey}, ${meta.replacements[replacementKey].regex}, ${meta.replacements[replacementKey].value}`
      }
    ).join('\n')

    result += stripIndents `
      ${delimiters.start} ph replacements ${delimiters.end}
      ${delimiters.start} ${replacements} ${delimiters.end}
      ${delimiters.start} endph ${delimiters.end}` + '\n'
  }

  let stamps = []
  if (meta.stamps) {
    stamps = meta.stamps.toString()
    result += stripIndents `
      ${delimiters.start} ph stamps ${delimiters.end}
      ${delimiters.start} ${stamps} ${delimiters.end}
      ${delimiters.start} endph ${delimiters.end}` + '\n'
  }
  return result
}

export default function setMeta (filePath, meta, options) {
  return stat(filePath)
    .catch(() => outputFile(filePath, metaToString(meta, getDelimiters(filePath))))
}
