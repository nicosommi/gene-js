import getMeta from '../source/lib/getMeta.js'
import regexParser from 'regex-parser'

describe('getMeta', () => {
  let metaExpected,
    filePath,
    options

  beforeEach(() => {
    metaExpected = {
      replacements: {
        className: { regex: '/Banana/g', value: 'Banana' }
      },
      stamps: regexParser('/^(?!throwAway{1}).*$/')
    }

    options = {
      basePath: `${__dirname}/../`
    }
    filePath = 'fixtures/sourceCodeFiles/sources/banana.js'
  })

  it('should return a proper meta object from a file', () => {
    return getMeta(filePath, options)
      .should.be.fulfilledWith(metaExpected)
  })

  it('should return a proper meta object from the options', () => {
    const opinnionated = { replacements: [1], stamps: [2, 3] }
    options.replacements = opinnionated.replacements
    options.stamps = opinnionated.stamps
    return getMeta(filePath, options)
      .should.be.fulfilledWith(opinnionated)
  })

  it('should return a proper meta object from the options even if just stamps are provided', () => {
    const opinnionated = { replacements: undefined, stamps: [2] }
    options.replacements = opinnionated.replacements
    options.stamps = opinnionated.stamps
    return getMeta(filePath, options)
      .should.be.fulfilledWith(opinnionated)
  })

  it('should return a proper meta object from the options even if just replacements are provided', () => {
    const opinnionated = { replacements: [1], stamps: undefined }
    options.replacements = opinnionated.replacements
    options.stamps = opinnionated.stamps
    return getMeta(filePath, options)
      .should.be.fulfilledWith(opinnionated)
  })

  describe('(non-trivial scenarios)', () => {
    describe('(no meta info)', () => {
      beforeEach(() => {
        filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/emptyVegetable.js`
      })

      it('should return ok when no meta in file', () => {
        return getMeta(filePath)
          .should.be.fulfilledWith({
            replacements: undefined,
            stamps: undefined
          })
      })
    })

    describe('(no replacements info)', () => {
      describe('(abscent)', () => {
        beforeEach(() => {
          filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/frozenBanana.js`
        })

        it('should return ok when no meta in file', () => {
          return getMeta(filePath)
            .should.be.fulfilledWith({
              replacements: undefined,
              stamps: regexParser('/^(?!throwAway{1}).*$/')
            })
        })
      })

      describe('(empty)', () => {
        beforeEach(() => {
          filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/incompleteApple.js`
        })

        it('should return ok when no meta in file', () => {
          return getMeta(filePath)
            .should.be.fulfilledWith({
              replacements: {},
              stamps: regexParser('/^.*$/')
            })
        })
      })
    })

    describe('(no stamps info)', () => {
      describe('(abscent)', () => {
        beforeEach(() => {
          filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/emptyVegetable.js`
        })

        it('should return ok when no meta in file', () => {
          return getMeta(filePath)
            .should.be.fulfilledWith({
              replacements: undefined,
              stamps: undefined
            })
        })
      })

      describe('(empty)', () => {
        beforeEach(() => {
          filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/incompleteApple.js`
        })

        it('should return ok when no meta in file', () => {
          return getMeta(filePath)
            .should.be.fulfilledWith({
              replacements: {},
              stamps: regexParser('/^.*$/')
            })
        })
      })
    })

    describe('file does not exists', () => {
      it('should return empty', () => {
        return getMeta('someunexistingfile.jslaj')
          .should.be.fulfilledWith({
            replacements: {},
            stamps: undefined
          })
      })
    })
  })
})
