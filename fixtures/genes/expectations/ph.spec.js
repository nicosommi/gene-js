import Ph from "../es6/lib/ph.js";
import fs from "fs";
import del from "del";

/*
DEPRECATED: just for backwards compatibility
*/

function prepareResult(resultFilePath, sourceFilePath) {
	const initialContents = fs.readFileSync(sourceFilePath, {encoding: "utf8"});
	fs.writeFileSync(resultFilePath, initialContents, {encoding: "utf8"});
}

describe("Gene-js", () => {
	let templateFileName,
		templateWithNewPhsFileName,
		templateWithLessPhsFileName,
		templateWithEvenLessPhsFileName,
		concreteFilePath,
		resultFilePath,
		concreteWithDeprecatedPhsFilePath,
		cleanedUpFilePath,
		cleanedUpResultFilePath;

	before(() => {
		concreteFilePath = `${__dirname}/../fixtures/ph/concrete.spec.js`;
		resultFilePath = `${__dirname}/../fixtures/ph/newResult.spec.js`;
		templateFileName = `${__dirname}/../fixtures/ph/template.spec.js`;
		templateWithNewPhsFileName = `${__dirname}/../fixtures/ph/templateWithNewPhs.spec.js`;
		templateWithLessPhsFileName = `${__dirname}/../fixtures/ph/templateWithLessPhs.spec.js`;
		templateWithEvenLessPhsFileName = `${__dirname}/../fixtures/ph/templateWithEvenLessPhs.spec.js`;
		concreteWithDeprecatedPhsFilePath = `${__dirname}/../fixtures/ph/concreteWithDeprecatedPhs.spec.js`;
		cleanedUpFilePath = `${__dirname}/../fixtures/ph/expectations/cleanedUp.spec.js`;
		cleanedUpResultFilePath = `${__dirname}/../fixtures/ph/expectations/cleanedUp.result.spec.js`;
	});

	describe(".getPlaceHolders", () => {
		it("should call getBlocks with ph", () => {
			Ph.getPlaceHolders().blockName.should.eql("ph");
		});
	});

	describe(".getStamps", () => {
		it("should call getBlocks with stamp", () => {
			Ph.getStamps().blockName.should.eql("stamp");
		});
	});

	describe(".using().cleanTo()", () => {
		describe("(target is new)", () => {
			it("should save to a file without any block sign on it", done => {
				Ph.using(concreteWithDeprecatedPhsFilePath).cleanTo(cleanedUpResultFilePath,
					() => {
						const resultingContents = fs.readFileSync(cleanedUpResultFilePath, {encoding: "utf8"});
						const expectedContents = fs.readFileSync(cleanedUpFilePath, {encoding: "utf8"});
						resultingContents.should.eql(expectedContents);
						done();
					}
				);
			});

			it("should return an error if the process fails", done => {
				Ph.using(".unexistingFile").cleanTo(cleanedUpResultFilePath,
					(error) => {
						error.message.should.containEql("ENOENT");
						done();
					}
				);
			});
		});

		describe("when new folders in path specified", () => {
			let newPath,
				expectedContents,
				resultingContents;

			beforeEach(done => {
				cleanedUpFilePath = `${__dirname}/../fixtures/ph/expectations/cleanedUp.spec.js`;
				cleanedUpResultFilePath = `${__dirname}/../fixtures/ph/newFolderClean/cleanedUp.result.spec.js`;
				newPath = `${__dirname}/../fixtures/ph/newFolderClean`;
				Ph.using(concreteWithDeprecatedPhsFilePath)
					.cleanTo(cleanedUpResultFilePath,
					()=> {
						//pick the result the process left in the hard drive just to assert
						resultingContents = fs.readFileSync(cleanedUpResultFilePath, {encoding: "utf8"});
						expectedContents = fs.readFileSync(cleanedUpFilePath, {encoding: "utf8"});
						done();
					});
			});

			afterEach(() => del(newPath));

			it("should create all the intermediate folders", () => {
				resultingContents.should.eql(expectedContents);
			});
		});
	});

	describe(".refresh().with()", () => {
		it("should return an error if the process fails", done => {
			Ph.refresh(".someTarget").with(".unexistingFile",
				(error) => {
					error.message.should.containEql("ENOENT");
					done();
				}
			);
		});

		describe("(custom delimiters)", () => {
			let expectedContents,
				resultingContents,
				resultCustomFilePath,
				templateCustomFilePath;

			beforeEach(done => {
				expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/.gitignoreConcrete`, {encoding: "utf8"});
				templateCustomFilePath = `${__dirname}/../fixtures/ph/.gitignoreSource`;
				resultCustomFilePath = `${__dirname}/../fixtures/ph/.gitignoreResult`;
				fs.stat(resultCustomFilePath, error => {
					if(!error) {
						fs.unlinkSync(resultCustomFilePath);
					}

					Ph.refresh(resultCustomFilePath)
						.withThisDelimiters("##-", "-##")
						.ignoringStamps(["customStamp"])
						.with(templateCustomFilePath,
						()=> {
							//pick the result the process left in the hard drive just to assert
							resultingContents = fs.readFileSync(resultCustomFilePath, {encoding: "utf8"});
							done();
						});
				});
			});

			it("should refresh with the template contents for a new file including placeholder contents with replacements done", () => {
				resultingContents.should.eql(expectedContents);
			});
		});

		describe("when new folders in path specified", () => {
			let newPath,
				expectedContents,
				resultingContents,
				resultCustomFilePath,
				templateCustomFilePath;

			beforeEach(done => {
				newPath = `${__dirname}/../fixtures/ph/newFolder`;
				expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/.gitignoreConcrete`, {encoding: "utf8"});
				templateCustomFilePath = `${__dirname}/../fixtures/ph/.gitignoreSource`;
				resultCustomFilePath = `${__dirname}/../fixtures/ph/newFolder/ToIt/.gitignoreResult`;
				Ph.refresh(resultCustomFilePath)
					.withThisDelimiters("##-", "-##")
					.ignoringStamps(["customStamp"])
					.with(templateCustomFilePath,
					()=> {
						//pick the result the process left in the hard drive just to assert
						resultingContents = fs.readFileSync(resultCustomFilePath, {encoding: "utf8"});
						done();
					});
			});

			afterEach(() => del(newPath));

			it("should create all the intermediate folders", () => {
				resultingContents.should.eql(expectedContents);
			});
		});

		describe("(no deprecation needed)", () => {

			describe("(template and stamps to a new target file)", () => {
				let expectedContents,
					resultingContents;

				beforeEach(done => {
					expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/toNewExpectation.spec.js`, {encoding: "utf8"});
					resultFilePath = `${__dirname}/../fixtures/ph/differentResult.spec.js`;
					fs.stat(resultFilePath, error => {
						if(!error) {
							fs.unlinkSync(resultFilePath);
						}

						Ph.refresh(resultFilePath)
							.with(templateFileName,
							()=> {
								//pick the result the process left in the hard drive just to assert
								resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
								done();
							});
					});
				});

				it("should refresh with the template contents for a new file including placeholder contents with replacements done", () => {
					resultingContents.should.eql(expectedContents);
				});
			});

			describe("(template to an existing target file)", () => {
				let expectedContents,
					resultingContents;

				beforeEach(done => {
					expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/toExistingExpectation.spec.js`, {encoding: "utf8"});
					prepareResult(resultFilePath, concreteFilePath);
					Ph.refresh(resultFilePath).with(templateFileName,
						() => {
							//pick the result the process left in the hard drive just to assert
							resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
							done();
						});
				});

				it("should refresh contents with replacements but keeping the old template contents", () => {
					resultingContents.should.eql(expectedContents);
				});
			});
		});

		describe("(when there are new place holders in the template)", () => {
			let expectedContents,
				resultingContents;

			beforeEach(done => {
				expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/newPhsOnTemplateExpectation.spec.js`, {encoding: "utf8"});
				prepareResult(resultFilePath, concreteFilePath);
				Ph.refresh(resultFilePath).with(templateWithNewPhsFileName,
					()=> {
						//pick the result the process left in the hard drive just to assert
						resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
						done();
					});
			});

			it("should add the new empty ones", () => {
				resultingContents.should.eql(expectedContents);
			});
		});

		describe("(when there are removed place holders from the template)", () => {
			let expectedContents,
				resultingContents;

			beforeEach(done => {
				expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/removedPhsExpectation.spec.js`, {encoding: "utf8"});
				prepareResult(resultFilePath, concreteFilePath);
				Ph.refresh(resultFilePath).with(templateWithLessPhsFileName,
					()=> {
						//pick the result the process left in the hard drive just to assert
						resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
						done();
					});
			});

			describe("(and there is no deprecated place holder yet)", () => {
				it("should create the deprecated placeholder", () => {
					resultingContents.should.eql(expectedContents);
				});
			});

			describe("(and there is a deprecated place holder already on the concrete file)", () => {
				beforeEach(done => {
					expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/removedPhsAgainExpectation.spec.js`, {encoding: "utf8"});
					prepareResult(resultFilePath, concreteWithDeprecatedPhsFilePath);
					Ph.refresh(resultFilePath).with(templateWithEvenLessPhsFileName,
						()=> {
							//pick the result the process left in the hard drive just to assert
							resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
							done();
						});
				});

				it("should add the new removed place holders to the deprecated place holder", () => {
					resultingContents.should.eql(expectedContents);
				});
			});
		});

		describe("(stamping)", () => {
			describe("(stamp on the concrete was removed on template)", () => {
				let expectedContents,
					removedStampTemplateFileName,
					resultingContents;

				beforeEach(done => {
					removedStampTemplateFileName = `${__dirname}/../fixtures/ph/templateRemovedStampFileName.spec.js`;
					expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/removedStampExpectation.spec.js`, {encoding: "utf8"});
					fs.writeFileSync(resultFilePath, concreteFilePath, {encoding: "utf8"});
					Ph.refresh(resultFilePath).with(removedStampTemplateFileName,
						()=> {
							//pick the result the process left in the hard drive just to assert
							resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
							done();
						});
				});

				it("should not appear in the concrete", () => {
					resultingContents.should.eql(expectedContents);
				});
			});

			describe(".ignoringStamps", () => {
				let expectedContents,
					resultingContents;

				beforeEach(done => {
					expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/ignoringStampExpectation.spec.js`, {encoding: "utf8"});
					fs.writeFileSync(resultFilePath, concreteFilePath, {encoding: "utf8"});
					Ph.refresh(resultFilePath).ignoringStamps(["isFruit"]).with(templateFileName,
						() => {
							//pick the result the process left in the hard drive just to assert
							resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
							done();
						});
				});

				it("should not appear in the concrete", () => {
					resultingContents.should.eql(expectedContents);
				});
			});
		});

		describe(".replacing", () => {
			describe("(with strings)", () => {
				let expectedContents,
					resultingContents,
					replaceTemplateFileName;

				beforeEach(done => {
					replaceTemplateFileName = `${__dirname}/../fixtures/ph/replaceTemplate.js`;
					expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/toNewOrangeExpectation.spec.js`, {encoding: "utf8"});
					fs.writeFileSync(resultFilePath, "", {encoding: "utf8"});
					Ph.refresh(resultFilePath)
						.replacing({
							"Apple": "Orange",
							"apple": "orange",
							"input": "juice",
							"return true;": "return false;"
						})
						.with(replaceTemplateFileName,
						()=> {
							//pick the result the process left in the hard drive just to assert
							resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
							done();
						});
				});

				it("should make all replacements on stamps and the regular content lines but not on phs", () => {
					resultingContents.should.eql(expectedContents);
				});
			});

			describe("(with regex)", () => {
				let expectedContents,
					resultingContents,
					replaceTemplateFileName;

				beforeEach(done => {
					replaceTemplateFileName = `${__dirname}/../fixtures/ph/replaceTemplate.js`;
					expectedContents = fs.readFileSync(`${__dirname}/../fixtures/ph/expectations/toNewOrangeExpectation.spec.js`, {encoding: "utf8"});
					fs.writeFileSync(resultFilePath, "", {encoding: "utf8"});
					Ph.refresh(resultFilePath)
						.replacing({
							[/Apple/g]: "Orange",
							[/apple/g]: "orange",
							[/input/g]: "juice",
							[/return true;/g]: "return false;"
						})
						.with(replaceTemplateFileName,
						()=> {
							//pick the result the process left in the hard drive just to assert
							resultingContents = fs.readFileSync(resultFilePath, {encoding: "utf8"});
							done();
						});
				});

				it("should make all replacements on stamps and the regular content lines but not on phs", () => {
					resultingContents.should.eql(expectedContents);
				});
			});
		});
	});
});
