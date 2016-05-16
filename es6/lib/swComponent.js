import SwBlock from "./swBlock.js";
import Promise from "./promise.js";

export default class SwComponent {
	constructor(name, type, options) {
		this.name = name;
		this.type = type;
		this.options = options;
		this.swBlocks = [];
	}

	addSwBlock(swBlock) {
		const newOptions = Object.assign({}, this.options, swBlock.options); // passing options through
		const newSwBlock = new SwBlock(swBlock.name, swBlock.type, swBlock.version, newOptions);
		newSwBlock.addSourceCodeFiles(swBlock.sourceCodeFiles);
		this.swBlocks.push(newSwBlock);
		return newSwBlock;
	}

	addSwBlocks(swBlocks) {
		swBlocks.forEach(swBlock => this.addSwBlock(swBlock));
	}

	getMeta() {
		return Promise.all(this.swBlocks.map(swBlock => {
			return swBlock.getMeta();
		}))
			.then(results => {
				return Promise.resolve({
					name: this.name,
					type: this.type,
					swBlocks: results
				});
			});
	}

	synchronizeWith(rootBlock) {
		return new Promise(
			(resolve, reject) => {
				let promise;

				// find this.swBlock
				const matchingSwBlocks = this.swBlocks.filter(swBlock => (swBlock.type === rootBlock.type));
				if(matchingSwBlocks && matchingSwBlocks.length > 0) {
					promise = Promise.all(
						matchingSwBlocks.map(matchingSwBlock => matchingSwBlock.synchronizeWith(rootBlock))
					);
				} else {
					const newSwBlock = this.addSwBlock({
						name: rootBlock.name,
						type: rootBlock.type,
						options: this.options,
						sourceCodeFiles: []
					});
					promise = newSwBlock.synchronizeWith(rootBlock);
				}

				promise.then(() => resolve())
					.catch(reject);
			}
		);
	}

	clean(dirtyPhs) {
		const promises = this.swBlocks.map(swBlock => swBlock.clean(dirtyPhs));
		return Promise.all(promises);
	}
}
