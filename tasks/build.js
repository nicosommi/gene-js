import gulp from "gulp";
import babel from "gulp-babel";

function defineBuildLibrariesTask(taskName, libPath, distPath) {
	gulp.task(taskName, ["clean"], () => {
		return gulp.src(libPath)
			.pipe(babel())
			.pipe(gulp.dest(distPath));
	});
}

defineBuildLibrariesTask("build-lib", "./es6/**/*.js", "./es5");

gulp.task("build", ["clean", "build-lib"]);
