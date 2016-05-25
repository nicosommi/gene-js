export default class Apple {
	/* ph appleTopMethods */
	constructor() {
		this.worm = true;
	}
	/* endph */

	bite() {
		let input;
		/* ph staticMethodImplementation */
		input = "you got it";
		/* endph */
		return input;
	}

	/* ph appleBottomMethods */
	eat() {
		return "yum";
	}
	/* endph */
}
