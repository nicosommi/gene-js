"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _readline = require("readline");

var _readline2 = _interopRequireDefault(_readline);

var _blockJs = require("block-js");

var _blockJs2 = _interopRequireDefault(_blockJs);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _regexParser = require("regex-parser");

var _regexParser2 = _interopRequireDefault(_regexParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var executeReplacements = Symbol("executeReplacements");
/*
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
		key: executeReplacements,
		value: function value(line) {
			var _this = this;

			var thereAreReplacements = _get__("_")(this).replacements != null;
			if (thereAreReplacements && line && line.length > 0) {
				var _ret = function () {
					var finalLine = line;
					Object.keys(_get__("_")(_this).replacements).forEach(function (replacementKey) {
						var key = _get__("regexParser")(replacementKey);
						if (replacementKey && replacementKey.indexOf("/") === 0 && replacementKey.lastIndexOf("/") > 0) {
							key = _get__("regexParser")(replacementKey);
						} else {
							key = new RegExp(replacementKey, "g");
						}
						finalLine = finalLine.replace(key, _get__("_")(_this).replacements[replacementKey]);
					});
					return {
						v: finalLine
					};
				}();

				if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
			} else {
				return line;
			}
		}
	}, {
		key: "cleanTo",
		value: function cleanTo(cleanFilePath, callback) {
			var _this2 = this;

			// TODO: clean placeholders
			var blocks = void 0;
			_get__("flowsync").series([function (next) {
				_get__("fs").stat(cleanFilePath, function (errorCleanFilePath) {
					if (errorCleanFilePath) {
						_get__("mkdirp")(_get__("path").dirname(cleanFilePath), function () {
							_get__("fs").writeFile(cleanFilePath, "", { encoding: "utf8" }, function (error) {
								next(error);
							});
						});
					} else {
						next();
					}
				});
			}, function (next) {
				_get__("Ph").getPlaceHolders(_get__("_")(_this2).targetFilePath, _get__("_")(_this2).customDelimiters).extractBlocks().then(function (_blocks) {
					blocks = _blocks;
					next();
				}).catch(next);
			}, function (next) {
				_get__("Ph").getStamps(_get__("_")(_this2).targetFilePath, _get__("_")(_this2).customDelimiters).extractBlocks().then(function (_blocks) {
					blocks = blocks.concat(_blocks);
					next();
				}).catch(next);
			}], function (errors) {
				if (errors) {
					callback(errors);
				} else {
					(function () {
						// read file line by line creating a concrete new file
						// prepare concrete contents
						var concreteFileContent = "";
						// read template file line by line
						var lineReader = _get__("readline").createInterface({ input: _get__("fs").createReadStream(_get__("_")(_this2).targetFilePath, { encoding: "utf8" }) });
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
							_get__("fs").writeFile(cleanFilePath, concreteFileContent, { encoding: "utf8" }, function (error) {
								callback(error);
							});
						});
					})();
				}
			});
		}
	}, {
		key: "with",
		value: function _with(templateFilePath, callback) {
			var _this3 = this;

			var commentStringStart = void 0;
			var commentStringEnd = void 0;
			_get__("flowsync").series([function (next) {
				// TODO: this is not clean
				var temporalBlock = _get__("Ph").getPlaceHolders(templateFilePath, _get__("_")(_this3).customDelimiters);
				commentStringStart = temporalBlock.startBlockString;
				commentStringEnd = temporalBlock.endBlockString;
				next();
			}, function (next) {
				_get__("Ph").getPlaceHolders(templateFilePath, _get__("_")(_this3).customDelimiters).extractBlocks().then(function (_blocks) {
					_get__("_")(_this3).templatePlaceHolders = _blocks;
					next();
				}).catch(next);
			}, function (next) {
				_get__("Ph").getStamps(templateFilePath, _get__("_")(_this3).customDelimiters).extractBlocks().then(function (_blocks) {
					_get__("_")(_this3).templateStamps = _blocks;
					next();
				}).catch(next);
			}, function (next) {
				_get__("fs").stat(_get__("_")(_this3).targetFilePath, function (errorTargetFilePath) {
					if (errorTargetFilePath) {
						_get__("mkdirp")(_get__("path").dirname(_get__("_")(_this3).targetFilePath), function () {
							_get__("fs").writeFile(_get__("_")(_this3).targetFilePath, "", { encoding: "utf8" }, function (error) {
								next(error);
							});
						});
					} else {
						next();
					}
				});
			}, function (next) {
				_get__("Ph").getPlaceHolders(_get__("_")(_this3).targetFilePath, _get__("_")(_this3).customDelimiters).extractBlocks().then(function (_blocks) {
					_get__("_")(_this3).targetPlaceHolders = _blocks;
					next();
				}).catch(next);
			}], function (errors) {
				if (errors) {
					callback(errors);
				} else {
					(function () {
						var result = [];
						var deprecated = void 0;

						_get__("_")(_this3).templatePlaceHolders.forEach(function (templatePlaceHolder) {
							var placeHolder = _get__("_")(_this3).targetPlaceHolders.find(function (targetPlaceHolder) {
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

						deprecated = _get__("_")(_this3).targetPlaceHolders.find(function (targetPlaceHolder) {
							return targetPlaceHolder.name === "deprecated";
						});

						// find if there is a deprecated ph already there
						if (!deprecated) {
							deprecated = { name: "deprecated", content: "" };
						}

						var deprecatedPhs = _get__("_")(_this3).targetPlaceHolders.filter(function (ph) {
							return ph.name !== "deprecated" && !ph.found;
						});

						deprecatedPhs.forEach(function (deprecatedPh) {
							if (deprecated.content.length > 0) {
								deprecated.content += "\n";
							}
							var replacedContent = deprecatedPh.content.replace(/\n/g, " " + commentStringEnd + "\n" + commentStringStart);
							deprecated.content += commentStringStart + " name: " + deprecatedPh.name + " " + commentStringEnd + "\n" + commentStringStart + " content: " + replacedContent + " " + commentStringEnd;
						});

						if (deprecated.content.length > 0) {
							result.push(deprecated);
						}

						// prepare concrete contents
						var concreteFileContent = "";
						// read template file line by line
						var lineReader = _get__("readline").createInterface({ input: _get__("fs").createReadStream(templateFilePath, { encoding: "utf8" }) });
						var lineNumber = 0;
						var ignoreLines = false;
						lineReader.on("line", function (line) {
							lineNumber++;
							var endPlaceholder = _get__("_")(_this3).templatePlaceHolders.find(function (templatePlaceholder) {
								return templatePlaceholder.to === lineNumber;
							});
							if (endPlaceholder) {
								ignoreLines = false;
							}

							// if the line matches the line of a newPhs element, put the contents from the ph there
							var placeholder = _get__("_")(_this3).templatePlaceHolders.find(function (templatePlaceholder) {
								return templatePlaceholder.from === lineNumber;
							});

							var stampBegin = _get__("_")(_this3).templateStamps.find(function (templateStamp) {
								return templateStamp.from === lineNumber;
							});

							var stampEnd = _get__("_")(_this3).templateStamps.find(function (templateStamp) {
								return templateStamp.to === lineNumber;
							});

							var addLine = !ignoreLines;
							var isSpecialLine = placeholder || endPlaceholder || stampBegin || stampEnd;

							if (addLine) {
								var finalLine = line;
								if (!isSpecialLine) {
									//do not replace ph/stamp lines!
									finalLine = _this3[executeReplacements](line);
								}
								concreteFileContent += finalLine + "\n";
							}

							if (placeholder) {
								var targetPlaceholder = _get__("_")(_this3).targetPlaceHolders.find(function (targetPlaceHolder) {
									return targetPlaceHolder.name === placeholder.name;
								});
								if (targetPlaceholder) {
									ignoreLines = true;
									concreteFileContent += targetPlaceholder.content + "\n";
								}
							} else {
								if (stampBegin) {
									ignoreLines = true;
									var ignored = _get__("_")(_this3).ignoringStamps.find(function (stampsToIgnore) {
										return stampsToIgnore === stampBegin.name;
									});
									if (!ignored) {
										var _finalLine = _this3[executeReplacements](stampBegin.content);
										if (_finalLine) {
											concreteFileContent += _finalLine + "\n";
										}
									} else {
										concreteFileContent += ""; //nothing
									}
								} else {
										if (stampEnd) {
											ignoreLines = false;
											concreteFileContent += line + "\n";
										}
									}
							}
						});
						lineReader.on("close", function () {
							//put the deprecated ph if there is one
							if (deprecated && deprecated.content && deprecated.content.length > 0) {
								concreteFileContent += commentStringStart + " ph deprecated " + commentStringEnd + "\n" + deprecated.content + "\n" + commentStringStart + " endph " + commentStringEnd + "\n";
							}
							_get__("fs").writeFileSync(_get__("_")(_this3).targetFilePath, concreteFileContent, { encoding: "utf8" });
							callback();
						});
					})();
				}
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

		case "regexParser":
			return _regexParser2.default;

		case "flowsync":
			return _flowsync2.default;

		case "fs":
			return _fs2.default;

		case "mkdirp":
			return _mkdirp2.default;

		case "path":
			return _path2.default;

		case "readline":
			return _readline2.default;
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