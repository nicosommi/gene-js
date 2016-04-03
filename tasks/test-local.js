import gulp from "gulp";
import mocha from "gulp-mocha";
import istanbul from "gulp-babel-istanbul";
import "should";

const paths = {
	sourceCode: "./es6/**/*.js",
	spec: "./spec/**/*.spec.js"
};

function defineTestTask(taskName, reporters) {
	gulp.task(taskName, ["build"], (cb) => {
		gulp.src(paths.sourceCode)
			.pipe(istanbul({
				includeUntested: true
			})) // Covering files
			.pipe(istanbul.hookRequire()) // Force `require` to return covered files
			.on("finish", () => {
				gulp.src(paths.spec)
					.pipe(mocha())
					.pipe(istanbul.writeReports({ dir: `${__dirname}/../.coverage`, reporters })) // Creating the reports after tests ran
					.pipe(istanbul.enforceThresholds({ thresholds: { global: 100 } })) // Enforce a coverage of at least 90%
					.on("end", cb);
			});
	});
}

defineTestTask("test-local", ["text-summary", "lcovonly"]);
defineTestTask("test-coverage", ["text", "html"]);
