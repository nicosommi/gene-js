'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-console */


var _sourceCodeFile = require('./sourceCodeFile.js');

var _sourceCodeFile2 = _interopRequireDefault(_sourceCodeFile);

var _promise = require('./promise.js');

var _promise2 = _interopRequireDefault(_promise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SwBlock = function () {
  function SwBlock(name, type, version, options) {
    _classCallCheck(this, SwBlock);

    this.name = name;
    this.type = type;
    this.version = version;
    this.options = options;
    this.sourceCodeFiles = [];
  }

  _createClass(SwBlock, [{
    key: 'addSourceCodeFile',
    value: function addSourceCodeFile(sourceCodeFile) {
      var newOptions = Object.assign({}, sourceCodeFile.options, this.options); // passing options down through
      var newSourceCodeFile = new (_get__('SourceCodeFile'))(sourceCodeFile.name, sourceCodeFile.path, newOptions);
      this.sourceCodeFiles.push(newSourceCodeFile);
      return newSourceCodeFile;
    }
  }, {
    key: 'addSourceCodeFiles',
    value: function addSourceCodeFiles(sourceCodeFiles) {
      var _this = this;

      sourceCodeFiles.forEach(function (sourceCodeFile) {
        return _this.addSourceCodeFile(sourceCodeFile);
      });
    }
  }, {
    key: 'getMeta',
    value: function getMeta() {
      var _this2 = this;

      return _get__('Promise').all(this.sourceCodeFiles.map(function (sourceCodeFile) {
        return sourceCodeFile.getMeta();
      })).then(function (results) {
        return _get__('Promise').resolve({
          name: _this2.name,
          type: _this2.type,
          version: _this2.version,
          sourceCodeFiles: results
        });
      });
    }
  }, {
    key: 'synchronizeWith',
    value: function synchronizeWith(rootBlock) {
      var _this3 = this;

      return new (_get__('Promise'))(function (resolve, reject) {
        console.log(_get__('chalk').magenta('checking block versions'));
        if (_get__('semver').gte(rootBlock.version, _this3.version)) {
          (function () {
            console.log(_get__('chalk').magenta('syncing block to version ' + rootBlock.version));
            var errors = [];

            var promises = rootBlock.sourceCodeFiles.map(function (rootSourceCodeFile) {
              console.log(_get__('chalk').magenta('syncing file ' + rootSourceCodeFile.path));
              // find this.sourceCodeFile
              var matchingSourceCodeFile = _this3.sourceCodeFiles.find(function (sourceCodeFile) {
                return sourceCodeFile.name === rootSourceCodeFile.name;
              });
              if (matchingSourceCodeFile) {
                console.log(_get__('chalk').magenta('file match for ' + _this3.path));
                // add promess to process list
                return matchingSourceCodeFile.synchronizeWith(rootSourceCodeFile);
              } else {
                // create a potential promess to create it
                var newSourceCodeFile = void 0;
                if (_this3.options && _this3.options.basePath) {
                  if (rootSourceCodeFile.path) {
                    console.log(_get__('chalk').magenta('new file for ' + rootSourceCodeFile.path));
                    newSourceCodeFile = _this3.addSourceCodeFile({
                      name: rootSourceCodeFile.name,
                      path: _get__('path').normalize('' + rootSourceCodeFile.path),
                      options: _this3.options
                    });
                    return newSourceCodeFile.synchronizeWith(rootSourceCodeFile);
                  } else {
                    errors.push(new Error('ERROR: there is no path provided for the source file ' + rootSourceCodeFile.name + ' on the block of name ' + rootBlock.name + ' and type ' + rootBlock.type + '. Please ammend that and try again.'));
                  }
                } else {
                  errors.push(new Error('ERROR: there is no base path provided for the block ' + _this3.name + ', so the new source code file ' + rootSourceCodeFile.name + ' cannot be added.'));
                }
              }
            });

            // check processed list against sourceCodeFiles
            if (errors.length === 0) {
              console.log(_get__('chalk').magenta('executing sync tasks...'));
              _get__('Promise').all(promises).then(function () {
                _this3.version = rootBlock.version;
                console.log(_get__('chalk').green('finished with no errors, now version ' + _this3.version + '.'));
                resolve();
              }).catch(reject);
            } else {
              console.log(_get__('chalk').red('errors on files ' + errors));
              var errorMessage = errors.reduce(function (message, currentError) {
                if (message) {
                  return message + '\n' + currentError.message;
                } else {
                  return currentError.message;
                }
              });
              reject(new Error(errorMessage));
            }
          })();
        } else if (_get__('semver').eq(rootBlock.version, _this3.version)) {
          reject(new Error('WARNING: The root block ' + rootBlock.name + ' - v' + rootBlock.version + ' is at the same version as the destination (' + _this3.name + ' - v' + _this3.version + '). So the block synchronization is omitted.'));
        } else {
          reject(new Error('WARNING: The root block ' + rootBlock.name + ' - v' + rootBlock.version + ' of type ' + rootBlock.type + ' is older than the destination (' + _this3.name + ' - v' + _this3.version + '). Block synchronization aborted.'));
        }
      });
    }
  }, {
    key: 'clean',
    value: function clean(dirtyPhs) {
      var promises = this.sourceCodeFiles.map(function (sourceCodeFile) {
        return sourceCodeFile.clean(dirtyPhs);
      });
      return _get__('Promise').all(promises);
    }
  }]);

  return SwBlock;
}();

exports.default = SwBlock;
var _RewiredData__ = {};
var _RewireAPI__ = {};

(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }

  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'SourceCodeFile':
      return _sourceCodeFile2.default;

    case 'Promise':
      return _promise2.default;

    case 'chalk':
      return _chalk2.default;

    case 'semver':
      return _semver2.default;

    case 'path':
      return _path2.default;
  }

  return undefined;
}

function _assign__(variableName, value) {
  if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return _RewiredData__[variableName] = value;
  }
}

function _set_original__(variableName, _value) {
  switch (variableName) {}

  return undefined;
}

function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);

  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

  _assign__(variableName, newValue);

  return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
  return _RewiredData__[variableName] = value;
}

function _reset__(variableName) {
  delete _RewiredData__[variableName];
}

function _with__(object) {
  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      _RewiredData__[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = _RewiredData__[variableName];
      _RewiredData__[variableName] = object[variableName];
    });
    var result = callback();

    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }

    return result;
  };
}

var _typeOfOriginalExport = typeof SwBlock === 'undefined' ? 'undefined' : _typeof(SwBlock);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(SwBlock, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(SwBlock)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}

exports.__get__ = _get__;
exports.__GetDependency__ = _get__;
exports.__Rewire__ = _set__;
exports.__set__ = _set__;
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = _RewireAPI__;