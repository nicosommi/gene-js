import SwComponent from "../es6/lib/swComponent.js";
import Promise from "../es6/lib/promise.js";
import sinon from "sinon";

describe("SwComponent", () => {
	let swComponent,
		name,
		type,
		options,
		synchronizeSpy,
		constructorSpy,
		addSourceCodeFilesSpy,
		cleanToSpy;

	class SwBlockClass {
		constructor() {
			constructorSpy.apply(this, arguments);
			this.name = arguments[0];
			this.type = arguments[1];
			this.options = arguments[2];
		}

		addSourceCodeFiles(...args) {
			addSourceCodeFilesSpy.apply(this, args);
		}

		clean() {
			cleanToSpy();
		}

		synchronizeWith() {
			return synchronizeSpy();
		}
	}

	beforeEach(() => {
		name = "fruitService";
		type = "service";
		options = {};
		synchronizeSpy = sinon.spy(() => Promise.resolve());
		constructorSpy = sinon.spy(() => Promise.resolve());
		addSourceCodeFilesSpy = sinon.spy(() => Promise.resolve());
		cleanToSpy = sinon.spy(() => Promise.resolve());
		SwComponent.__Rewire__("SwBlock", SwBlockClass);
		swComponent = new SwComponent(name, type, options);
	});

	describe("constructor(name, type, options)", () => {
		it("should set the source block name", () => {
			swComponent.name.should.equal(name);
		});

		it("should set the block type", () => {
			swComponent.type.should.equal(type);
		});

		it("should set the options if provided", () => {
			swComponent.options.should.eql(options);
		});
	});

	describe("(adding blocks files)", () => {
		describe(".addSwBlock(source, clean, options)", () => {
			let swBlockName,
				swBlockType,
				swBlockObj;

			beforeEach(() => {
				swBlockName = "";
				type = "";
				swBlockObj = {name: swBlockName, swBlockType};
				swComponent.addSwBlock(swBlockObj);
			});

			it("should add the source file to the array", () => {
				swComponent.swBlocks.should.eql([new SwBlockClass(swBlockName, swBlockType, options)]);
			});

			it("should pass the option properties to the source code options along with the specific ones", () => {
				swComponent = new SwComponent(name, type, { aproperty: 1, onemore: 2 });
				swComponent.addSwBlock({name: "aname", swBlockType, options: { onemore: 3 }});
				swComponent.swBlocks[0].options.should.eql({ aproperty: 1, onemore: 3 });
			});
		});

		describe(".addSwBlocks(array)", () => {
			let inputArray,
				expectedArray;

			beforeEach(() => {
				const firstElement = { name: "firstElement", type: "sourceCodeFileExample", options: {} };
				const secondElement = { name: "secondElement", type: "oneMoreSwBlockExample", options: {} };
				inputArray = [];
				inputArray.push(firstElement);
				inputArray.push(secondElement);

				expectedArray = [];
				expectedArray.push(new SwBlockClass(firstElement.name, firstElement.type, options));
				expectedArray.push(new SwBlockClass(secondElement.name, secondElement.type, options));
				swComponent.addSwBlocks(inputArray);
			});

			it("should add the source file to the array", () => {
				swComponent.swBlocks.should.eql(expectedArray);
			});
		});
	});

	describe("(methods)", () => {
		let inputArray,
			sourceSwComponent;

		beforeEach(() => {
			const firstElement = { name: "firstElement", type: "sourceCodeFileExample", options: {} };
			const secondElement = { name: "secondElement", type: "oneMoreSourceCodeFileExample", options: {} };
			inputArray = [];
			inputArray.push(firstElement);
			inputArray.push(secondElement);

			sourceSwComponent = new SwComponent("rootFruitService", "basket", {});
		});

		describe(".synchronizeWith(rootSwBlock)", () => {

			beforeEach(() => {
				sourceSwComponent.addSwBlocks(inputArray);
				swComponent.addSwBlocks(inputArray);
			});

			it("should call the synchronize method when synchronize sourceCodeFile", () => {
				return swComponent.synchronizeWith(sourceSwComponent.swBlocks[0])
					.then(() => {
						synchronizeSpy.callCount.should.equal(1);
						return Promise.resolve();
					});
			});

			it("should add the new blocks using the supplied base type and the base name", () => {
				sourceSwComponent.addSwBlock({ name: "thirdElement", type: "thirdType"});
				return swComponent.synchronizeWith(sourceSwComponent)
					.then(() => {
						constructorSpy.getCall(4).args.should.eql(["thirdElement", "thirdType", options]);
						return Promise.resolve();
					});
			});
		});

		describe(".clean()", () => {
			beforeEach(() => {
				sourceSwComponent.addSwBlocks(inputArray);
				swComponent.addSwBlocks(inputArray);
			});

			it("should provide the clean method", () => {
				return swComponent.clean()
					.then(() => {
						cleanToSpy.callCount.should.equal(2);
					});
			});
		});
	});
});
