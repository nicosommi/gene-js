import _ from "incognito";
import flowsync from "flowsync";
import fs from "fs";
import readline from "readline";
import Blocks from "block-js";
import mkdirp from "mkdirp";
import path from "path";
import regexParser from "regex-parser";

const executeReplacements = Symbol("executeReplacements");
/*
* placeholder.js is mented to be used in certain blocks on certains files
* in order to improve the development process, then some assumptions were made
*/

export default class Ph {

	constructor(targetFilePath) {
		_(this).targetFilePath = targetFilePath;
		_(this).ignoringStamps = [];
		_(this).replacements = null;
	}

	static refresh(targetFilePath) {
		return new Ph(targetFilePath);
	}

	static using(dirtyFilePath) {
		return new Ph(dirtyFilePath);
	}

	static getPlaceHolders(fileName, customDelimiters) {
		return new Blocks(fileName, "ph", customDelimiters);
	}

	static getStamps(fileName, customDelimiters) {
		return new Blocks(fileName, "stamp", customDelimiters);
	}

	withThisDelimiters(start, end) {
		_(this).customDelimiters = { start, end };
		return this;
	}

	replacing(replacementsObject) {
		_(this).replacements = replacementsObject;
		return this;
	}

	ignoringStamps(stampsToIgnore) {
		_(this).ignoringStamps = stampsToIgnore;
		return this;
	}

	[executeReplacements](line) {
		let thereAreReplacements = (_(this).replacements != null);
		if(thereAreReplacements && line && line.length > 0) {
			let finalLine = line;
			Object.keys(_(this).replacements).forEach(
				(replacementKey) => {
					let key = regexParser(replacementKey);
					if(replacementKey
						&& replacementKey.indexOf("/") === 0
						&& replacementKey.lastIndexOf("/") > 0) {
						key = regexParser(replacementKey);
					} else {
						key = new RegExp(replacementKey, "g");
					}
					finalLine = finalLine.replace(
						key,
						_(this).replacements[replacementKey]
					);
				}
			);
			return finalLine;
		} else {
			return line;
		}
	}

	cleanTo(cleanFilePath, callback) {
		// TODO: clean placeholders
		let blocks;
		flowsync.series([
			next => {
				fs.stat(cleanFilePath,
					errorCleanFilePath => {
						if(errorCleanFilePath) {
							mkdirp(path.dirname(cleanFilePath), () => {
								fs.writeFile(cleanFilePath, "", { encoding: "utf8" }, (error) => {
									next(error);
								});
							});
						} else {
							next();
						}
					}
				);
			},
			next => {
				Ph.getPlaceHolders(_(this).targetFilePath, _(this).customDelimiters)
					.extractBlocks()
					.then(_blocks => {
						blocks = _blocks;
						next();
					})
					.catch(next);
			},
			next => {
				Ph.getStamps(_(this).targetFilePath, _(this).customDelimiters)
					.extractBlocks()
					.then(_blocks => {
						blocks = blocks.concat(_blocks);
						next();
					})
					.catch(next);
			}
		],
			(errors) => {
				if(errors) {
					callback(errors);
				} else {
					// read file line by line creating a concrete new file
					// prepare concrete contents
					let concreteFileContent = "";
					// read template file line by line
					const lineReader = readline.createInterface({ input: fs.createReadStream(_(this).targetFilePath, { encoding: "utf8" }) });
					let lineNumber = 0;
					let ignoreLines = false;
					lineReader.on("line",
						(line) => {
							lineNumber++;
							const beginPh = blocks
								.find(
									currentPh => {
										return (currentPh.from === lineNumber);
									}
								);
							const endPh = blocks
								.find(
									currentPh => {
										return (currentPh.to === lineNumber);
									}
								);

							// core block to ignore block delimiters and deprecated content
							if(!beginPh && !endPh && !ignoreLines) {
								concreteFileContent += `${line}\n`;
							} else if(beginPh && !ignoreLines && beginPh.name === "deprecated") {
								ignoreLines = true;
							} else if(endPh && ignoreLines) {
								ignoreLines = false;
							}
						});
					lineReader.on("close",
						() => {
							fs.writeFile(cleanFilePath, concreteFileContent, {encoding: "utf8"},
								(error) => {
									callback(error);
								}
							);
						});
				}
			}
		);
	}

