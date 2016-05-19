import cleanTo from '../source/lib/cleanTo.js'
import Promise from '../source/lib/promise.js'
import fs from 'fs-extra'

const readFile = Promise.promisify(fs.readFile)

function cleanToMechanism (source, target, expectation, options, customAssertion = false) {
  const sourceComplete = `${__dirname}/../fixtures/sourceCodeFiles/sources/${source}`
  const expectationComplete = `${__dirname}/../fixtures/sourceCodeFiles/expectations/${expectation}`
  const targetResult = `${__dirname}/../fixtures/sourceCodeFiles/results/${target}`

  let targetContents

  // read source
  const processPromise = readFile(sourceComplete)
    // synchronize target
    .then(() => cleanTo(sourceComplete, targetResult, options))
    // read new target
    .then(() => readFile(targetResult))
    .then((contents) => {
      targetContents = contents.toString('utf8')
    })
    // read expectation
    .then(() => readFile(expectationComplete))
  if (!customAssertion) {
    return processPromise.then((contents) => contents.toString('utf8').should.eql(targetContents))
  } else {
    return processPromise
  }
}

describe('.cleanTo(targetPath)', () => {
  it('should generate a cleaned version of the gene to a custom target path', () => {
    return cleanToMechanism('apple.js', 'cleanedApple.js', 'cleanedApple.js')
  })

  it('should accept a dirty ph array', () => {
    return cleanToMechanism('apple.js', 'cleanedApple.js', 'cleanedApple.js', { dirtyPhs: ['anextraph'] })
  })

  it('should create the path if it does not exists', () => {
    return cleanToMechanism('apple.js', 'newFolder/ToIt/cleanedApple.js', 'cleanedApple.js')
  })

  it('should throw an error if the source does not exist', () => {
    return cleanToMechanism('apple.unexisting.js', 'cleanedApple.js', 'cleanedApple.js', null, true)
      .should.be.rejectedWith(/ENOENT/)
  })
})
