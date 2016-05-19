import gulp from "gulp";
import babel from "gulp-babel";

function defineBuildLibrariesTask(taskName, libPath, distPath) {
	gulp.task(taskName, ["clean"], () => {
		return gulp.src(libPath)
			.pipe(babel())
			.pipe(gulp.dest(distPath));
	});
}

defineBuildLibrariesTask("build-lib", "./source/**/*.js", "./dist");

gulp.task("build", ["clean", "build-lib"]);
