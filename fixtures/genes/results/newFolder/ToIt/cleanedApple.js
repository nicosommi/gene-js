/* className, /Apple/g, Apple */

const generateSeeds = Symbol("generateSeeds");


export default class Apple {
	constructor() {
		this[generateSeeds](4, 6);
	}

	[generateSeeds](min, max) {
		this.seeds = Math.floor((Math.random() * ((max + 1) - min + 1)) + min);
	}

	eat() {
		return "yum";
	}

	throwAway() {
		return "done";
	}
}
