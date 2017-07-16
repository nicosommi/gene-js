/* ph replacements */
/* className, /Apple/g, Apple */
/* endph */
/* ph ignoringStamps */
/* endph */

/* stamp withSeedsSymbol */
const generateSeeds = Symbol("generateSeeds");
/* endstamp */


export default class Apple {
	constructor() {
		this[generateSeeds](4, 6); // ph oneliner
		this.initialized = true; // stamp init
	}

	/* stamp withSeeds */
	[generateSeeds](min, max) {
		this.seeds = Math.floor((Math.random() * ((max + 1) - min + 1)) + min);
	}
	/* endstamp */

	eat() {
		/* ph onomatopoeia */
		return "yum";
		/* endph */
	}

	/* stamp throwAway */
	throwAway() {
		return "done";
	}
	/* endstamp */
}
