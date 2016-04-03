import gulp from "gulp";
import del from "del";

gulp.task("clean", function () {
	return del(["./es5"]);
});
