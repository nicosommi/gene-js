/* ph replacements */
/* className, /Banana/g, Banana */
/* endph */
/* ph ignoringStamps */
/* throwAway */
/* endph */

/* stamp withSeedsSymbol */
const generateSeeds = Symbol("generateSeeds");
/* endstamp */


export default class Banana {
	constructor() {
		/* ph constructor */
		this[generateSeeds](1, 2);
		/* endph */
	}

	/* ph price */
	// this is an old now deprecated ph
	get price () {
		return 1;
	}
	/* endph */

	/* stamp withSeeds */
	[generateSeeds](min, max) {
		this.seeds = Math.floor((Math.random() * ((max + 1) - min + 1)) + min);
	}
	/* endstamp */

	eat() {
		/* ph onomatopoeia */
		return "niam";
		/* endph */
	}

	/* stamp throwAway */
	/* endstamp */
}
