import SwComponent from '../source/lib/swComponent.js'
import Promise from '../source/lib/promise.js'
import sinon from 'sinon'

describe('SwComponent', () => {
  let swComponent,
    name,
    type,
    options,
    synchronizeSpy,
    constructorSpy,
    addSourceCodeFilesSpy,
    cleanToSpy,
    getMetaSpy

  class SwBlockClass {
    constructor () {
      constructorSpy.apply(this, arguments)
      this.name = arguments[0]
      this.type = arguments[1]
      this.version = arguments[2]
      this.options = arguments[3]
    }

    addSourceCodeFiles (...args) {
      addSourceCodeFilesSpy.apply(this, args)
    }

    getMeta () {
      return getMetaSpy()
    }

    clean () {
      cleanToSpy()
    }

    synchronizeWith () {
      return synchronizeSpy()
    }
  }

  beforeEach(() => {
    name = 'fruitService'
    type = 'service'
    options = {}
    getMetaSpy = sinon.spy(() => Promise.resolve(
      {
        name: 'backboneui',
        type: 'uimvc',
        version: '0.0.1',
        sourceCodeFiles: []
      }
    ))
    synchronizeSpy = sinon.spy(() => Promise.resolve())
    constructorSpy = sinon.spy(() => Promise.resolve())
    addSourceCodeFilesSpy = sinon.spy(() => Promise.resolve())
    cleanToSpy = sinon.spy(() => Promise.resolve())
    SwComponent.__Rewire__('SwBlock', SwBlockClass)
    swComponent = new SwComponent(name, type, options)
  })

  describe('constructor(name, type, options)', () => {
    it('should set the source block name', () => {
      swComponent.name.should.equal(name)
    })

    it('should set the block type', () => {
      swComponent.type.should.equal(type)
    })

    it('should set the options if provided', () => {
      swComponent.options.should.eql(options)
    })
  })

  describe('(adding blocks files)', () => {
    describe('.addSwBlock(source, clean, options)', () => {
      let swBlockName,
        swBlockType,
        swBlockVersion,
        swBlockObj

      beforeEach(() => {
        swBlockName = ''
        swBlockVersion = '0.0.1'
        type = ''
        swBlockObj = {name: swBlockName, swBlockType, version: swBlockVersion}
        swComponent.addSwBlock(swBlockObj)
      })

      it('should add the source file to the array', () => {
        swComponent.swBlocks.should.eql([new SwBlockClass(swBlockName, swBlockType, swBlockVersion, options)])
      })

      it('should pass the option properties to the source code options along with the specific ones', () => {
        swComponent = new SwComponent(name, type, { aproperty: 1, onemore: 2 })
        swComponent.addSwBlock({name: 'aname', swBlockType, swBlockVersion, options: { onemore: 3, another: 4 }})
        swComponent.swBlocks[0].options.should.eql({ aproperty: 1, onemore: 2, another: 4 })
      })
    })

    describe('.addSwBlocks(array)', () => {
      let inputArray,
        expectedArray

      beforeEach(() => {
        const firstElement = { name: 'firstElement', type: 'sourceCodeFileExample', version: '0.0.1', options: {} }
        const secondElement = { name: 'secondElement', type: 'oneMoreSwBlockExample', version: '0.0.1', options: {} }
        inputArray = []
        inputArray.push(firstElement)
        inputArray.push(secondElement)

        expectedArray = []
        expectedArray.push(new SwBlockClass(firstElement.name, firstElement.type, firstElement.version, options))
        expectedArray.push(new SwBlockClass(secondElement.name, secondElement.type, secondElement.version, options))
        swComponent.addSwBlocks(inputArray)
      })

      it('should add the source file to the array', () => {
        swComponent.swBlocks.should.eql(expectedArray)
      })
    })
  })

  describe('(methods)', () => {
    let inputArray,
      sourceSwComponent

    beforeEach(() => {
      const firstElement = { name: 'firstElement', type: 'sourceCodeFileExample', version: '0.0.1', options: {} }
      const secondElement = { name: 'secondElement', type: 'oneMoreSourceCodeFileExample', version: '0.0.1', options: {} }
      inputArray = []
      inputArray.push(firstElement)
      inputArray.push(secondElement)

      sourceSwComponent = new SwComponent('rootFruitService', 'basket', {})
    })

    describe('.synchronizeWith(rootSwBlock)', () => {
      beforeEach(() => {
        sourceSwComponent.addSwBlocks(inputArray)
        swComponent.addSwBlocks(inputArray)
      })

      it('should call the synchronize method when synchronize sourceCodeFile', () => {
        return swComponent.synchronizeWith(sourceSwComponent.swBlocks[0])
          .then(() => {
            synchronizeSpy.callCount.should.equal(1)
            return Promise.resolve()
          })
      })

      it('should add the new blocks using the supplied base type and the base name', () => {
        sourceSwComponent.addSwBlock({
          name: 'thirdElement', type: 'thirdType', version: '0.0.1'
        })
        return swComponent.synchronizeWith(sourceSwComponent)
          .then(() => {
            constructorSpy.getCall(4).args.should.eql(['thirdElement', 'thirdType', '0.0.1', options])
            return Promise.resolve()
          })
      })
    })

    describe('.clean()', () => {
      beforeEach(() => {
        sourceSwComponent.addSwBlocks(inputArray)
        swComponent.addSwBlocks(inputArray)
      })

      it('should provide the clean method', () => {
        return swComponent.clean()
          .then(() => {
            cleanToSpy.callCount.should.equal(2)
          })
      })
    })

    describe('.getMeta', () => {
      beforeEach(() => {
        swComponent = new SwComponent(name, type, options)
        swComponent.addSwBlocks([{name: 'backboneui', type: 'uimvc', version: '0.0.1'}, {name: 'reactui', type: 'uiv', version: '0.0.1'}])
      })

      it('should allow to retrieve the meta information for all his block genes', () => {
        return swComponent.getMeta()
          .should.be.fulfilledWith({
            name,
            type,
            swBlocks: [{
              name: 'backboneui',
              type: 'uimvc',
              version: '0.0.1',
              sourceCodeFiles: []
            },
            {
              name: 'backboneui',
              type: 'uimvc',
              version: '0.0.1',
              sourceCodeFiles: []
            }]
          })
      })
    })
  })
})
