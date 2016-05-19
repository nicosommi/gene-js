import gulp from "gulp";

gulp.task("test-watch", ["suppress-errors"], () => {
  gulp.watch([
    "./source/**/*",
	"./spec/**/*"
], ["test-coverage"]);
});
