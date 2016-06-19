import getMeta from '../source/lib/getMeta.js'

describe('getMeta', () => {
  let metaExpected,
    filePath,
    options

  beforeEach(() => {
    metaExpected = {
      replacements: {
        className: { regex: '/Banana/g', value: 'Banana' }
      },
      ignoringStamps: ['throwAway']
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
    const opinnionated = { replacements: [1], ignoringStamps: [2, 3] }
    options.replacements = opinnionated.replacements
    options.ignoringStamps = opinnionated.ignoringStamps
    return getMeta(filePath, options)
      .should.be.fulfilledWith(opinnionated)
  })

  it('should return a proper meta object from the options even if just ignoringStamps are provided', () => {
    const opinnionated = { replacements: undefined, ignoringStamps: [2] }
    options.replacements = opinnionated.replacements
    options.ignoringStamps = opinnionated.ignoringStamps
    return getMeta(filePath, options)
      .should.be.fulfilledWith(opinnionated)
  })

  it('should return a proper meta object from the options even if just replacements are provided', () => {
    const opinnionated = { replacements: [1], ignoringStamps: undefined }
    options.replacements = opinnionated.replacements
    options.ignoringStamps = opinnionated.ignoringStamps
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
            ignoringStamps: undefined
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
              ignoringStamps: ['throwAway']
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
              ignoringStamps: []
            })
        })
      })
    })

    describe('(no ignoringStamps info)', () => {
      describe('(abscent)', () => {
        beforeEach(() => {
          filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/emptyVegetable.js`
        })

        it('should return ok when no meta in file', () => {
          return getMeta(filePath)
            .should.be.fulfilledWith({
              replacements: undefined,
              ignoringStamps: undefined
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
              ignoringStamps: []
            })
        })
      })
    })

    describe('file does not exists', () => {
      it('should return empty', () => {
        return getMeta('someunexistingfile.jslaj')
          .should.be.fulfilledWith({
            replacements: {},
            ignoringStamps: []
          })
      })
    })
  })
})
