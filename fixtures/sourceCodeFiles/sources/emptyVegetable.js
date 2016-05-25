export default class Vegetable {
	constructor() {
	}

	wash() {
		return Promise.reject();
	}

	eat() {
		return "no way";
	}

	throwAway() {
		return "done";
	}
}
