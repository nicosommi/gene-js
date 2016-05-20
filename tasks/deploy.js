import gulp from 'gulp'
import runSequence from 'run-sequence'
import Api from '../source/lib/api/v1.js'

gulp.task('deploy-functions', (callback) => {
  const api = new Api()
  api.defineLambdas()
  api.deploy(callback)
})

gulp.task('deploy-resources', (callback) => {
  const api = new Api()
  const stageName = 'production'
  const stageAlias = 'production'
  api.defineResources(stageName, stageAlias)
  api.deploy(callback)
})

gulp.task('deploy', ['build'], cb => {
  runSequence(
    'deploy-functions',
    'deploy-resources',
    cb
  )
})
