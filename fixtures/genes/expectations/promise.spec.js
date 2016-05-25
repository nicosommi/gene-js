import Promise from "../es6/lib/promise.js";

describe("Promise", () => {
	it("should have utility methods", () => {
		Promise.should.have.property("all");
	});
});
