import gulp from "gulp";

gulp.task("test-watch", ["suppress-errors"], () => {
  gulp.watch([
    "./es6/**/*",
	"./spec/**/*"
], ["test-coverage"]);
});
