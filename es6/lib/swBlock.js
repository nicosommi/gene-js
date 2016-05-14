import SourceCodeFile from "./sourceCodeFile.js";
import Promise from "./promise.js";
import path from "path";

export default class SwBlock {
	constructor(name, type, options) {
		this.name = name;
		this.type = type;
		this.options = options;
		this.sourceCodeFiles = [];
	}

	addSourceCodeFile(sourceCodeFile) {
		const newOptions = Object.assign({}, this.options, sourceCodeFile.options); // passing options through
		const newSourceCodeFile = new SourceCodeFile(sourceCodeFile.name, sourceCodeFile.path, sourceCodeFile.clean, newOptions);
		this.sourceCodeFiles.push(newSourceCodeFile);
		return newSourceCodeFile;
	}

	addSourceCodeFiles(sourceCodeFiles) {
		sourceCodeFiles.forEach(sourceCodeFile => this.addSourceCodeFile(sourceCodeFile));
	}

	getMeta() {
		return Promise.all(this.sourceCodeFiles.map(sourceCodeFile => sourceCodeFile.getMeta()))
			.then(results => {
				return Promise.resolve({
					name: this.name,
					type: this.type,
					sourceCodeFiles: results
				});
			});
	}

	synchronizeWith(rootBlock) {
		return new Promise(
			(resolve, reject) => {
				const errors = [];
				const promises = rootBlock.sourceCodeFiles.map(
					rootSourceCodeFile => {
						// find this.sourceCodeFile
						const matchingSourceCodeFile = this.sourceCodeFiles.find(sourceCodeFile => (sourceCodeFile.name === rootSourceCodeFile.name));
						if(matchingSourceCodeFile) {
							// create a potential promess to synchronizeWith
							// const promiseSynchronize = matchingSourceCodeFile.synchronizeWith(rootSourceCodeFile);
							// add promess to process list
							return matchingSourceCodeFile.synchronizeWith(rootSourceCodeFile);
						} else {
							// create a potential promess to create it
							// matchingSourceCodeFile = new SourceCodeFile();
							// const promiseSynchronize = matchingSourceCodeFile.synchronizeWith(rootSourceCodeFile);
							// add promess to process list
							// promises.push(promiseSynchronize);
							let newSourceCodeFile;
							if(this.options && this.options.basePath) {
								if(rootSourceCodeFile.options.basePath) {
									const targetBasePath = path.normalize(this.options.basePath);
									const targetCleanBasePath = path.normalize(`${this.options.basePath}/..`);
									const originalPath = path.normalize(rootSourceCodeFile.path);
									const originalBasePath = path.normalize(rootSourceCodeFile.options.basePath);
									const targetPath = originalPath.replace(originalBasePath, targetBasePath);
									const targetCleanPath = originalPath.replace(originalBasePath, targetCleanBasePath);
									newSourceCodeFile = this.addSourceCodeFile({
										name: rootSourceCodeFile.name,
										path: `${path.normalize(targetPath)}`,
										clean: `${path.normalize(targetCleanPath)}`
									});
									return newSourceCodeFile.synchronizeWith(rootSourceCodeFile);
								} else {
									errors.push(new Error(`ERROR: there is no base path provided for the source file ${rootSourceCodeFile.name} on the block of name ${rootBlock.name} and type ${rootBlock.type}. Please ammend that and try again.`));
								}
							} else {
								errors.push(new Error(`ERROR: there is no base path provided for the block ${this.name}, so the new source code file ${rootSourceCodeFile.name} cannot be added.`));
							}
						}
					}
				);

				// check processed list against sourceCodeFiles
				if(errors.length === 0) {
					Promise.all(promises).then(() => resolve());
				} else {
					reject(errors);
				}
			}
		);
	}

	clean(dirtyPhs) {
		const promises = this.sourceCodeFiles.map(sourceCodeFile => sourceCodeFile.clean(dirtyPhs));
		return Promise.all(promises);
	}
}
