/* eslint-disable no-console */
import synchronize from './synchronize.js'
import getMeta from './getMeta.js'
import setMeta from './setMeta.js'
import cleanTo from './cleanTo.js'
import Promise from './promise.js'
import path from 'path'

const debug = require('debug')('nicosommi.gddify.gene-js.sourceCodeFile')

export default class SourceCodeFile {
  constructor (name, filePath, options) {
    this.name = name
    this.path = filePath
    this.options = options
  }

  getMeta () {
    return getMeta(this.getFullPath(), this.options)
      .then((fileMetaInfo) => {
        let { replacements, stamps } = fileMetaInfo

        return Promise.resolve({
          name: this.name,
          path: this.path,
          replacements,
          stamps
        })
      })
  }

  setMeta (metaObject) {
    return setMeta(this.getFullPath(), metaObject, this.options)
  }

  getFullPath () {
    let basePath = ''
    if (this.options && this.options.basePath) {
      basePath = this.options.basePath
    }
    return path.normalize(path.join(basePath, this.path))
  }

  getFullCleanPath () {
    return path.normalize(path.join(this.options.basePath, this.options.cleanPath, this.path))
  }

  synchronizeWith (rootSourceCodeFile) {
    if (!rootSourceCodeFile.path) {
      return Promise.reject(new Error(`No path defined for root file ${rootSourceCodeFile.name}`))
    } else {
      const rootFullPath = rootSourceCodeFile.getFullPath()
      const targetFullPath = this.getFullPath()
      debug(`Syncing ${rootFullPath} with ${targetFullPath}...`)
      return synchronize(rootFullPath, targetFullPath, this.options)
    }
  }

  clean (dirtyPhs) {
    if (!this.options.cleanPath) {
      return Promise.reject(new Error(`No clean path defined for file ${this.name}`))
    } else if (!this.path) {
      return Promise.reject(new Error(`No path defined for file ${this.name}`))
    } else {
      this.options.dirtyPhs = dirtyPhs || []
      const rootFullPath = this.getFullPath()
      const targetFullPath = this.getFullCleanPath()
      debug(`Cleaning ${rootFullPath} to ${targetFullPath}...`)
      return cleanTo(rootFullPath, targetFullPath, this.options)
    }
  }
}
