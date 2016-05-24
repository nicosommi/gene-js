/* eslint-disable no-console */
import SourceCodeFile from './sourceCodeFile.js'
import Promise from './promise.js'
import path from 'path'
import semver from 'semver'
import chalk from 'chalk'

export default class SwBlock {
  constructor (name, type, version, options) {
    this.name = name
    this.type = type
    this.version = version
    this.options = options
    this.sourceCodeFiles = []
  }

  addSourceCodeFile (sourceCodeFile) {
    const newOptions = Object.assign({}, sourceCodeFile.options, this.options) // passing options down through
    const newSourceCodeFile = new SourceCodeFile(sourceCodeFile.name, sourceCodeFile.path, newOptions)
    this.sourceCodeFiles.push(newSourceCodeFile)
    return newSourceCodeFile
  }

  addSourceCodeFiles (sourceCodeFiles) {
    sourceCodeFiles.forEach(sourceCodeFile => this.addSourceCodeFile(sourceCodeFile))
  }

  getMeta () {
    return Promise.all(this.sourceCodeFiles.map(sourceCodeFile => sourceCodeFile.getMeta()))
      .then(results => {
        return Promise.resolve({
          name: this.name,
          type: this.type,
          version: this.version,
          sourceCodeFiles: results
        })
      })
  }

  synchronizeWith (rootBlock) {
    return new Promise(
      (resolve, reject) => {
        console.log(chalk.magenta(`checking block versions`))
        if (semver.gte(rootBlock.version, this.version)) {
          console.log(chalk.magenta(`syncing block to version ${rootBlock.version}`))
          const errors = []

          const promises = rootBlock.sourceCodeFiles.map(
            rootSourceCodeFile => {
              console.log(chalk.magenta(`syncing file ${rootSourceCodeFile.path}`))
              // find this.sourceCodeFile
              const matchingSourceCodeFile = this.sourceCodeFiles.find(sourceCodeFile => (sourceCodeFile.name === rootSourceCodeFile.name))
              if (matchingSourceCodeFile) {
                // add promess to process list
                return matchingSourceCodeFile.synchronizeWith(rootSourceCodeFile)
              } else {
                // create a potential promess to create it
                let newSourceCodeFile
                if (this.options && this.options.basePath) {
                  if (rootSourceCodeFile.path) {
                    newSourceCodeFile = this.addSourceCodeFile({
                      name: rootSourceCodeFile.name,
                      path: path.normalize(`${rootSourceCodeFile.path}`),
                      options: this.options
                    })
                    return newSourceCodeFile.synchronizeWith(rootSourceCodeFile)
                  } else {
                    errors.push(new Error(`ERROR: there is no path provided for the source file ${rootSourceCodeFile.name} on the block of name ${rootBlock.name} and type ${rootBlock.type}. Please ammend that and try again.`))
                  }
                } else {
                  errors.push(new Error(`ERROR: there is no base path provided for the block ${this.name}, so the new source code file ${rootSourceCodeFile.name} cannot be added.`))
                }
              }
            }
          )

          // check processed list against sourceCodeFiles
          if (errors.length === 0) {
            console.log(chalk.magenta(`executing sync tasks...`))
            Promise.all(promises).then(() => {
              this.version = rootBlock.version
              console.log(chalk.green(`finished with no errors, now version ${this.version}.`))
              resolve()
            })
            .catch(
              error => {
                console.log(chalk.red(`error ${error.message}.`))
                reject(error)
              }
            )
          } else {
            console.log(chalk.red(`errors on files ${errors}`))
            const errorMessage = errors.reduce((message, currentError) => {
              if (message) {
                return `${message}\n${currentError.message}`
              } else {
                return currentError.message
              }
            })
            reject(new Error(errorMessage))
          }
        } else if (semver.eq(rootBlock.version, this.version)) {
          reject(new Error(`WARNING: The root block ${rootBlock.name} - v${rootBlock.version} is at the same version as the destination (${this.name} - v${this.version}). So the block synchronization is omitted.`))
        } else {
          reject(new Error(`WARNING: The root block ${rootBlock.name} - v${rootBlock.version} of type ${rootBlock.type} is older than the destination (${this.name} - v${this.version}). Block synchronization aborted.`))
        }
      }
    )
  }

  clean (dirtyPhs) {
    const promises = this.sourceCodeFiles.map(sourceCodeFile => sourceCodeFile.clean(dirtyPhs))
    return Promise.all(promises)
  }
}
