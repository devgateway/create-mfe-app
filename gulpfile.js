const path = require('path');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const projectDir = __dirname;
const tsconfigPath = path.join(projectDir, './tools/gulp/tsconfig.json');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('build-app', () => {
    const tscResult = gulp.src(['index.ts']).pipe(tsProject());
    return tscResult.js
        .pipe(sourcemaps.init())
        .pipe(gulp.dest('dist'));
});

require('ts-node').register({
    project: tsconfigPath
});

require('./tools/gulp/gulpfile');
