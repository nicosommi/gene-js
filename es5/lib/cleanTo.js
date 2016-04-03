"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = cleanTo;

var _promise = require("./promise.js");

var _promise2 = _interopRequireDefault(_promise);

var _blockJs = require("block-js");

var _blockJs2 = _interopRequireDefault(_blockJs);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _readline = require("readline");

var _readline2 = _interopRequireDefault(_readline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var writeFile = _get__("Promise").promisify(_get__("fs").writeFile);
var ensureFile = _get__("Promise").promisify(_get__("fs").ensureFile);

function cleanTo(source, target, options) {
	return new (_get__("Promise"))(function (resolve, reject) {
		var delimiters = void 0;
		if (options) {
			delimiters = options.delimiters;
		}

		var sourcePhsBlocksClass = new (_get__("Blocks"))(source, "ph", delimiters);
		var sourceStampsBlocksClass = new (_get__("Blocks"))(source, "stamp", delimiters);

		_get__("ensureFile")(target).then(function () {
			_get__("Promise").props({
				sourcePhBlocks: sourcePhsBlocksClass.extractBlocks(),
				sourceStampBlocks: sourceStampsBlocksClass.extractBlocks()
			}).then(function (results) {
				var blocks = results.sourcePhBlocks;
				blocks = blocks.concat(results.sourceStampBlocks);

				// read file line by line creating a concrete new file
				// prepare concrete contents
				var concreteFileContent = "";
				// read template file line by line
				var lineReader = _get__("readline").createInterface({ input: _get__("fs").createReadStream(source, { encoding: "utf8" }) });
				var lineNumber = 0;
				var ignoreLines = false;
				lineReader.on("line", function (line) {
					lineNumber++;
					var beginPh = blocks.find(function (currentPh) {
						return currentPh.from === lineNumber;
					});
					var endPh = blocks.find(function (currentPh) {
						return currentPh.to === lineNumber;
					});

					// core block to ignore block delimiters and deprecated content
					if (!beginPh && !endPh && !ignoreLines) {
						concreteFileContent += line + "\n";
					} else if (beginPh && !ignoreLines && beginPh.name === "deprecated") {
						ignoreLines = true;
					} else if (endPh && ignoreLines) {
						ignoreLines = false;
					}
				});
				lineReader.on("close", function () {
					_get__("writeFile")(target, concreteFileContent, { encoding: "utf8" }).then(function () {
						return resolve();
					}).catch(reject);
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
		case "Promise":
			return _promise2.default;

		case "fs":
			return _fsExtra2.default;

		case "Blocks":
			return _blockJs2.default;

		case "ensureFile":
			return ensureFile;

		case "readline":
			return _readline2.default;

		case "writeFile":
			return writeFile;
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

var _typeOfOriginalExport = typeof cleanTo === "undefined" ? "undefined" : _typeof(cleanTo);

function addNonEnumerableProperty(name, value) {
	Object.defineProperty(cleanTo, name, {
		value: value,
		enumerable: false,
		configurable: true
	});
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(cleanTo)) {
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