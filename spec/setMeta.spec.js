import setMeta from '../source/lib/setMeta.js'
import fs from 'fs-extra'
import Promise from '../source/lib/promise.js'

const remove = Promise.promisify(fs.remove)
const readFile = Promise.promisify(fs.readFile)

describe('setMeta', () => {
  let newMeta,
    filePath,
    expectedContent

  beforeEach(() => {
    newMeta = {
      replacements: {
        className: { regex: '/Banana/g', value: 'Banana' }
      },
      ignoringStamps: ['throwAway']
    }
    expectedContent = '/* ph replacements */\n/* className, /Banana/g, Banana */\n/* endph */\n/* ph ignoringStamps */\n/* throwAway */\n/* endph */\n'
    filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/anewfile.js`
  })

  describe('(when new file)', () => {
    beforeEach(() => {
      return setMeta(filePath, newMeta)
    })

    afterEach(() => {
      return remove(filePath)
    })

    it('should the new content properly', () => {
      return readFile(filePath, 'utf8')
        .should.be.fulfilledWith(expectedContent)
    })
  })

  describe('(when file exists)', () => {
    beforeEach(() => {
      filePath = `${__dirname}/../fixtures/sourceCodeFiles/sources/banana.js`
      return readFile(filePath, 'utf8')
        .then(content => {
          expectedContent = content
        })
        .then(() => setMeta(filePath, newMeta))
    })

    it('should leave it as is', () => {
      return readFile(filePath, 'utf8')
        .should.be.fulfilledWith(expectedContent)
    })
  })

  describe('(when meta data is undefined)', () => {
    beforeEach(() => {
      newMeta = {
        replacements: undefined,
        ignoringStamps: undefined
      }
      expectedContent = ''
      return setMeta(filePath, newMeta)
    })

    afterEach(() => {
      return remove(filePath)
    })

    it('should not create place holders for them', () => {
      return readFile(filePath, 'utf8')
        .should.be.fulfilledWith(expectedContent)
    })
  })
})
