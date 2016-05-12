import SourceCodeFile from "../es6/lib/sourceCodeFile.js";
import Promise from "../es6/lib/promise.js";
import fs from "fs-extra";
import del from "del";
import sinon from "sinon";

const copyFile = Promise.promisify(fs.copy);

describe("SourceCodeFile", () => {
	let sourceCodeFile,
		sourceCodeFileName,
		sourceSourceCodeFile,
		source,
		clean,
		sourceTemplate,
		target,
		targetTemplate,
		options;

	beforeEach(() => {
		source = `${__dirname}/../fixtures/sourceCodeFiles/results/apple.js`;
		clean = `${__dirname}/../fixtures/sourceCodeFiles/results/cleanApple.js`;
		sourceTemplate = `${__dirname}/../fixtures/sourceCodeFiles/sources/apple.js`;
		target = `${__dirname}/../fixtures/sourceCodeFiles/results/banana.js`;
		targetTemplate = `${__dirname}/../fixtures/sourceCodeFiles/sources/banana.js`;

		options = { force: true };

		sourceCodeFileName = "sourceCodeFileName";

		sourceCodeFile = new SourceCodeFile(sourceCodeFileName, target, clean, options);
		sourceSourceCodeFile = new SourceCodeFile("rootFileName", source, "", options);

		return Promise.all(
			[
				copyFile(sourceTemplate, source),
				copyFile(targetTemplate, target)
			]
		);
	});

	afterEach(done => {
		del(source)
		.then(() => {
			del(target)
			.then(() => done());
		});
	});

	describe("constructor(source, target, options)", () => {
		it("should set the source sourceCodeFile file name", () => {
			sourceCodeFile.name.should.equal(sourceCodeFileName);
		});

		it("should set the source sourceCodeFile file path", () => {
			sourceCodeFile.path.should.equal(target);
		});

		it("should set the source sourceCodeFile file clean path", () => {
			sourceCodeFile.cleanPath.should.equal(clean);
		});

		it("should set the options if provided", () => {
			sourceCodeFile.options.should.eql(options);
		});
	});

	describe("(methods)", () => {
		let synchronizeSpy;
		let cleanToSpy;

		beforeEach(() => {
			synchronizeSpy = sinon.spy(() => Promise.resolve());
			cleanToSpy = sinon.spy(() => Promise.resolve());
			SourceCodeFile.__Rewire__("synchronize", synchronizeSpy);
			SourceCodeFile.__Rewire__("cleanTo", cleanToSpy);
		});

		describe(".clean", () => {
			it("should provide the clean method", () => {
				return sourceCodeFile.clean()
					.then(() => {
						cleanToSpy.calledWith(source, clean, options).should.be.true;
					});
			});

			it("should throw if there is no path", () => {
				delete sourceCodeFile.path;
				return sourceCodeFile.clean()
					.should.be.rejectedWith(/No path defined for file sourceCodeFileName/);
			});

			it("should throw if there is no cleanPath", () => {
				delete sourceCodeFile.cleanPath;
				return sourceCodeFile.clean()
					.should.be.rejectedWith(/No clean path defined for file sourceCodeFileName/);
			});
		});

		describe(".synchronize", () => {
			it("should call the synchronize method when synchronize sourceCodeFile", () => {
				return sourceCodeFile.synchronizeWith(sourceSourceCodeFile)
					.then(() => {
						synchronizeSpy.calledWith(source, target, options).should.be.true;
						return Promise.resolve();
					});
			});

			it("should throw if there is no path", () => {
				delete sourceSourceCodeFile.path;
				return sourceCodeFile.synchronizeWith(sourceSourceCodeFile)
					.should.be.rejectedWith(/No path defined for root file rootFileName/);
			});
		});


	});
});
