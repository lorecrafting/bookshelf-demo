var gulp = require('gulp');
var scss = require('gulp-sass');
var browserSync = require('browser-sync');

browserSync.init({
    proxy: `localhost:${process.env.EXPRESS_CONTAINER_PORT}`
});

// gulp.task defines a new task giving it a name and a callback function which will be called when the task is run 
gulp.task('scss', function () {
    // sets the  source folder where the files are located
    return gulp.src('./scss/**/*.scss')
        .pipe(scss.sync().on('error', scss.logError))
        // gulp.dest sets the destination folder where files will be placed
        .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function () {
    // gulp.watch watches files for changes 
    gulp.watch('./scss/**/*', ['scss']);
    gulp.watch('./public/**/*').on('change', browserSync.reload);
    gulp.watch('./views/**/*').on('change', browserSync.reload);
});



gulp.task('default', ['watch']);
