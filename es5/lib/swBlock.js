"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sourceCodeFile = require("./sourceCodeFile.js");

var _sourceCodeFile2 = _interopRequireDefault(_sourceCodeFile);

var _promise = require("./promise.js");

var _promise2 = _interopRequireDefault(_promise);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SwBlock = function () {
	function SwBlock(name, type, options) {
		_classCallCheck(this, SwBlock);

		this.name = name;
		this.type = type;
		this.options = options;
		this.sourceCodeFiles = [];
	}

	_createClass(SwBlock, [{
		key: "addSourceCodeFile",
		value: function addSourceCodeFile(sourceCodeFile) {
			var newOptions = Object.assign({}, this.options, sourceCodeFile.options); // passing options through
			var newSourceCodeFile = new (_get__("SourceCodeFile"))(sourceCodeFile.name, sourceCodeFile.path, sourceCodeFile.clean, newOptions);
			this.sourceCodeFiles.push(newSourceCodeFile);
			return newSourceCodeFile;
		}
	}, {
		key: "addSourceCodeFiles",
		value: function addSourceCodeFiles(sourceCodeFiles) {
			var _this = this;

			sourceCodeFiles.forEach(function (sourceCodeFile) {
				return _this.addSourceCodeFile(sourceCodeFile);
			});
		}
	}, {
		key: "synchronizeWith",
		value: function synchronizeWith(rootBlock) {
			var _this2 = this;

			return new (_get__("Promise"))(function (resolve, reject) {
				var errors = [];
				var promises = rootBlock.sourceCodeFiles.map(function (rootSourceCodeFile) {
					// find this.sourceCodeFile
					var matchingSourceCodeFile = _this2.sourceCodeFiles.find(function (sourceCodeFile) {
						return sourceCodeFile.name === rootSourceCodeFile.name;
					});
					if (matchingSourceCodeFile) {
						// create a potential promess to synchronizeWith
						// const promiseSynchronize = matchingSourceCodeFile.synchronizeWith(rootSourceCodeFile);
						// add promess to process list
						return matchingSourceCodeFile.synchronizeWith(rootSourceCodeFile);
					} else {
						// create a potential promess to create it
						// matchingSourceCodeFile = new SourceCodeFile();
						// const promiseSynchronize = matchingSourceCodeFile.synchronizeWith(rootSourceCodeFile);
						// add promess to process list
						// promises.push(promiseSynchronize);
						var newSourceCodeFile = void 0;
						if (_this2.options && _this2.options.basePath) {
							if (rootSourceCodeFile.options.basePath) {
								var targetBasePath = _get__("path").normalize(_this2.options.basePath);
								var targetCleanBasePath = _get__("path").normalize(_this2.options.basePath + "/..");
								var originalPath = _get__("path").normalize(rootSourceCodeFile.path);
								var originalBasePath = _get__("path").normalize(rootSourceCodeFile.options.basePath);
								var targetPath = originalPath.replace(originalBasePath, targetBasePath);
								var targetCleanPath = originalPath.replace(originalBasePath, targetCleanBasePath);
								newSourceCodeFile = _this2.addSourceCodeFile({
									name: rootSourceCodeFile.name,
									path: "" + _get__("path").normalize(targetPath),
									clean: "" + _get__("path").normalize(targetCleanPath)
								});
								return newSourceCodeFile.synchronizeWith(rootSourceCodeFile);
							} else {
								errors.push(new Error("ERROR: there is no base path provided for the source file " + rootSourceCodeFile.name + " on the block of name " + rootBlock.name + " and type " + rootBlock.type + ". Please ammend that and try again."));
							}
						} else {
							errors.push(new Error("ERROR: there is no base path provided for the block " + _this2.name + ", so the new source code file " + rootSourceCodeFile.name + " cannot be added."));
						}
					}
				});

				// check processed list against sourceCodeFiles
				if (errors.length === 0) {
					_get__("Promise").all(promises).then(function () {
						return resolve();
					});
				} else {
					reject(errors);
				}
			});
		}
	}, {
		key: "clean",
		value: function clean(dirtyPhs) {
			var promises = this.sourceCodeFiles.map(function (sourceCodeFile) {
				return sourceCodeFile.clean(dirtyPhs);
			});
			return _get__("Promise").all(promises);
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
		case "SourceCodeFile":
			return _sourceCodeFile2.default;

		case "Promise":
			return _promise2.default;

		case "path":
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

var _typeOfOriginalExport = typeof SwBlock === "undefined" ? "undefined" : _typeof(SwBlock);

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