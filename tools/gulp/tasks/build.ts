import {task, dest, src} from 'gulp';
import ts from 'gulp-typescript';
import sourcemaps from 'gulp-sourcemaps';

const tscProject = ts.createProject('tsconfig.json');

const build = () => {
    const compiled = src(['src/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(tscProject());

    return compiled.js
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/src'));
};

task('build', build);
