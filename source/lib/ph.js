import _ from 'incognito'
import Blocks from 'block-js'
import synchronize from './synchronize.js'
import cleanTo from './cleanTo.js'

/*
DEPRECATED: just for backwards compatibility
* placeholder.js is mented to be used in certain blocks on certains files
* in order to improve the development process, then some assumptions were made
*/

export default class Ph {

  constructor (targetFilePath) {
    _(this).targetFilePath = targetFilePath
    _(this).ignoringStamps = []
    _(this).replacements = null
  }

  static refresh (targetFilePath) {
    return new Ph(targetFilePath)
  }

  static using (dirtyFilePath) {
    return new Ph(dirtyFilePath)
  }

  static getPlaceHolders (fileName, customDelimiters) {
    return new Blocks(fileName, 'ph', customDelimiters)
  }

  static getStamps (fileName, customDelimiters) {
    return new Blocks(fileName, 'stamp', customDelimiters)
  }

  withThisDelimiters (start, end) {
    _(this).customDelimiters = {
      start, end
    }
    return this
  }

  replacing (replacementsObject) {
    _(this).replacements = replacementsObject
    return this
  }

  ignoringStamps (stampsToIgnore) {
    _(this).ignoringStamps = stampsToIgnore
    return this
  }

  cleanTo (cleanFilePath, callback) {
    const options = {
      delimiters: _(this).customDelimiters,
      replacements: _(this).replacements,
      ignoringStamps: _(this).ignoringStamps
    }
    cleanTo(_(this).targetFilePath, cleanFilePath, options)
      .then(() => callback())
      .catch(error => callback(error))
  }

  with (templateFilePath, callback) {
    const options = {
      delimiters: _(this).customDelimiters,
      replacements: _(this).replacements,
      ignoringStamps: _(this).ignoringStamps
    }
    synchronize(templateFilePath, _(this).targetFilePath, options)
      .then(() => callback())
      .catch(error => callback(error))
  }
}
