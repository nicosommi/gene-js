var Ph = require("./dist/lib/ph.js");
var SourceCodeFile = require("./dist/lib/sourceCodeFile.js").default;
var SwBlock = require("./dist/lib/swBlock.js").default;
var SwComponent = require("./dist/lib/swComponent.js").default;
Ph.SourceCodeFile = SourceCodeFile;
Ph.SwBlock = SwBlock;
Ph.SwComponent = SwComponent;
module.exports = Ph;
