/* ph stamps */
/* /^.*$/ */
/* endph */

/* stamp withSeedsSymbol */
const generateSeeds = Symbol("generateSeeds");
/* endstamp */


export default class Kiwi {
	constructor() {
		/* ph constructor */
		this[generateSeeds](1, 60);
		/* endph */
	}

	/* stamp withSeeds */
	[generateSeeds](min, max) {
		this.seeds = Math.floor((Math.random() * ((max + 1) - min + 1)) + min);
	}
	/* endstamp */

	eat() {
		/* ph onomatopoeia */
		return "ugh";
		/* endph */
	}

	/* stamp throwAway */
	throwAway() {
		return "done";
	}
	/* endstamp */
}
