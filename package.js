/* ph replacements */
/* name, /'name': 'gene-js'/g, 'name': 'gene-js' */
/* version, /'version': '\bv?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b'/ig, 'version': '0.0.1' */
/* description, /'description': 'a\ gdd\ utility'/g, 'description': 'a gdd utility' */
/* main, /'main': '[a-zA-Z\.\/]+'/ig, 'main': 'index.js' */
/* license, /MIT/g, MIT */
/* endph */
/* ph ignoringStamps */
/* webapp_scripts, service_scripts */
/* webapp_dependencies, service_dependencies */
/* webapp_devDependencies, service_devDependencies */
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
      'xit',
      'expect'
    ]
  },
  /* ph bin */
  /* endph */
  'scripts': {
    /* ph componentScripts */
    /* endph */
    /* stamp webapp_scripts */
    /* endstamp */
    /* stamp lib_scripts */
    /* endstamp */
    /* stamp service_scripts */
    /* endstamp */
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
    'block-js': '0.0.2',
    'regex-parser': '^2.2.1',
    'semver': '^5.1.0',
    'fs-extra': '^0.26.7',
    /* endph */
    /* stamp webapp_dependencies */
    /* endstamp */
    /* stamp lib_dependencies */
    'incognito': '^0.1.4',
    /* endstamp */
    /* stamp service_dependencies */
    /* endstamp */
    'bluebird': '^3.3.5',
    'debug': '^2.2.0'
  },
  'devDependencies': {
    /* ph componentDevDependencies */
    /* endph */
    /* stamp webapp_devDependencies */
    /* endstamp */
    /* stamp lib_devDependencies */
    'sinon': '^1.17.3',
    'should': '^8.2.2',
    'mocha': '^2.2.5',
    /* endstamp */
    /* stamp service_devDependencies */
    /* endstamp */
    'babel': '^6.5.2',
    'babel-core': '^6.6.4',
    'babel-eslint': '^3.1.30',
    'babel-plugin-rewire': '^1.0.0-rc-1',
    'babel-preset-es2015': '^6.6.0',
    'gulp': '^3.9.1',
    'gulp-babel': '^6.1.2',
    'gulp-babel-istanbul': '^1.0.0',
    'gulp-istanbul': '^0.10.3',
    'gulp-mocha': '^2.1.3',
    'gulp-util': '^3.0.6',
    'run-sequence': '^1.1.5',
    'del': '^2.2.0',
    'coveralls': '^2.11.2'
  },
  /* ph repository */
  'repository': {
    'type': 'git',
    'url': 'git+https://github.com/nicosommi/gddify.git'
  },
  /* endph */
  /* ph extra */
  /* endph */
  'readmeFilename': 'README.md',
  /* ph contributors */
  'contributors': [],
  /* endph */
  /* ph homepage */
  'homepage': 'https://github.com/nicosommi/gddify'
  /* endph */
}
