#!/usr/bin/env nodejs

const gulp = require('gulp'),
      babel = require('gulp-babel');

gulp.task('babel', () => {
    return gulp.src('format.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['watch', 'babel']);

gulp.task('watch', () => {
    gulp.watch('babel', ['*.js']);
});
