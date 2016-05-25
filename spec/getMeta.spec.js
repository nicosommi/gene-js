import getMeta from '../source/lib/getMeta.js'

describe('getMeta', () => {
  let metaExpected,
    filePath

  beforeEach(() => {
    metaExpected = {
      replacements: {
        className: { regex: '/Banana/g', value: 'Banana' }
      },
      ignoringStamps: ['throwAway']
    }
    filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/banana.js`
  })

  it('should return a proper meta object from a file', () => {
    return getMeta(filePath)
      .should.be.fulfilledWith(metaExpected)
  })

  it('should return a proper meta object from the options', () => {
    const opinnionated = { replacements: [1], ignoringStamps: [2, 3] }
    return getMeta(filePath, opinnionated)
      .should.be.fulfilledWith(opinnionated)
  })

  it('should return a proper meta object from the options even if just ignoringStamps are provided', () => {
    const opinnionated = { replacements: undefined, ignoringStamps: [2] }
    return getMeta(filePath, opinnionated)
      .should.be.fulfilledWith(opinnionated)
  })

  it('should return a proper meta object from the options even if just replacements are provided', () => {
    const opinnionated = { replacements: [1], ignoringStamps: undefined }
    return getMeta(filePath, opinnionated)
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
            replacements: { },
            ignoringStamps: []
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
              replacements: {},
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
              replacements: {},
              ignoringStamps: []
            })
        })
      })

      describe('(empty)', () => {
        beforeEach(() => {
          filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/orange.js`
        })

        it('should return ok when no meta in file', () => {
          return getMeta(filePath)
            .should.be.fulfilledWith({
              replacements: {
                className: {
                  regex: '/Orange/g',
                  value: 'Orange'
                }
              },
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
