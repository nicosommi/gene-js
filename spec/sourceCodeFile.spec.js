import SourceCodeFile from '../source/lib/sourceCodeFile.js'
import Promise from '../source/lib/promise.js'
import fs from 'fs-extra'
import del from 'del'
import sinon from 'sinon'

const copyFile = Promise.promisify(fs.copy)

describe('SourceCodeFile', () => {
  let sourceCodeFile,
    sourceCodeFileName,
    sourceSourceCodeFile,
    source,
    clean,
    sourceTemplate,
    target,
    targetTemplate,
    options

  beforeEach(() => {
    source = `apple.js`
    sourceTemplate = `${__dirname}/../fixtures/sourceCodeFiles/sources/apple.js`
    target = `${__dirname}/../fixtures/sourceCodeFiles/results/banana.js`
    targetTemplate = `${__dirname}/../fixtures/sourceCodeFiles/sources/banana.js`

    options = {
      force: true, basePath: '${__dirname}/../fixtures/sourceCodeFiles/results/', cleanPath: 'clean'
    }

    sourceCodeFileName = 'sourceCodeFileName'

    sourceCodeFile = new SourceCodeFile(sourceCodeFileName, target, options)
    sourceSourceCodeFile = new SourceCodeFile('rootFileName', source, options)

    return Promise.all(
      [
        copyFile(sourceTemplate, source),
        copyFile(targetTemplate, target)
      ]
    )
  })

  afterEach(done => {
    del(source)
      .then(() => {
        del(target)
          .then(() => done())
      })
  })

  describe('constructor(source, target, options)', () => {
    it('should set the source sourceCodeFile file name', () => {
      sourceCodeFile.name.should.equal(sourceCodeFileName)
    })

    it('should set the source sourceCodeFile file path', () => {
      sourceCodeFile.path.should.equal(target)
    })

    it('should set the options if provided', () => {
      sourceCodeFile.options.should.eql(options)
    })
  })

  describe('(methods)', () => {
    let synchronizeSpy
    let cleanToSpy

    beforeEach(() => {
      synchronizeSpy = sinon.spy(() => Promise.resolve())
      cleanToSpy = sinon.spy(() => Promise.resolve())
      SourceCodeFile.__Rewire__('synchronize', synchronizeSpy)
      SourceCodeFile.__Rewire__('cleanTo', cleanToSpy)
    })

    describe('.clean', () => {
      it('should provide the clean method', () => {
        return sourceCodeFile.clean()
          .then(() => {
            cleanToSpy.calledWith(source, clean, options).should.be.true
          })
      })

      it('should throw if there is no path', () => {
        delete sourceCodeFile.path
        return sourceCodeFile.clean()
          .should.be.rejectedWith(/No path defined for file sourceCodeFileName/)
      })

      it('should throw if there is no cleanPath', () => {
        delete sourceCodeFile.options.cleanPath
        return sourceCodeFile.clean()
          .should.be.rejectedWith(/No clean path defined for file sourceCodeFileName/)
      })
    })

    describe('.synchronize', () => {
      it('should call the synchronize method when synchronize sourceCodeFile', () => {
        return sourceCodeFile.synchronizeWith(sourceSourceCodeFile)
          .then(() => {
            synchronizeSpy.calledWith(source, target, options).should.be.true
            return Promise.resolve()
          })
      })

      it('should throw if there is no path', () => {
        delete sourceSourceCodeFile.path
        return sourceCodeFile.synchronizeWith(sourceSourceCodeFile)
          .should.be.rejectedWith(/No path defined for root file rootFileName/)
      })
    })

    describe('.getMeta', () => {
      it('should return undefined if there is no meta info', () => {
        const path = `${__dirname}/../fixtures/sourceCodeFiles/sources/emptyVegetable.js`
        sourceCodeFile = new SourceCodeFile(sourceCodeFileName, path)
        return sourceCodeFile.getMeta()
          .should.be.fulfilledWith({
            name: sourceCodeFileName,
            path,
            replacements: {},
            ignoringStamps: []
          })
      })

      it('should allow to retrieve the meta information from the file', () => {
        return sourceCodeFile.getMeta()
          .should.be.fulfilledWith({
            name: sourceCodeFileName,
            path: target,
            replacements: {
              className: {
                regex: '/Banana/g',
                value: 'Banana'
              }
            },
            ignoringStamps: ['throwAway']
          })
      })
    })

    describe('.setMeta', () => {
      let setMetaSpy,
        filePath,
        metaObject

      beforeEach(() => {
        setMetaSpy = sinon.spy(() => Promise.resolve())
        SourceCodeFile.__Rewire__('setMeta', setMetaSpy)
        filePath = 'apath'
        metaObject = { replacements: {}, ignoringStamps: [] }
        sourceCodeFile = new SourceCodeFile(sourceCodeFileName, filePath)
        return sourceCodeFile.setMeta(metaObject)
      })

      it('should call setMeta with the proper parameters', () => {
        sinon.assert.calledWith(setMetaSpy, filePath, metaObject)
      })
    })
  })
})
