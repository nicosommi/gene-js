import SwBlock from "../es6/lib/swBlock.js";
import SourceCodeFile from "../es6/lib/sourceCodeFile.js";
import Promise from "../es6/lib/promise.js";
import sinon from "sinon";

describe("SwBlock", () => {
	let swBlock,
		name,
		type,
		options,
		version;

	beforeEach(() => {
		name = "fruitBasketBlock";
		type = "basket";
		version = "0.0.1";
		options = {};
		swBlock = new SwBlock(name, type, version, options);
	});

	describe("constructor(name, type, options)", () => {
		it("should set the source block name", () => {
			swBlock.name.should.equal(name);
		});

		it("should set the block type", () => {
			swBlock.type.should.equal(type);
		});

		it("should set the block version", () => {
			swBlock.version.should.equal(version);
		});

		it("should set the options if provided", () => {
			swBlock.options.should.eql(options);
		});
	});

	describe("(adding source files)", () => {
		describe(".addSourceCodeFile(source, clean, options)", () => {
			let sourceCodeFileName,
				path,
				clean;

			beforeEach(() => {
				sourceCodeFileName = "";
				path = "";
				clean = "";
				swBlock.addSourceCodeFile({name: sourceCodeFileName, path, clean});
			});

			it("should add the source file to the array", () => {
				swBlock.sourceCodeFiles.should.eql([new SourceCodeFile(sourceCodeFileName, path, clean, options)]);
			});

			it("should pass the option properties to the source code options along with the specific ones", () => {
				swBlock = new SwBlock(name, type, version, { aproperty: 1, onemore: 2 });
				swBlock.addSourceCodeFile({name: "aname", path, clean, options: { onemore: 3 }});
				swBlock.sourceCodeFiles[0].options.should.eql({ aproperty: 1, onemore: 3 });
			});
		});

		describe(".addSourceCodeFiles(array)", () => {
			let inputArray,
				expectedArray;

			beforeEach(() => {
				const firstElement = { name: "firstElement", path: "sourceCodeFileExample", clean: "sourceCodeFileExampleClean", options: {} };
				const secondElement = { name: "secondElement", path: "oneMoreSourceCodeFileExample", clean: "oneMoreSourceCodeFileExampleClean", options: {} };
				inputArray = [];
				inputArray.push(firstElement);
				inputArray.push(secondElement);

				expectedArray = [];
				expectedArray.push(new SourceCodeFile(firstElement.name, firstElement.path, firstElement.clean, options));
				expectedArray.push(new SourceCodeFile(secondElement.name, secondElement.path, secondElement.clean, options));
				swBlock.addSourceCodeFiles(inputArray);
			});

			it("should add the source file to the array", () => {
				swBlock.sourceCodeFiles.should.eql(expectedArray);
			});
		});
	});

	describe("(methods)", () => {
		let inputArray,
			sourceSwBlock;

		beforeEach(() => {
			const firstElement = { name: "firstElement", path: "sourceCodeFileExample", clean: "sourceCodeFileExampleClean", options: {} };
			const secondElement = { name: "secondElement", path: "oneMoreSourceCodeFileExample", clean: "oneMoreSourceCodeFileExampleClean", options: {} };
			inputArray = [];
			inputArray.push(firstElement);
			inputArray.push(secondElement);

			sourceSwBlock = new SwBlock("rootFruitBasketBlock", "basket", "0.0.2", {});
			sourceSwBlock.addSourceCodeFiles(inputArray);
			swBlock.addSourceCodeFiles(inputArray);
		});

		describe(".synchronizeWith(rootSwBlock)", () => {
			let synchronizeSpy;

			beforeEach(() => {
				synchronizeSpy = sinon.spy(() => Promise.resolve());
				SourceCodeFile.__Rewire__("synchronize", synchronizeSpy);
			});

			it("should call the synchronize method when synchronize sourceCodeFile", () => {
				return swBlock.synchronizeWith(sourceSwBlock)
					.then(() => {
						synchronizeSpy.callCount.should.equal(2);
						return Promise.resolve();
					});
			});

			it("should refresh the block version after synchronization", () => {
				swBlock.version.should.not.equal(sourceSwBlock.version);
				return swBlock.synchronizeWith(sourceSwBlock)
					.then(() => {
						swBlock.version.should.equal(sourceSwBlock.version);
						return Promise.resolve();
					});
			});

			it("should add the new files using the supplied base path and the basename", () => {
				swBlock.options.basePath = "/apath/but/different/dna";
				sourceSwBlock.addSourceCodeFile({ name: "thirdElement", path: "/apath/that/isLong/afile.js", clean: ""});
				return swBlock.synchronizeWith(sourceSwBlock)
					.catch((errors) => Promise.reject(errors[0]))
					.should.be.rejectedWith(/ERROR: there is no base path provided for the source file thirdElement on the block of name rootFruitBasketBlock and type basket. Please ammend that and try again\./);
			});

			it("should replace base path if both provided to avoid flatten files", () => {
				swBlock.options.basePath = "/afolder/asecond/../adifferentpath/dna";
				const rootOptions = {
					basePath: "/afolder/asecond/../abasepath/dna"
				};
				sourceSwBlock.addSourceCodeFile({ name: "thirdElement", path: "/afolder/asecond/../abasepath/dna/afile.js", clean: "", options: rootOptions});
				return swBlock.synchronizeWith(sourceSwBlock)
					.then(() => {
						synchronizeSpy.callCount.should.equal(3);
						swBlock.sourceCodeFiles[2].should.eql(new SourceCodeFile("thirdElement", "/afolder/adifferentpath/dna/afile.js", "/afolder/adifferentpath/afile.js", options));
						return Promise.resolve();
					});
			});

			it("should throw if there are new files and there is no base path provided", () => {
				sourceSwBlock.addSourceCodeFile({ name: "thirdElement", path: "/apath/that/isLong/afile.js", clean: ""});
				return swBlock.synchronizeWith(sourceSwBlock)
					.catch((errors) => Promise.reject(errors[0]))
					.should.be.rejectedWith(/ERROR: there is no base path provided for the block fruitBasketBlock, so the new source code file thirdElement cannot be added./);
			});

			it("should throw if the root block is older than the destination", () => {
				sourceSwBlock.version = "0.0.0";
				return swBlock.synchronizeWith(sourceSwBlock)
					.should.be.rejectedWith(/The root block [a-zA-Z0-9\- .]* of type [a-zA-Z0-9\- .]* is older than the destination \([a-zA-Z0-9\- .]*\). Block synchronization aborted./);
			});
		});

		describe(".clean()", () => {
			let cleanToSpy;

			beforeEach(() => {
				cleanToSpy = sinon.spy(() => Promise.resolve());
				SourceCodeFile.__Rewire__("cleanTo", cleanToSpy);
			});

			it("should provide the clean method", () => {
				return swBlock.clean()
					.then(() => {
						cleanToSpy.callCount.should.equal(2);
					});
			});
		});

		describe(".getMeta", () => {
			let getMetaSpy;

			beforeEach(() => {
				getMetaSpy = sinon.spy(() => Promise.resolve(
					{
						replacements: {
							className: {
								regex: "/Banana/g",
								value: "Banana"
							}
						},
						ignoringStamps: ["throwAway"]
					}
				));
				SourceCodeFile.__Rewire__("getMeta", getMetaSpy);
				swBlock = new SwBlock(name, type, version);
				swBlock.addSourceCodeFiles([{ name: "banana", path: "banana.js" }, { name: "banana2", path: "banana2.js" }]);
			});

			it("should allow to retrieve the meta information for all his block genes", () => {
				return swBlock.getMeta()
					.should.be.fulfilledWith({
						name,
						type,
						version,
						sourceCodeFiles: [
							{
								name: "banana",
								path: "banana.js",
								replacements: {
									className: {
										regex: "/Banana/g",
										value: "Banana"
									}
								},
								ignoringStamps: ["throwAway"]
							},
							{
								name: "banana2",
								path: "banana2.js",
								replacements: {
									className: {
										regex: "/Banana/g",
										value: "Banana"
									}
								},
								ignoringStamps: ["throwAway"]
							}
						]
					});
			});
		});
	});
});
