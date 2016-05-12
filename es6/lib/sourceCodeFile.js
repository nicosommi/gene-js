import synchronize from "./synchronize.js";
import cleanTo from "./cleanTo.js";
import Promise from "./promise.js";

export default class SourceCodeFile {
	constructor(name, filePath, cleanPath, options) {
		this.name = name;
		this.path = filePath;
		this.cleanPath = cleanPath;
		this.options = options;
	}

	synchronizeWith(rootSourceCodeFile) {
		if(!rootSourceCodeFile.path) {
			return Promise.reject(new Error(`No path defined for root file ${rootSourceCodeFile.name}`));
		} else {
			return synchronize(rootSourceCodeFile.path, this.path, this.options);
		}
	}

	clean(dirtyPhs) {
		if(!this.cleanPath) {
			return Promise.reject(new Error(`No clean path defined for file ${this.name}`));
		} else if(!this.path) {
			return Promise.reject(new Error(`No path defined for file ${this.name}`));
		} else {
			this.options.dirtyPhs = dirtyPhs || [];
			return cleanTo(this.path, this.cleanPath, this.options);
		}
	}
}
