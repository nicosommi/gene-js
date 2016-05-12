import cleanTo from "../es6/lib/cleanTo.js";
import Promise from "../es6/lib/promise.js";
import fs from "fs-extra";

const readFile = Promise.promisify(fs.readFile);

function cleanToMechanism(source, target, expectation, options, customAssertion = false) {
	const sourceComplete = `${__dirname}/../fixtures/genes/sources/${source}`;
	const expectationComplete = `${__dirname}/../fixtures/genes/expectations/${expectation}`;
	const targetResult = `${__dirname}/../fixtures/genes/results/${target}`;

	let targetContents;

	// read source
	const processPromise = readFile(sourceComplete)
		// synchronize target
			.then(() => cleanTo(sourceComplete, targetResult, options))
		// read new target
			.then(() => readFile(targetResult))
			.then((contents) => {
				targetContents = contents.toString("utf8");
			})
		// read expectation
			.then(() => readFile(expectationComplete));
	if(customAssertion) {
		return processPromise.then((contents) => contents.toString("utf8").should.eql(targetContents));
	} else {
		return processPromise;
	}
}

describe(".cleanTo(targetPath)", () => {
	it("should generate a cleaned version of the gene to a custom target path", () => {
		return cleanToMechanism("apple.js", "cleanedApple.js", "cleanedApple.js");
	});

	it("should create the path if it does not exists");

	it("should throw an error if the source does not exist");
});
