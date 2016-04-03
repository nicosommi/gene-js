import Promise from "./promise.js";
import Blocks from "block-js";
import fs from "fs-extra";
import path from "path";
import readline from "readline";
import regexParser from "regex-parser";

const ensureFile = Promise.promisify(fs.ensureFile);
const stat = Promise.promisify(fs.stat);

export function executeReplacements(line, replacements) {
	let thereAreReplacements = (replacements != null);
	if(thereAreReplacements && line && line.length > 0) {
		let finalLine = line;
		Object.keys(replacements).forEach(
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
					replacements[replacementKey]
				);
			}
		);
		return finalLine;
	} else {
		return line;
	}
}

function cleanContent(content, dirtyStrings) {
	dirtyStrings.forEach((dirtyString) => {
		content = content.replace(dirtyString, "");
	});
	return content;
}

function takeReplacements(blocks, commentStringStart, commentStringEnd) {
	const replacementsPh = blocks.find(targetBlock => (targetBlock.name === "replacements"));
	if(replacementsPh) {
		const replacements = {};
		if(replacementsPh.content) {
			const replacementLines = replacementsPh.content.split("\n");
			replacementLines.forEach(
				replacementLine => {
					const tokens = cleanContent(replacementLine, [commentStringStart, commentStringEnd])
						.split(", ")
						.map(token => token.trim());
					const name = tokens[0];
					const regex = tokens[1];
					const value = tokens[2];
					replacements[name] = { regex, value };
				}
			);
			return replacements;
		} else {
			return {};
		}
	} else {
		return {};
	}
}

function takeIgnoringStamps(blocks, commentStringStart, commentStringEnd) {
	const ignoringStampsPh = blocks.find(targetBlock => (targetBlock.name === "ignoringStamps"));
	if(ignoringStampsPh) {
		let ignoringStamps = [];
		if(ignoringStampsPh.content) {
			const ignoringStampLines = ignoringStampsPh.content.split("\n");
			ignoringStampLines.forEach(
				ignoringStampLine => {
					const tokens = cleanContent(ignoringStampLine, [commentStringStart, commentStringEnd])
						.split(",")
						.map(token => token.trim());
					ignoringStamps = ignoringStamps.concat(tokens);
				}
			);
			return ignoringStamps;
		} else {
			return [];
		}
	} else {
		return [];
	}
}

function mergeReplacements(sourceReplacements, targetReplacements) {
	const replacements = {};
	const sourceReplacementKeys = Object.keys(sourceReplacements);
	const targetReplacementKeys = Object.keys(targetReplacements);
	targetReplacementKeys.forEach(
		targetReplacementKey => {
			const matchingSourceReplacementKey = sourceReplacementKeys.find(sourceReplacementKey => (sourceReplacementKey === targetReplacementKey));
			if(matchingSourceReplacementKey) {
				const regex = sourceReplacements[matchingSourceReplacementKey].regex;
				const value = targetReplacements[targetReplacementKey].value;
				replacements[regex] = value;
			} else {
				throw new Error(`Missing replacement placeholer on the source (${targetReplacementKey})`);
			}
		}
	);
	return replacements;
}

function takeOptions(sourceBlocks, targetBlocks, commentStringStart, commentStringEnd) {
	const options = {};
	const sourceReplacements = takeReplacements(sourceBlocks, commentStringStart, commentStringEnd);
	const targetReplacements = takeReplacements(targetBlocks, commentStringStart, commentStringEnd);
	options.replacements = mergeReplacements(sourceReplacements, targetReplacements);
	options.ignoringStamps = takeIgnoringStamps(targetBlocks, commentStringStart, commentStringEnd);
	return options;
}

