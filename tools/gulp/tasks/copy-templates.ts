import { dest, src, task} from 'gulp';

const copyTemplates = (done:any) => {
    src(['./templates/**/*']).pipe(dest('./dist/templates'));
    src(['package.json', 'README.md']).pipe(dest('./dist'));
    done();
};

task('copy-templates', copyTemplates);
