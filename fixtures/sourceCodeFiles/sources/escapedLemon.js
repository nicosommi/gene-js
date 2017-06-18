/* ph replacements */
/* className, /Lemon/g, Lemon */
/* escapedRequirement, /..\/somethingLemon/g, ../somethingLemon */
/* endph */
/* ph stamps */
/* /^.*$/ */
/* endph */

const escapedRequirement = proxyquire('../somethingLemon.js', this.mocks);

/* stamp withSeedsSymbol */
const generateSeeds = Symbol("generateSeeds");
/* endstamp */


export default class Lemon {
	constructor() {
		/* ph constructor */
		this[generateSeeds](4, 6);
		/* endph */
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
