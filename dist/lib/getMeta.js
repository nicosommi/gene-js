'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.takeMeta = takeMeta;
exports.getBlocks = getBlocks;
exports.default = getMeta;

var _blockJs = require('block-js');

var _blockJs2 = _interopRequireDefault(_blockJs);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _promise = require('./promise.js');

var _promise2 = _interopRequireDefault(_promise);

var _regexParser = require('regex-parser');

var _regexParser2 = _interopRequireDefault(_regexParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stat = _get__('Promise').promisify(_get__('fs').stat);

function cleanContent(content, dirtyStrings) {
  dirtyStrings.forEach(function (dirtyString) {
    content = content.replace(dirtyString, '');
  });
  return content;
}

function takeReplacements(blocks, commentStringStart, commentStringEnd) {
  var replacementsPh = blocks.find(function (targetBlock) {
    return targetBlock.name === 'replacements';
  });
  if (replacementsPh) {
    var replacements = {};
    if (replacementsPh.content) {
      var replacementLines = replacementsPh.content.split('\n');
      replacementLines.forEach(function (replacementLine) {
        var tokens = _get__('cleanContent')(replacementLine, [commentStringStart, commentStringEnd]).split(', ').map(function (token) {
          return token.trim();
        });
        var name = tokens[0];
        var regex = tokens[1];
        var value = tokens[2];
        replacements[name] = {
          regex: regex, value: value
        };
      });
      return replacements;
    } else {
      return {};
    }
  } else {
    return undefined;
  }
}

function takeStamps(blocks, commentStringStart, commentStringEnd) {
  var stamps = undefined;
  var stampsPh = blocks.find(function (targetBlock) {
    return targetBlock.name === 'stamps';
  });
  if (stampsPh && stampsPh.content) {
    stamps = _get__('regexParser')(_get__('cleanContent')(stampsPh.content, [commentStringStart, commentStringEnd]).trim());
  }
  return stamps;
}

function takeMeta(blocks, commentStringStart, commentStringEnd) {
  var options = {};
  options.replacements = _get__('takeReplacements')(blocks, commentStringStart, commentStringEnd);
  options.stamps = _get__('takeStamps')(blocks, commentStringStart, commentStringEnd);
  return options;
}

function getBlocks(filePath, options) {
  var delimiters = void 0;
  if (options) {
    delimiters = options.delimiters;
  }

  // TODO: suppport block array name on blocks to reduce file reading
  var phsBlocksClass = new (_get__('Blocks'))(filePath, 'ph', delimiters);
  var stampsBlocksClass = new (_get__('Blocks'))(filePath, 'stamp', delimiters);

  return _get__('Promise').props({
    phBlocks: phsBlocksClass.extractBlocks(),
    stampBlocks: stampsBlocksClass.extractBlocks(),
    commentStringStart: phsBlocksClass.startBlockString,
    commentStringEnd: phsBlocksClass.endBlockString
  });
}

function getMeta(filePath, options) {
  return new (_get__('Promise'))(function (resolve) {
    var emptyMetaInfo = {
      replacements: {},
      stamps: undefined
    };

    return _get__('stat')(filePath).then(function () {
      return _get__('getBlocks')(filePath, options).then(function (results) {
        var metaInfo = emptyMetaInfo;

        if (!options || !options.replacements && !options.stamps) {
          metaInfo = _get__('takeMeta')(results.phBlocks, results.commentStringStart, results.commentStringEnd);
        } else {
          var replacements = options.replacements,
              stamps = options.stamps;

          Object.assign(metaInfo, { replacements: replacements, stamps: stamps });
        }

        resolve(metaInfo);
      });
    }, function () {
      resolve(emptyMetaInfo);
    });
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

    case 'cleanContent':
      return cleanContent;

    case 'regexParser':
      return _regexParser2.default;

    case 'takeReplacements':
      return takeReplacements;

    case 'takeStamps':
      return takeStamps;

    case 'Blocks':
      return _blockJs2.default;

    case 'stat':
      return stat;

    case 'getBlocks':
      return getBlocks;

    case 'takeMeta':
      return takeMeta;
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

var _typeOfOriginalExport = typeof getMeta === 'undefined' ? 'undefined' : _typeof(getMeta);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(getMeta, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(getMeta)) {
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