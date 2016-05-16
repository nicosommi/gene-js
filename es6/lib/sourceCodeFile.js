import synchronize from "./synchronize.js";
import getMeta from "./getMeta.js";
import cleanTo from "./cleanTo.js";
import Promise from "./promise.js";
import path from "path";

export default class SourceCodeFile {
	constructor(name, filePath, options) {
		this.name = name;
		this.path = filePath;
		this.options = options;
	}

	getMeta() {
		return getMeta(this.path, this.options)
			.then((fileMetaInfo) => {
				let { replacements,
					ignoringStamps } = fileMetaInfo;

				return Promise.resolve({
					name: this.name,
					path: this.path,
					replacements,
					ignoringStamps
				});
			});
	}

	getFullPath() {
		return path.normalize(`${this.options.basePath}/${this.path}`);
	}

	getFullCleanPath() {
		return path.normalize(`${this.options.basePath}/${this.options.cleanPath}/${this.path}`);
	}

	synchronizeWith(rootSourceCodeFile) {
		if(!rootSourceCodeFile.path) {
			return Promise.reject(new Error(`No path defined for root file ${rootSourceCodeFile.name}`));
		} else {
			return synchronize(rootSourceCodeFile.getFullPath(), this.getFullPath(), this.options);
		}
	}

	clean(dirtyPhs) {
		if(!this.options.cleanPath) {
			return Promise.reject(new Error(`No clean path defined for file ${this.name}`));
		} else if(!this.path) {
			return Promise.reject(new Error(`No path defined for file ${this.name}`));
		} else {
			this.options.dirtyPhs = dirtyPhs || [];
			return cleanTo(this.getFullPath(), this.getFullCleanPath(), this.options);
		}
	}
}