export default function synchronize(source, target, options) {
	return new Promise(
		(resolve, reject) => {
			let delimiters;
			let force;
			if(options) {
				delimiters = options.delimiters;
				force = options.force;
			}
			// TODO: suppport block array name on blocks to reduce file reading
			const sourcePhsBlocksClass = new Blocks(source, "ph", delimiters);
			const sourceStampsBlocksClass = new Blocks(source, "stamp", delimiters);
			const targetPhsBlocksClass = new Blocks(target, "ph", delimiters);
			const targetStampsBlocksClass = new Blocks(target, "stamp", delimiters);
			const commentStringStart = sourcePhsBlocksClass.startBlockString;
			const commentStringEnd = sourcePhsBlocksClass.endBlockString;

			let fileExist = true;

			let sourcePhBlocks = [];
			let sourceStampBlocks = [];
			let targetPhBlocks = [];
			// let targetStampBlocks = []; //not needed yet(
			stat(target)
			.then(() => Promise.resolve())
			.catch(() => {
				fileExist = false;
			})
			.then(() => ensureFile(target))
				.then(
					() => {
						Promise.props({
							sourcePhBlocks: sourcePhsBlocksClass.extractBlocks(),
							sourceStampBlocks: sourceStampsBlocksClass.extractBlocks(),
							targetPhBlocks: targetPhsBlocksClass.extractBlocks(),
							targetStampBlocks: targetStampsBlocksClass.extractBlocks()
						})
						.then(
							(results) => {
								sourcePhBlocks = results.sourcePhBlocks;
								sourceStampBlocks = results.sourceStampBlocks;
								targetPhBlocks = results.targetPhBlocks;
								// targetStampBlocks = results.targetStampBlocks; //not needed yet

								if(!options || (!options.replacements && !options.ignoringStamps)) {
									options = takeOptions(sourcePhBlocks, targetPhBlocks, commentStringStart, commentStringEnd);
								}

								if(fileExist && sourcePhBlocks.length > 1 && targetPhBlocks.length === 0 && !force) {
									throw new Error(`Warning, there is too much difference between ${path.basename(source)} and ${path.basename(target)}. Make sure it's OK and use force flag.`);
								}

								return Promise.resolve();
							}
						)
						.then(
							() => {

								const result = [];
								let deprecated;

								sourcePhBlocks.forEach((templatePlaceHolder) => {
									let placeHolder = targetPhBlocks.find((targetPlaceHolder) => {
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

								deprecated = targetPhBlocks.find((targetPlaceHolder) => {
									return (targetPlaceHolder.name === "deprecated");
								});

								// find if there is a deprecated ph already there
								if(!deprecated) {
									deprecated = {name: "deprecated", content: ""};
								}

								let deprecatedPhs = targetPhBlocks.filter(
									(ph) => {
										return (ph.name !== "deprecated") && !(ph.found);
									}
								);

								deprecatedPhs.forEach((deprecatedPh) => {
									if(deprecated.content.length > 0) {
										deprecated.content += `\n`;
									}
									let finalContent = "";
									if(deprecatedPh.content) {
										finalContent = deprecatedPh.content.replace(/\n/g, ` ${commentStringEnd}\n${commentStringStart}`);
									}
									const replacedContent = finalContent;
									deprecated.content += `${commentStringStart} name: ${deprecatedPh.name} ${commentStringEnd}\n${commentStringStart} content: ${replacedContent} ${commentStringEnd}`;
								});

								if(deprecated.content.length > 0) {
									result.push(deprecated);
								}

								// prepare concrete contents
								let concreteFileContent = "";
								// read template file line by line
								const lineReader = readline.createInterface({ input: fs.createReadStream(source, { encoding: "utf8" }) });
								let lineNumber = 0;
								let ignoreLines = false;
								lineReader.on("line",
									(line) => {
										lineNumber++;
										const endPlaceholder = sourcePhBlocks
											.find(
												templatePlaceholder => {
													return templatePlaceholder.to === lineNumber;
												}
											);
										if(endPlaceholder) {
											ignoreLines = false;
										}

										// if the line matches the line of a newPhs element, put the contents from the ph there
										const placeholder = sourcePhBlocks
											.find(
												templatePlaceholder => {
													return templatePlaceholder.from === lineNumber;
												}
											);

										const stampBegin = sourceStampBlocks.find(
											templateStamp => {
												return (templateStamp.from === lineNumber);
											}
										);

										const stampEnd = sourceStampBlocks.find(
											templateStamp => {
												return (templateStamp.to === lineNumber);
											}
										);

										const addLine = !ignoreLines;
										const isSpecialLine = (placeholder || endPlaceholder || stampBegin || stampEnd);

										if(addLine) {
											let finalLine = line;
											if(!isSpecialLine) { //do not replace ph/stamp lines!
												finalLine = executeReplacements(line, options.replacements);
											}
											concreteFileContent += `${finalLine}\n`;
										}

										if(placeholder) {
											const targetPlaceholder = targetPhBlocks
												.find(
													targetPlaceHolder => {
														return targetPlaceHolder.name === placeholder.name;
													}
												);
											if(targetPlaceholder) {
												ignoreLines = true;
												if(!targetPlaceholder.content) {
													concreteFileContent += "";
												} else {
													concreteFileContent += `${targetPlaceholder.content}\n`;
												}

											}
										} else {
											if(stampBegin) {
												ignoreLines = true;
												const ignored = options.ignoringStamps.find(
													stampsToIgnore => {
														return stampsToIgnore === stampBegin.name;
													}
												);
												if(!ignored) {
													const finalLine = executeReplacements(stampBegin.content, options.replacements);
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
										fs.writeFileSync(target, concreteFileContent, {encoding: "utf8"});
										resolve();
									});
							}
						)
						.catch(reject);
					}
				)
				.catch(reject);
		}
	);
}
