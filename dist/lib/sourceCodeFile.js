'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-console */


var _synchronize = require('./synchronize.js');

var _synchronize2 = _interopRequireDefault(_synchronize);

var _getMeta = require('./getMeta.js');

var _getMeta2 = _interopRequireDefault(_getMeta);

var _setMeta = require('./setMeta.js');

var _setMeta2 = _interopRequireDefault(_setMeta);

var _cleanTo = require('./cleanTo.js');

var _cleanTo2 = _interopRequireDefault(_cleanTo);

var _promise = require('./promise.js');

var _promise2 = _interopRequireDefault(_promise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = require('debug')('nicosommi.gddify.gene-js.sourceCodeFile');

var SourceCodeFile = function () {
  function SourceCodeFile(name, filePath, options) {
    _classCallCheck(this, SourceCodeFile);

    this.name = name;
    this.path = filePath;
    this.options = options;
  }

  _createClass(SourceCodeFile, [{
    key: 'getMeta',
    value: function getMeta() {
      var _this = this;

      return _get__('getMeta')(this.getFullPath(), this.options).then(function (fileMetaInfo) {
        var replacements = fileMetaInfo.replacements,
            stamps = fileMetaInfo.stamps;


        return _get__('Promise').resolve({
          name: _this.name,
          path: _this.path,
          replacements: replacements,
          stamps: stamps
        });
      });
    }
  }, {
    key: 'setMeta',
    value: function setMeta(metaObject) {
      return _get__('setMeta')(this.getFullPath(), metaObject, this.options);
    }
  }, {
    key: 'getFullPath',
    value: function getFullPath() {
      var basePath = '';
      if (this.options && this.options.basePath) {
        basePath = this.options.basePath;
      }
      return _get__('path').normalize(_get__('path').join(basePath, this.path));
    }
  }, {
    key: 'getFullCleanPath',
    value: function getFullCleanPath() {
      return _get__('path').normalize(_get__('path').join(this.options.basePath, this.options.cleanPath, this.path));
    }
  }, {
    key: 'synchronizeWith',
    value: function synchronizeWith(rootSourceCodeFile) {
      if (!rootSourceCodeFile.path) {
        return _get__('Promise').reject(new Error('No path defined for root file ' + rootSourceCodeFile.name));
      } else {
        var rootFullPath = rootSourceCodeFile.getFullPath();
        var targetFullPath = this.getFullPath();
        _get__('debug')('Syncing ' + rootFullPath + ' with ' + targetFullPath + '...');
        return _get__('synchronize')(rootFullPath, targetFullPath, this.options);
      }
    }
  }, {
    key: 'clean',
    value: function clean(dirtyPhs) {
      if (!this.options.cleanPath) {
        return _get__('Promise').reject(new Error('No clean path defined for file ' + this.name));
      } else if (!this.path) {
        return _get__('Promise').reject(new Error('No path defined for file ' + this.name));
      } else {
        this.options.dirtyPhs = dirtyPhs || [];
        var rootFullPath = this.getFullPath();
        var targetFullPath = this.getFullCleanPath();
        _get__('debug')('Cleaning ' + rootFullPath + ' to ' + targetFullPath + '...');
        return _get__('cleanTo')(rootFullPath, targetFullPath, this.options);
      }
    }
  }]);

  return SourceCodeFile;
}();

exports.default = SourceCodeFile;

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
    case 'getMeta':
      return _getMeta2.default;

    case 'Promise':
      return _promise2.default;

    case 'setMeta':
      return _setMeta2.default;

    case 'path':
      return _path2.default;

    case 'debug':
      return debug;

    case 'synchronize':
      return _synchronize2.default;

    case 'cleanTo':
      return _cleanTo2.default;
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

var _typeOfOriginalExport = typeof SourceCodeFile === 'undefined' ? 'undefined' : _typeof(SourceCodeFile);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(SourceCodeFile, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(SourceCodeFile)) {
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