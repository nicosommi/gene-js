/* ph replacements */
/* className, /SeedlessBanana/g, SeedlessBanana */
/* endph */
/* ph stamps */
/* /^(?!throwAway{1})(?!withSeeds{1})(?!withSeedsSymbol{1}).*$/ */
/* endph */

/* stamp withSeedsSymbol */
const generateSeeds = Symbol("generateSeeds");
/* endstamp */


export default class SeedlessBanana {
	constructor() {
		/* ph constructor */
		/* endph */
	}

	/* stamp withSeeds */
	[generateSeeds](min, max) {
		this.seeds = Math.floor((Math.random() * ((max + 1) - min + 1)) + min);
	}
	/* endstamp */

	eat() {
		/* ph onomatopoeia */
		return "puaj";
		/* endph */
	}

	/* stamp throwAway */
	throwAway() {
		return "you will die";
	}
	/* endstamp */
}
