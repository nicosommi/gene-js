"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import synchronize from "./synchronize.js";
// import cleanTo from "./cleanTo.js";

var Gene = function Gene(source, target, options) {
	_classCallCheck(this, Gene);

	this.sourceFilePath = source;
	this.targetFilePath = target;
	this.options = options;
};

exports.default = Gene;