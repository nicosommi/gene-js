/* ph replacements */
/* name, /'name': 'gene-js'/g, 'name': 'gene-js' */
/* version, /'version': '\bv?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b'/ig, 'version': '0.0.1' */
/* main, /'main': '[a-zA-Z\.\/]+'/ig, 'main': 'index\.js' */
/* description, /'description': 'a\ gdd\ utility'/g, 'description': 'a gdd utility' */
/* license, /MIT/g, MIT */
/* homepage, /'homepage': '[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)'/g, 'homepage': 'https://github.com/nicosommi/gene-js' */
/* url, /'url': 'git+[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)'/g, 'url': 'git+https://github.com/nicosommi/gene-js\.git' */
/* endph */
/* ph ignoringStamps */
/*
componentCliDeps
*/
/* endph */

module.exports =
{
  'name': 'gene-js',
  'version': '0.0.1',
  'description': 'a gdd utility',
  'main': 'index.js',
  'standard': {
    'globals': [
      'describe',
      'context',
      'before',
      'beforeEach',
      'after',
      'afterEach',
      'it',
      'expect'
    ]
  },
  /* ph bin */
  /* endph */
  'scripts': {
    /* ph componentScripts */
    /* endph */
    'gddify': 'gddify',
    'test': 'gulp test',
    'build': 'gulp build',
    'coverage': 'gulp test-coverage',
    'watch': 'gulp test-watch',
    'gulp': 'gulp'
  },
  'author': 'nicosommi',
  'license': 'MIT',
  'dependencies': {
    /* ph componentDependencies */
    'block-js': 'file:../block-js',
    'regex-parser': '^2.2.1',
    'semver': '^5.1.0',
    'fs-extra': '^0.26.7',
    /* endph */
    /* stamp componentCliDeps */
    /* endstamp */
    /* stamp promises */
    'bluebird': '^3.3.5',
    /* endstamp */
    /* stamp es6 */
    'incognito': '^0.1.4',
    /* endstamp */
    /* stamp debuggable */
    'debug': '^2.2.0'
    /* endstamp */
  },
  'devDependencies': {
    /* ph componentDevDependencies */
    /* endph */
    /* stamp unitTest */
    'sinon': '^1.17.3',
    'should': '^8.2.2',
    'mocha': '^2.2.5',
    /* endstamp */
    /* stamp transpiler */
    'babel': '^6.5.2',
    'babel-core': '^6.6.4',
    'babel-eslint': '^3.1.30',
    'babel-plugin-rewire': '^1.0.0-rc-1',
    'babel-preset-es2015': '^6.6.0',
    /* endstamp */
    /* stamp componentBuild */
    'gulp': '^3.9.1',
    'gulp-babel': '^6.1.2',
    'gulp-babel-istanbul': '^1.0.0',
    'gulp-istanbul': '^0.10.3',
    'gulp-mocha': '^2.1.3',
    'gulp-util': '^3.0.6',
    'run-sequence': '^1.1.5',
    'del': '^2.2.0',
    /* endstamp */
    /* stamp componentUtils */
    'coveralls': '^2.11.2'
    /* endstamp */
  },
  'repository': {
    'type': 'git',
    'url': 'git+https://github.com/nicosommi/gddify.git'
  },
  'readmeFilename': 'README.md',
  'contributors': [],
  'homepage': 'https://github.com/nicosommi/gddify'
}
