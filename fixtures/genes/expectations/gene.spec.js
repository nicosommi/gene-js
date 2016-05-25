import Gene from "../es6/lib/gene.js";
import Promise from "../es6/lib/promise.js";
import fs from "fs-extra";
import del from "del";

const copyFile = Promise.promisify(fs.copy);

describe("Gene", () => {
	let gene,
		source,
		sourceTemplate,
		target,
		targetTemplate,
		options;

	beforeEach(() => {
		source = `${__dirname}/../fixtures/genes/results/apple.js`;
		sourceTemplate = `${__dirname}/../fixtures/genes/sources/apple.js`;
		target = `${__dirname}/../fixtures/genes/results/banana.js`;
		targetTemplate = `${__dirname}/../fixtures/genes/sources/banana.js`;

		options = { force: true };

		gene = new Gene(source, target, options);

		return Promise.all(
			[
				copyFile(sourceTemplate, source),
				copyFile(targetTemplate, target)
			]
		);
	});

	afterEach(done => {
		del(source).
		then(() => {
			del(target)
				.then(() => done());
		});
	});

	describe("constructor(sourceFilePath, targetFilePath, options)", () => {
		it("should set the source gene file path", () => {
			gene.sourceFilePath.should.equal(source);
		});

		it("should set the target file path", () => {
			gene.targetFilePath.should.equal(target);
		});

		it("should set the options if provided", () => {
			gene.options.should.eql(options);
		});
	});
});
