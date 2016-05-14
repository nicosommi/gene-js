"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.takeMeta = takeMeta;
exports.getBlocks = getBlocks;
exports.default = getMeta;

var _blockJs = require("block-js");

var _blockJs2 = _interopRequireDefault(_blockJs);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _promise = require("./promise.js");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stat = _get__("Promise").promisify(_get__("fs").stat);

function cleanContent(content, dirtyStrings) {
	dirtyStrings.forEach(function (dirtyString) {
		content = content.replace(dirtyString, "");
	});
	return content;
}

function takeReplacements(blocks, commentStringStart, commentStringEnd) {
	var replacementsPh = blocks.find(function (targetBlock) {
		return targetBlock.name === "replacements";
	});
	if (replacementsPh) {
		var _ret = function () {
			var replacements = {};
			if (replacementsPh.content) {
				var replacementLines = replacementsPh.content.split("\n");
				replacementLines.forEach(function (replacementLine) {
					var tokens = _get__("cleanContent")(replacementLine, [commentStringStart, commentStringEnd]).split(", ").map(function (token) {
						return token.trim();
					});
					var name = tokens[0];
					var regex = tokens[1];
					var value = tokens[2];
					replacements[name] = { regex: regex, value: value };
				});
				return {
					v: replacements
				};
			} else {
				return {
					v: {}
				};
			}
		}();

		if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
	} else {
		return {};
	}
}

function takeIgnoringStamps(blocks, commentStringStart, commentStringEnd) {
	var ignoringStampsPh = blocks.find(function (targetBlock) {
		return targetBlock.name === "ignoringStamps";
	});
	if (ignoringStampsPh) {
		var _ret2 = function () {
			var ignoringStamps = [];
			if (ignoringStampsPh.content) {
				var ignoringStampLines = ignoringStampsPh.content.split("\n");
				ignoringStampLines.forEach(function (ignoringStampLine) {
					var tokens = _get__("cleanContent")(ignoringStampLine, [commentStringStart, commentStringEnd]).split(",").map(function (token) {
						return token.trim();
					});
					ignoringStamps = ignoringStamps.concat(tokens);
				});
				return {
					v: ignoringStamps
				};
			} else {
				return {
					v: []
				};
			}
		}();

		if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
	} else {
		return [];
	}
}

function takeMeta(blocks, commentStringStart, commentStringEnd) {
	var options = {};
	options.replacements = _get__("takeReplacements")(blocks, commentStringStart, commentStringEnd);
	options.ignoringStamps = _get__("takeIgnoringStamps")(blocks, commentStringStart, commentStringEnd);
	return options;
}

function getBlocks(filePath, options) {
	var delimiters = void 0;
	if (options) {
		delimiters = options.delimiters;
	}

	// TODO: suppport block array name on blocks to reduce file reading
	var phsBlocksClass = new (_get__("Blocks"))(filePath, "ph", delimiters);
	var stampsBlocksClass = new (_get__("Blocks"))(filePath, "stamp", delimiters);

	return _get__("Promise").props({
		phBlocks: phsBlocksClass.extractBlocks(),
		stampBlocks: stampsBlocksClass.extractBlocks(),
		commentStringStart: phsBlocksClass.startBlockString,
		commentStringEnd: phsBlocksClass.endBlockString
	});
}

function getMeta(filePath, options) {
	return new (_get__("Promise"))(function (resolve) {
		var emptyMetaInfo = {
			replacements: {},
			ignoringStamps: []
		};

		return _get__("stat")(filePath).then(function () {
			return _get__("getBlocks")(filePath, options).then(function (results) {
				var metaInfo = emptyMetaInfo;

				if (!options || !options.replacements && !options.ignoringStamps) {
					metaInfo = _get__("takeMeta")(results.phBlocks, results.commentStringStart, results.commentStringEnd);
				} else {
					var replacements = options.replacements;
					var ignoringStamps = options.ignoringStamps;

					Object.assign(metaInfo, { replacements: replacements, ignoringStamps: ignoringStamps });
				}

				resolve(metaInfo);
			});
		}, function () {
			resolve(emptyMetaInfo);
		});
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

		case "cleanContent":
			return cleanContent;

		case "takeReplacements":
			return takeReplacements;

		case "takeIgnoringStamps":
			return takeIgnoringStamps;

		case "Blocks":
			return _blockJs2.default;

		case "stat":
			return stat;

		case "getBlocks":
			return getBlocks;

		case "takeMeta":
			return takeMeta;
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

var _typeOfOriginalExport = typeof getMeta === "undefined" ? "undefined" : _typeof(getMeta);

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