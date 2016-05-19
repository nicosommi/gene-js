"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _blockJs = require("block-js");

var _blockJs2 = _interopRequireDefault(_blockJs);

var _synchronize = require("./synchronize.js");

var _synchronize2 = _interopRequireDefault(_synchronize);

var _cleanTo = require("./cleanTo.js");

var _cleanTo2 = _interopRequireDefault(_cleanTo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
DEPRECATED: just for backwards compatibility
* placeholder.js is mented to be used in certain blocks on certains files
* in order to improve the development process, then some assumptions were made
*/

var Ph = function () {
	function Ph(targetFilePath) {
		_classCallCheck(this, Ph);

		_get__("_")(this).targetFilePath = targetFilePath;
		_get__("_")(this).ignoringStamps = [];
		_get__("_")(this).replacements = null;
	}

	_createClass(Ph, [{
		key: "withThisDelimiters",
		value: function withThisDelimiters(start, end) {
			_get__("_")(this).customDelimiters = { start: start, end: end };
			return this;
		}
	}, {
		key: "replacing",
		value: function replacing(replacementsObject) {
			_get__("_")(this).replacements = replacementsObject;
			return this;
		}
	}, {
		key: "ignoringStamps",
		value: function ignoringStamps(stampsToIgnore) {
			_get__("_")(this).ignoringStamps = stampsToIgnore;
			return this;
		}
	}, {
		key: "cleanTo",
		value: function cleanTo(cleanFilePath, callback) {
			var options = {
				delimiters: _get__("_")(this).customDelimiters,
				replacements: _get__("_")(this).replacements,
				ignoringStamps: _get__("_")(this).ignoringStamps
			};
			_get__("cleanTo")(_get__("_")(this).targetFilePath, cleanFilePath, options).then(function () {
				return callback();
			}).catch(function (error) {
				return callback(error);
			});
		}
	}, {
		key: "with",
		value: function _with(templateFilePath, callback) {
			var options = {
				delimiters: _get__("_")(this).customDelimiters,
				replacements: _get__("_")(this).replacements,
				ignoringStamps: _get__("_")(this).ignoringStamps
			};
			_get__("synchronize")(templateFilePath, _get__("_")(this).targetFilePath, options).then(function () {
				return callback();
			}).catch(function (error) {
				return callback(error);
			});
		}
	}], [{
		key: "refresh",
		value: function refresh(targetFilePath) {
			return new (_get__("Ph"))(targetFilePath);
		}
	}, {
		key: "using",
		value: function using(dirtyFilePath) {
			return new (_get__("Ph"))(dirtyFilePath);
		}
	}, {
		key: "getPlaceHolders",
		value: function getPlaceHolders(fileName, customDelimiters) {
			return new (_get__("Blocks"))(fileName, "ph", customDelimiters);
		}
	}, {
		key: "getStamps",
		value: function getStamps(fileName, customDelimiters) {
			return new (_get__("Blocks"))(fileName, "stamp", customDelimiters);
		}
	}]);

	return Ph;
}();

exports.default = Ph;
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
		case "_":
			return _incognito2.default;

		case "Ph":
			return Ph;

		case "Blocks":
			return _blockJs2.default;

		case "cleanTo":
			return _cleanTo2.default;

		case "synchronize":
			return _synchronize2.default;
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

var _typeOfOriginalExport = typeof Ph === "undefined" ? "undefined" : _typeof(Ph);

function addNonEnumerableProperty(name, value) {
	Object.defineProperty(Ph, name, {
		value: value,
		enumerable: false,
		configurable: true
	});
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(Ph)) {
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