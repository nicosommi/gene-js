/* eslint-disable no-console */
import chalk from 'chalk'
import SwBlock from './swBlock.js'
import Promise from './promise.js'

export default class SwComponent {
  constructor (name, type, options) {
    this.name = name
    this.type = type
    this.options = options
    this.swBlocks = []
  }

  addSwBlock (swBlock) {
    const newOptions = Object.assign({}, swBlock.options, this.options) // passing options down through
    const newSwBlock = new SwBlock(swBlock.name, swBlock.type, swBlock.version, newOptions)
    newSwBlock.addSourceCodeFiles(swBlock.sourceCodeFiles)
    this.swBlocks.push(newSwBlock)
    return newSwBlock
  }

  addSwBlocks (swBlocks) {
    swBlocks.forEach(swBlock => this.addSwBlock(swBlock))
  }

  getMeta () {
    return Promise.all(this.swBlocks.map(swBlock => {
      return swBlock.getMeta()
    }))
      .then(results => {
        return Promise.resolve({
          name: this.name,
          type: this.type,
          swBlocks: results
        })
      })
  }

  synchronizeWith (rootBlock) {
    console.log(chalk.magenta(`synchronize component started`))
    let promise

    // find this.swBlock
    const matchingSwBlocks = this.swBlocks.filter(swBlock => (swBlock.type === rootBlock.type))
    if (matchingSwBlocks && matchingSwBlocks.length > 0) {
      console.log(chalk.magenta(`going through existing blocks`))
      promise = Promise.all(
        matchingSwBlocks.map(matchingSwBlock => matchingSwBlock.synchronizeWith(rootBlock))
      )
    } else {
      console.log(chalk.magenta(`creating a new block named ${rootBlock.name} of type ${rootBlock.type}`))
      const newSwBlock = this.addSwBlock({
        name: rootBlock.name,
        type: rootBlock.type,
        version: '0.0.0',
        options: this.options,
        sourceCodeFiles: []
      })
      promise = newSwBlock.synchronizeWith(rootBlock)
    }

    return promise
  }

  clean (dirtyPhs) {
    const promises = this.swBlocks.map(swBlock => swBlock.clean(dirtyPhs))
    return Promise.all(promises)
  }
}
