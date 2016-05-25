'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-console */


var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _swBlock = require('./swBlock.js');

var _swBlock2 = _interopRequireDefault(_swBlock);

var _promise = require('./promise.js');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SwComponent = function () {
  function SwComponent(name, type, options) {
    _classCallCheck(this, SwComponent);

    this.name = name;
    this.type = type;
    this.options = options;
    this.swBlocks = [];
  }

  _createClass(SwComponent, [{
    key: 'addSwBlock',
    value: function addSwBlock(swBlock) {
      var newOptions = Object.assign({}, swBlock.options, this.options); // passing options down through
      var newSwBlock = new (_get__('SwBlock'))(swBlock.name, swBlock.type, swBlock.version, newOptions);
      newSwBlock.addSourceCodeFiles(swBlock.sourceCodeFiles);
      this.swBlocks.push(newSwBlock);
      return newSwBlock;
    }
  }, {
    key: 'addSwBlocks',
    value: function addSwBlocks(swBlocks) {
      var _this = this;

      swBlocks.forEach(function (swBlock) {
        return _this.addSwBlock(swBlock);
      });
    }
  }, {
    key: 'getMeta',
    value: function getMeta() {
      var _this2 = this;

      return _get__('Promise').all(this.swBlocks.map(function (swBlock) {
        return swBlock.getMeta();
      })).then(function (results) {
        return _get__('Promise').resolve({
          name: _this2.name,
          type: _this2.type,
          swBlocks: results
        });
      });
    }
  }, {
    key: 'synchronizeWith',
    value: function synchronizeWith(rootBlock) {
      console.log(_get__('chalk').magenta('synchronize component started'));
      var promise = void 0;

      // find this.swBlock
      var matchingSwBlocks = this.swBlocks.filter(function (swBlock) {
        return swBlock.type === rootBlock.type;
      });
      if (matchingSwBlocks && matchingSwBlocks.length > 0) {
        console.log(_get__('chalk').magenta('going through existing blocks'));
        promise = _get__('Promise').all(matchingSwBlocks.map(function (matchingSwBlock) {
          return matchingSwBlock.synchronizeWith(rootBlock);
        }));
      } else {
        console.log(_get__('chalk').magenta('creating a new block named ' + rootBlock.name + ' of type ' + rootBlock.type));
        var newOptions = Object.assign({}, this.options, rootBlock.options);
        var newSwBlock = this.addSwBlock({
          name: rootBlock.name,
          type: rootBlock.type,
          version: '0.0.0',
          options: newOptions,
          sourceCodeFiles: []
        });
        promise = newSwBlock.synchronizeWith(rootBlock);
      }

      return promise;
    }
  }, {
    key: 'clean',
    value: function clean(dirtyPhs) {
      var promises = this.swBlocks.map(function (swBlock) {
        return swBlock.clean(dirtyPhs);
      });
      return _get__('Promise').all(promises);
    }
  }]);

  return SwComponent;
}();

exports.default = SwComponent;
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
    case 'SwBlock':
      return _swBlock2.default;

    case 'Promise':
      return _promise2.default;

    case 'chalk':
      return _chalk2.default;
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

var _typeOfOriginalExport = typeof SwComponent === 'undefined' ? 'undefined' : _typeof(SwComponent);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(SwComponent, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(SwComponent)) {
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