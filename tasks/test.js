/* ph ignoringStamps */
/* webapp, service */
/* endph */
import gulp from 'gulp'
import mocha from 'gulp-mocha'
import istanbul from 'gulp-babel-istanbul'
import 'should'

const paths = {
  sourceCode: './source/**/*.js',
  spec: './spec/**/*.spec.js'
}

function defineTestTask (taskName, reporters) {
  gulp.task(taskName, (cb) => {
    gulp.src(paths.sourceCode)
      .pipe(istanbul({
        includeUntested: true
      })) // Covering files
      .pipe(istanbul.hookRequire()) // Force `require` to return covered files
      .on('finish', () => {
        gulp.src(paths.spec)
          .pipe(mocha())
          .pipe(istanbul.writeReports({dir: `${__dirname}/../.coverage`, reporters})) // Creating the reports after tests ran
          .pipe(istanbul.enforceThresholds({ thresholds: { global: 100 } })) // Enforce a coverage of at least 90%
          .on('end', cb)
      })
  })
}

function defineWatchTask (taskName, testTasks, dependencies, directories) {
  gulp.task(taskName, dependencies, () => {
    gulp.watch(directories, testTasks)
  })
}

/* stamp webapp */
/* endstamp */
/* stamp lib */
defineTestTask('test-lib', ['text-summary', 'lcovonly'])
defineTestTask('test-coverage', ['text', 'html'])
defineWatchTask('test-watch', ['test-coverage'], ['suppress-errors'], ['./source/**/*', './spec/**/*'])
gulp.task('test', ['test-lib'])
/* endstamp */
/* stamp service */
/* endstamp */
