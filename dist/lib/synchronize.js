'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.executeReplacements = executeReplacements;
exports.default = synchronize;

var _promise = require('./promise.js');

var _promise2 = _interopRequireDefault(_promise);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _regexParser = require('regex-parser');

var _regexParser2 = _interopRequireDefault(_regexParser);

var _getMeta = require('./getMeta.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ensureFile = _get__('Promise').promisify(_get__('fs').ensureFile);
var stat = _get__('Promise').promisify(_get__('fs').stat);

function executeReplacements(line, replacements) {
  var thereAreReplacements = replacements != null;
  if (thereAreReplacements && line && line.length > 0) {
    var _ret = function () {
      var finalLine = line;
      Object.keys(replacements).forEach(function (replacementKey) {
        var key = _get__('regexParser')(replacementKey);
        if (replacementKey && replacementKey.indexOf('/') === 0 && replacementKey.lastIndexOf('/') > 0) {
          key = _get__('regexParser')(replacementKey);
        } else {
          key = new RegExp(replacementKey, 'g');
        }
        finalLine = finalLine.replace(key, replacements[replacementKey]);
      });
      return {
        v: finalLine
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else {
    return line;
  }
}

function mergeReplacements(sourceReplacements, targetReplacements) {
  var replacements = {};
  var sourceReplacementKeys = Object.keys(sourceReplacements);
  var targetReplacementKeys = Object.keys(targetReplacements);
  targetReplacementKeys.forEach(function (targetReplacementKey) {
    var matchingSourceReplacementKey = sourceReplacementKeys.find(function (sourceReplacementKey) {
      return sourceReplacementKey === targetReplacementKey;
    });
    if (matchingSourceReplacementKey) {
      var regex = sourceReplacements[matchingSourceReplacementKey].regex;
      var value = targetReplacements[targetReplacementKey].value;
      replacements[regex] = value;
    } else {
      throw new Error('Missing replacement key on the source (' + targetReplacementKey + ')');
    }
  });
  return replacements;
}

function takeOptions(sourceBlocks, targetBlocks, commentStringStart, commentStringEnd) {
  var options = {};
  var sourceOptions = _get__('takeMeta')(sourceBlocks, commentStringStart, commentStringEnd);
  var _sourceReplacements$s = { sourceReplacements: sourceOptions.replacements, sourceIgnoringStamps: sourceOptions.ignoringStamps };
  var sourceReplacements = _sourceReplacements$s.sourceReplacements;
  var sourceIgnoringStamps = _sourceReplacements$s.sourceIgnoringStamps;

  var _get__2 = _get__('takeMeta')(targetBlocks, commentStringStart, commentStringEnd);

  var replacements = _get__2.replacements;
  var ignoringStamps = _get__2.ignoringStamps;

  options.replacements = _get__('mergeReplacements')(sourceReplacements, replacements);
  options.ignoringStamps = ignoringStamps;
  options.sourceIgnoringStamps = sourceIgnoringStamps;
  return options;
}

function synchronize(source, target, options) {
  return new (_get__('Promise'))(function (resolve, reject) {
    var force = void 0;
    if (options) {
      force = options.force;
    }

    var commentStringStart = void 0;
    var commentStringEnd = void 0;

    var fileExist = true;

    var sourcePhBlocks = [];
    var sourceStampBlocks = [];
    var targetPhBlocks = [];
    var targetStampBlocks = [];

    _get__('stat')(target).then(function () {
      return _get__('Promise').resolve();
    }).catch(function () {
      fileExist = false;
    }).then(function () {
      return _get__('ensureFile')(target);
    }).then(function () {
      _get__('Promise').props({
        source: _get__('getBlocks')(source),
        target: _get__('getBlocks')(target)
      }).then(function (results) {
        sourcePhBlocks = results.source.phBlocks;
        sourceStampBlocks = results.source.stampBlocks;
        targetPhBlocks = results.target.phBlocks;
        targetStampBlocks = results.target.stampBlocks;
        commentStringStart = results.source.commentStringStart;
        commentStringEnd = results.source.commentStringEnd;

        if (!options || !options.replacements && !options.ignoringStamps) {
          options = _get__('takeOptions')(sourcePhBlocks, targetPhBlocks, commentStringStart, commentStringEnd);
        }

        if (fileExist && sourcePhBlocks.length > 1 && targetPhBlocks.length === 0 && !force) {
          throw new Error('Warning, there is too much difference between ' + _get__('path').basename(source) + ' and ' + _get__('path').basename(target) + '. Make sure it\'s OK and use force flag.');
        }

        return _get__('Promise').resolve();
      }).then(function () {
        var result = [];
        var deprecated = void 0;

        sourcePhBlocks.forEach(function (templatePlaceHolder) {
          var placeHolder = targetPhBlocks.find(function (targetPlaceHolder) {
            var found = targetPlaceHolder.name === templatePlaceHolder.name;
            if (found) {
              targetPlaceHolder.found = true;
            }
            return found;
          });
          if (!placeHolder) {
            placeHolder = templatePlaceHolder;
          }
          result.push(placeHolder);
        });

        deprecated = targetPhBlocks.find(function (targetPlaceHolder) {
          return targetPlaceHolder.name === 'deprecated';
        });

        // find if there is a deprecated ph already there
        if (!deprecated) {
          deprecated = { name: 'deprecated', content: '' };
        }

        var deprecatedPhs = targetPhBlocks.filter(function (ph) {
          return ph.name !== 'deprecated' && !ph.found;
        });

        deprecatedPhs.forEach(function (deprecatedPh) {
          if (deprecated.content.length > 0) {
            deprecated.content += '\n';
          }
          var finalContent = '';
          if (deprecatedPh.content) {
            finalContent = deprecatedPh.content.replace(/\n/g, ' ' + commentStringEnd + '\n' + commentStringStart);
          }
          var replacedContent = finalContent;
          deprecated.content += commentStringStart + ' name: ' + deprecatedPh.name + ' ' + commentStringEnd + '\n' + commentStringStart + ' content: ' + replacedContent + ' ' + commentStringEnd;
        });

        if (deprecated.content.length > 0) {
          result.push(deprecated);
        }

        // prepare concrete contents
        var concreteFileContent = '';
        // read template file line by line
        var lineReader = _get__('readline').createInterface({ input: _get__('fs').createReadStream(source, { encoding: 'utf8' }) });
        var lineNumber = 0;
        var ignoreLines = false;
        lineReader.on('line', function (line) {
          lineNumber++;
          var endPlaceholder = sourcePhBlocks.find(function (templatePlaceholder) {
            return templatePlaceholder.to === lineNumber;
          });
          if (endPlaceholder) {
            ignoreLines = false;
          }

          // if the line matches the line of a newPhs element, put the contents from the ph there
          var placeholder = sourcePhBlocks.find(function (templatePlaceholder) {
            return templatePlaceholder.from === lineNumber;
          });

          var stampBegin = sourceStampBlocks.find(function (templateStamp) {
            return templateStamp.from === lineNumber;
          });

          var stampEnd = sourceStampBlocks.find(function (templateStamp) {
            return templateStamp.to === lineNumber;
          });

          var addLine = !ignoreLines;
          var isSpecialLine = placeholder || endPlaceholder || stampBegin || stampEnd;

          if (addLine) {
            var finalLine = line;
            if (!isSpecialLine) {
              // do not replace ph/stamp lines!
              finalLine = _get__('executeReplacements')(line, options.replacements);
            }
            concreteFileContent += finalLine + '\n';
          }

          if (placeholder) {
            var targetPlaceholder = targetPhBlocks.find(function (targetPlaceHolder) {
              return targetPlaceHolder.name === placeholder.name;
            });
            if (targetPlaceholder) {
              ignoreLines = true;
              if (!targetPlaceholder.content) {
                concreteFileContent += '';
              } else {
                concreteFileContent += targetPlaceholder.content + '\n';
              }
            }
          } else {
            if (stampBegin) {
              ignoreLines = true;
              var ignored = options.ignoringStamps.find(function (stampsToIgnore) {
                return stampsToIgnore === stampBegin.name;
              });
              var ignoredOnSource = null;
              if (options.sourceIgnoringStamps) {
                ignoredOnSource = options.sourceIgnoringStamps.find(function (stampsToIgnore) {
                  return stampsToIgnore === stampBegin.name;
                });
              }

              if (!ignored) {
                if (!ignoredOnSource) {
                  var _finalLine = _get__('executeReplacements')(stampBegin.content, options.replacements);
                  if (_finalLine) {
                    concreteFileContent += _finalLine + '\n';
                  }
                } else {
                  // keep his content for stamps that the other is ignoring
                  if (targetStampBlocks) {
                    var currentStamp = targetStampBlocks.find(function (targetStamp) {
                      return targetStamp.name === stampBegin.name;
                    });
                    if (currentStamp) {
                      concreteFileContent += currentStamp.content + '\n';
                    }
                  }
                }
              } else {
                concreteFileContent += ''; // nothing
              }
            } else {
                if (stampEnd) {
                  ignoreLines = false;
                  concreteFileContent += line + '\n';
                }
              }
          }
        });
        lineReader.on('close', function () {
          // put the deprecated ph if there is one
          if (deprecated && deprecated.content && deprecated.content.length > 0) {
            concreteFileContent += commentStringStart + ' ph deprecated ' + commentStringEnd + '\n' + deprecated.content + '\n' + commentStringStart + ' endph ' + commentStringEnd + '\n';
          }
          _get__('fs').writeFileSync(target, concreteFileContent, { encoding: 'utf8' });
          resolve();
        });
      }).catch(reject);
    }).catch(reject);
  });
}
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
    case 'Promise':
      return _promise2.default;

    case 'fs':
      return _fsExtra2.default;

    case 'regexParser':
      return _regexParser2.default;

    case 'takeMeta':
      return _getMeta.takeMeta;

    case 'mergeReplacements':
      return mergeReplacements;

    case 'stat':
      return stat;

    case 'ensureFile':
      return ensureFile;

    case 'getBlocks':
      return _getMeta.getBlocks;

    case 'takeOptions':
      return takeOptions;

    case 'path':
      return _path2.default;

    case 'readline':
      return _readline2.default;

    case 'executeReplacements':
      return executeReplacements;
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
  if ((typeof variableName === 'undefined' ? 'undefined' : _typeof(variableName)) === 'object') {
    Object.keys(variableName).forEach(function (name) {
      _RewiredData__[name] = variableName[name];
    });
  } else {
    return _RewiredData__[variableName] = value;
  }
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

var _typeOfOriginalExport = typeof synchronize === 'undefined' ? 'undefined' : _typeof(synchronize);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(synchronize, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(synchronize)) {
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