	with(templateFilePath, callback) {
		let commentStringStart;
		let commentStringEnd;
		flowsync.series([
			next => {
				// TODO: this is not clean
				let temporalBlock = Ph.getPlaceHolders(templateFilePath, _(this).customDelimiters);
				commentStringStart = temporalBlock.startBlockString;
				commentStringEnd = temporalBlock.endBlockString;
				next();
			},
			next => {
				Ph.getPlaceHolders(templateFilePath, _(this).customDelimiters)
				.extractBlocks()
				.then(_blocks => {
					_(this).templatePlaceHolders = _blocks;
					next();
				})
				.catch(next);
			},
			next => {
				Ph.getStamps(templateFilePath, _(this).customDelimiters)
				.extractBlocks()
				.then(_blocks => {
					_(this).templateStamps = _blocks;
					next();
				})
				.catch(next);
			},
			next => {
				fs.stat(_(this).targetFilePath,
					errorTargetFilePath => {
						if(errorTargetFilePath) {
							mkdirp(path.dirname(_(this).targetFilePath), () => {
								fs.writeFile(_(this).targetFilePath, "", { encoding: "utf8" }, (error) => {
									next(error);
								});
							});
						} else {
							next();
						}
					}
				);
			},
			next => {
				Ph.getPlaceHolders(_(this).targetFilePath, _(this).customDelimiters)
				.extractBlocks()
				.then(_blocks => {
					_(this).targetPlaceHolders = _blocks;
					next();
				})
				.catch(next);
			}
		], (errors) => {
			if(errors) {
				callback(errors);
			} else {
				const result = [];
				let deprecated;

				_(this).templatePlaceHolders.forEach((templatePlaceHolder) => {
					let placeHolder = _(this).targetPlaceHolders.find((targetPlaceHolder) => {
						const found = targetPlaceHolder.name === templatePlaceHolder.name;
						if(found) {
							targetPlaceHolder.found = true;
						}
						return found;
					});
					if(!placeHolder) {
						placeHolder = templatePlaceHolder;
					}
					result.push(placeHolder);
				});

				deprecated = _(this).targetPlaceHolders.find((targetPlaceHolder) => {
					return (targetPlaceHolder.name === "deprecated");
				});

				// find if there is a deprecated ph already there
				if(!deprecated) {
					deprecated = {name: "deprecated", content: ""};
				}

				let deprecatedPhs = _(this).targetPlaceHolders.filter(
					(ph) => {
						return (ph.name !== "deprecated") && !(ph.found);
					}
				);

				deprecatedPhs.forEach((deprecatedPh) => {
					if(deprecated.content.length > 0) {
						deprecated.content += `\n`;
					}
					const replacedContent = deprecatedPh.content.replace(/\n/g, ` ${commentStringEnd}\n${commentStringStart}`);
					deprecated.content += `${commentStringStart} name: ${deprecatedPh.name} ${commentStringEnd}\n${commentStringStart} content: ${replacedContent} ${commentStringEnd}`;
				});

				if(deprecated.content.length > 0) {
					result.push(deprecated);
				}

				// prepare concrete contents
				let concreteFileContent = "";
				// read template file line by line
				const lineReader = readline.createInterface({ input: fs.createReadStream(templateFilePath, { encoding: "utf8" }) });
				let lineNumber = 0;
				let ignoreLines = false;
				lineReader.on("line",
					(line) => {
						lineNumber++;
						const endPlaceholder = _(this).templatePlaceHolders
							.find(
								templatePlaceholder => {
									return templatePlaceholder.to === lineNumber;
								}
							);
						if(endPlaceholder) {
							ignoreLines = false;
						}

						// if the line matches the line of a newPhs element, put the contents from the ph there
						const placeholder = _(this).templatePlaceHolders
							.find(
								templatePlaceholder => {
									return templatePlaceholder.from === lineNumber;
								}
							);

						const stampBegin = _(this).templateStamps.find(
							templateStamp => {
								return (templateStamp.from === lineNumber);
							}
						);

						const stampEnd = _(this).templateStamps.find(
							templateStamp => {
								return (templateStamp.to === lineNumber);
							}
						);

						const addLine = !ignoreLines;
						const isSpecialLine = (placeholder || endPlaceholder || stampBegin || stampEnd);

						if(addLine) {
							let finalLine = line;
							if(!isSpecialLine) { //do not replace ph/stamp lines!
								finalLine = this[executeReplacements](line);
							}
							concreteFileContent += `${finalLine}\n`;
						}

						if(placeholder) {
							const targetPlaceholder = _(this).targetPlaceHolders
								.find(
									targetPlaceHolder => {
										return targetPlaceHolder.name === placeholder.name;
									}
								);
							if(targetPlaceholder) {
								ignoreLines = true;
								concreteFileContent += targetPlaceholder.content + "\n";
							}
						} else {
							if(stampBegin) {
								ignoreLines = true;
								const ignored = _(this).ignoringStamps.find(
									stampsToIgnore => {
										return stampsToIgnore === stampBegin.name;
									}
								);
								if(!ignored) {
									const finalLine = this[executeReplacements](stampBegin.content);
									if(finalLine) {
										concreteFileContent += `${finalLine}\n`;
									}
								} else {
									concreteFileContent += ``; //nothing
								}
							} else {
								if(stampEnd) {
									ignoreLines = false;
									concreteFileContent += `${line}\n`;
								}
							}
						}
					});
				lineReader.on("close",
					() => {
						//put the deprecated ph if there is one
						if(deprecated && deprecated.content && deprecated.content.length > 0) {
							concreteFileContent += `${commentStringStart} ph deprecated ${commentStringEnd}\n${deprecated.content}\n${commentStringStart} endph ${commentStringEnd}\n`;
						}
						fs.writeFileSync(_(this).targetFilePath, concreteFileContent, {encoding: "utf8"});
						callback();
					});
			}
		});
	}
}
