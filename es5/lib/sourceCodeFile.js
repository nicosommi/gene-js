"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _synchronize = require("./synchronize.js");

var _synchronize2 = _interopRequireDefault(_synchronize);

var _getMeta = require("./getMeta.js");

var _getMeta2 = _interopRequireDefault(_getMeta);

var _cleanTo = require("./cleanTo.js");

var _cleanTo2 = _interopRequireDefault(_cleanTo);

var _promise = require("./promise.js");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SourceCodeFile = function () {
	function SourceCodeFile(name, filePath, cleanPath, options) {
		_classCallCheck(this, SourceCodeFile);

		this.name = name;
		this.path = filePath;
		this.cleanPath = cleanPath;
		this.options = options;
	}

	_createClass(SourceCodeFile, [{
		key: "getMeta",
		value: function getMeta() {
			var _this = this;

			return _get__("getMeta")(this.path, this.options).then(function (fileMetaInfo) {
				var replacements = fileMetaInfo.replacements;
				var ignoringStamps = fileMetaInfo.ignoringStamps;


				return _get__("Promise").resolve({
					name: _this.name,
					path: _this.path,
					replacements: replacements,
					ignoringStamps: ignoringStamps
				});
			});
		}
	}, {
		key: "synchronizeWith",
		value: function synchronizeWith(rootSourceCodeFile) {
			if (!rootSourceCodeFile.path) {
				return _get__("Promise").reject(new Error("No path defined for root file " + rootSourceCodeFile.name));
			} else {
				return _get__("synchronize")(rootSourceCodeFile.path, this.path, this.options);
			}
		}
	}, {
		key: "clean",
		value: function clean(dirtyPhs) {
			if (!this.cleanPath) {
				return _get__("Promise").reject(new Error("No clean path defined for file " + this.name));
			} else if (!this.path) {
				return _get__("Promise").reject(new Error("No path defined for file " + this.name));
			} else {
				this.options.dirtyPhs = dirtyPhs || [];
				return _get__("cleanTo")(this.path, this.cleanPath, this.options);
			}
		}
	}]);

	return SourceCodeFile;
}();

exports.default = SourceCodeFile;
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
		case "getMeta":
			return _getMeta2.default;

		case "Promise":
			return _promise2.default;

		case "synchronize":
			return _synchronize2.default;

		case "cleanTo":
			return _cleanTo2.default;
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

var _typeOfOriginalExport = typeof SourceCodeFile === "undefined" ? "undefined" : _typeof(SourceCodeFile);

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