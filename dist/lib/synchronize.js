'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _blockJs = require('block-js');

var _cuid = require('cuid');

var _cuid2 = _interopRequireDefault(_cuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('nicosommi.gene-js.synchronize');
var ensureFile = _get__('Promise').promisify(_get__('fs').ensureFile);
var stat = _get__('Promise').promisify(_get__('fs').stat);

function flushReplacementQueue(line, queue) {
  var newLine = line;
  queue.forEach(function (queueItem) {
    var regex = new RegExp(queueItem.id, 'g');
    newLine = newLine.replace(regex, queueItem.realValue);
  });
  return newLine;
}

function executeReplacements(line, replacements) {
  var thereAreReplacements = replacements != null;
  var queue = [];
  if (thereAreReplacements && line && line.length > 0) {
    var finalLine = line;
    Object.keys(replacements).forEach(function (replacementKey) {
      var key = _get__('regexParser')(replacementKey);
      if (replacementKey && replacementKey.indexOf('/') === 0 && replacementKey.lastIndexOf('/') > 0) {
        key = _get__('regexParser')(replacementKey);
      } else {
        key = new RegExp(replacementKey, 'g');
      }
      var queueElement = {
        id: _get__('cuid')(),
        realValue: replacements[replacementKey]
      };
      finalLine = finalLine.replace(key, queueElement.id);

      queue.push(queueElement);
    });
    finalLine = _get__('flushReplacementQueue')(finalLine, queue);
    return finalLine;
  } else {
    return line;
  }
}

function mergeReplacements(sourceReplacements, targetReplacements) {
  if (!sourceReplacements) {
    if (targetReplacements) {
      var replacements = {};
      Object.keys(targetReplacements).forEach(function (targetReplacementKey) {
        replacements[targetReplacements[targetReplacementKey].regex] = targetReplacements[targetReplacementKey].value;
      });
      return replacements;
    } else {
      return undefined;
    }
  } else if (!targetReplacements) {
    var _replacements = {};
    Object.keys(sourceReplacements).forEach(function (sourceReplacementKey) {
      _replacements[sourceReplacements[sourceReplacementKey].regex] = sourceReplacements[sourceReplacementKey].value;
    });
    return _replacements;
  } else {
    var _replacements2 = {};
    var sourceReplacementKeys = Object.keys(sourceReplacements);
    var targetReplacementKeys = Object.keys(targetReplacements);
    targetReplacementKeys.forEach(function (targetReplacementKey) {
      var matchingSourceReplacementKey = sourceReplacementKeys.find(function (sourceReplacementKey) {
        return sourceReplacementKey === targetReplacementKey;
      });
      if (matchingSourceReplacementKey) {
        var regex = sourceReplacements[matchingSourceReplacementKey].regex;
        var value = targetReplacements[targetReplacementKey].value;
        _replacements2[regex] = value;
      } else {
        throw new Error('Missing replacement key on the source (' + targetReplacementKey + ')');
      }
    });
    return _replacements2;
  }
}

function takeOptions(sourceBlocks, targetBlocks, commentStringStart, commentStringEnd) {
  var options = {};
  var sourceOptions = _get__('takeMeta')(sourceBlocks, commentStringStart, commentStringEnd);
  var _sourceReplacements$s = { sourceReplacements: sourceOptions.replacements, sourceStamps: sourceOptions.stamps },
      sourceReplacements = _sourceReplacements$s.sourceReplacements,
      sourceStamps = _sourceReplacements$s.sourceStamps;

  var _get__2 = _get__('takeMeta')(targetBlocks, commentStringStart, commentStringEnd),
      replacements = _get__2.replacements,
      stamps = _get__2.stamps;

  options.replacements = _get__('mergeReplacements')(sourceReplacements, replacements);
  options.stamps = stamps;
  options.sourceStamps = sourceStamps;
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
    var delimiters = _get__('getDelimiters')(source);

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

        if (!options || !options.replacements && !options.stamps) {
          _get__('debug')('taking options for file ' + target);
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

          var addLine = !ignoreLines;
          var isSpecialLine = placeholder || endPlaceholder;
          var stampBegin = void 0;
          var stampEnd = void 0;
          if (sourceStampBlocks) {
            stampBegin = sourceStampBlocks.find(function (templateStamp) {
              return templateStamp.from === lineNumber;
            });

            stampEnd = sourceStampBlocks.find(function (templateStamp) {
              return templateStamp.to === lineNumber;
            });

            isSpecialLine = placeholder || endPlaceholder || stampBegin || stampEnd;
          }

          function addLineFunction() {
            if (addLine) {
              var finalLine = line;
              if (!isSpecialLine && options.replacements) {
                // do not replace ph/stamp title lines!
                finalLine = _get__('executeReplacements')(line, options.replacements);
              }
              if (stampBegin && stampBegin.from === stampBegin.to) {
                finalLine = '' + _get__('executeReplacements')(stampBegin.content, options.replacements) + delimiters.inline + ' stamp ' + stampBegin.name;
              }
              concreteFileContent += finalLine + '\n';
            }
          }

          if (placeholder) {
            var targetPlaceholder = targetPhBlocks.find(function (targetPlaceHolder) {
              return targetPlaceHolder.name === placeholder.name;
            });
            if (targetPlaceholder) {
              ignoreLines = true;
              if (!targetPlaceholder.content) {
                addLineFunction();
                concreteFileContent += '';
              } else if (placeholder.from === placeholder.to && targetPlaceholder.content) {
                concreteFileContent += '' + targetPlaceholder.content + delimiters.inline + ' ph ' + placeholder.name + '\n';
                ignoreLines = false;
              } else {
                addLineFunction();
                concreteFileContent += targetPlaceholder.content + '\n';
              }
            } else {
              addLineFunction();
            }
          } else {
            addLineFunction();
            if (stampBegin && options.stamps) {
              if (stampBegin.from !== stampBegin.to) ignoreLines = true;
              // if matchs stamps it is a candidate to be included
              var candidate = options.stamps.test(stampBegin.name);
              // only if matchs in the source too it worth to take it here
              var itWorthToTakeIt = false;
              if (options.sourceStamps) {
                _get__('debug')('testing stamp ' + stampBegin.name + ' with the regexp ' + options.sourceStamps.toString());
                itWorthToTakeIt = options.sourceStamps.test(stampBegin.name);
              }

              if (candidate && stampBegin.from !== stampBegin.to) {
                if (itWorthToTakeIt) {
                  var finalLine = _get__('executeReplacements')(stampBegin.content, options.replacements);
                  if (finalLine) {
                    concreteFileContent += finalLine + '\n';
                  }
                } else {
                  // keep his content for stamps that the other is ignoring
                  if (targetStampBlocks) {
                    var currentStamp = targetStampBlocks.find(function (targetStamp) {
                      return targetStamp.name === stampBegin.name;
                    });
                    if (currentStamp && currentStamp.content) {
                      concreteFileContent += currentStamp.content + '\n';
                    } else {
                      concreteFileContent += '';
                    }
                  }
                }
              } else {
                concreteFileContent += ''; // nothing
              }
            } else {
              if (stampEnd && options.stamps && stampEnd.from !== stampEnd.to) {
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

function _getGlobalObject() {
  try {
    if (!!global) {
      return global;
    }
  } catch (e) {
    try {
      if (!!window) {
        return window;
      }
    } catch (e) {
      return this;
    }
  }
}

;
var _RewireModuleId__ = null;

function _getRewireModuleId__() {
  if (_RewireModuleId__ === null) {
    var globalVariable = _getGlobalObject();

    if (!globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__) {
      globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__ = 0;
    }

    _RewireModuleId__ = __$$GLOBAL_REWIRE_NEXT_MODULE_ID__++;
  }

  return _RewireModuleId__;
}

function _getRewireRegistry__() {
  var theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__) {
    theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
  }

  return __$$GLOBAL_REWIRE_REGISTRY__;
}

function _getRewiredData__() {
  var moduleId = _getRewireModuleId__();

  var registry = _getRewireRegistry__();

  var rewireData = registry[moduleId];

  if (!rewireData) {
    registry[moduleId] = Object.create(null);
    rewireData = registry[moduleId];
  }

  return rewireData;
}

(function registerResetAll() {
  var theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable['__rewire_reset_all__']) {
    theGlobalVariable['__rewire_reset_all__'] = function () {
      theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
    };
  }
})();

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
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
  var rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _get_original__(variableName);
  } else {
    var value = rewireData[variableName];

    if (value === INTENTIONAL_UNDEFINED) {
      return undefined;
    } else {
      return value;
    }
  }
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'Promise':
      return _promise2.default;

    case 'fs':
      return _fsExtra2.default;

    case 'regexParser':
      return _regexParser2.default;

    case 'cuid':
      return _cuid2.default;

    case 'flushReplacementQueue':
      return flushReplacementQueue;

    case 'takeMeta':
      return _getMeta.takeMeta;

    case 'mergeReplacements':
      return mergeReplacements;

    case 'getDelimiters':
      return _blockJs.getDelimiters;

    case 'stat':
      return stat;

    case 'ensureFile':
      return ensureFile;

    case 'getBlocks':
      return _getMeta.getBlocks;

    case 'debug':
      return debug;

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
  var rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return rewireData[variableName] = value;
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
  var rewireData = _getRewiredData__();

  if ((typeof variableName === 'undefined' ? 'undefined' : _typeof(variableName)) === 'object') {
    Object.keys(variableName).forEach(function (name) {
      rewireData[name] = variableName[name];
    });
  } else {
    if (value === undefined) {
      rewireData[variableName] = INTENTIONAL_UNDEFINED;
    } else {
      rewireData[variableName] = value;
    }

    return function () {
      _reset__(variableName);
    };
  }
}

function _reset__(variableName) {
  var rewireData = _getRewiredData__();

  delete rewireData[variableName];

  if (Object.keys(rewireData).length == 0) {
    delete _getRewireRegistry__()[_getRewireModuleId__];
  }

  ;
}

function _with__(object) {
  var rewireData = _getRewiredData__();

  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      rewireData[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = rewireData[variableName];
      rewireData[variableName] = object[variableName];
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