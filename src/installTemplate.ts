import cpy from 'cpy';
import fs from 'fs';
import path from 'path';
import spawn from 'cross-spawn';
import { AppType, Language } from './types';
import { installDependencies } from './utils/install';

interface InstallTemplateOptions {
    template: string;
    root: string;
    language: string;
    appName: string;
    publicPath?: string;
    appType?: string;
    port?: number;
    useReactRouter?: boolean;
}

export const installTemplate = async (options: InstallTemplateOptions) => {
    const {
        template, root, language, appName, publicPath, appType, port, useReactRouter
    } = options;

    const copySrc = ['**'];
    const templateDir = path.join(__dirname, '../templates', template);

    /**
     * Copy the template files from template to the target directory.
     */
    console.log('\nInitializing project with template:', template, '\n');

    await cpy(copySrc, root, {
        cwd: templateDir,
        parents: true,
        rename: (name) => {
            if (name === 'gitignore') {
                return '.gitignore';
            } if (name === 'README-template.md') {
                return 'README.md';
            }
            return name;
        }
    });

    /**
     * Create a package.json for the new project.
     */
    const browserslist = {
        production: [
            '>0.2%',
            'not dead',
            'not op_mini all'
        ],
        development: [
            'last 1 chrome version',
            'last 1 firefox version',
            'last 1 safari version'
        ]
    };
    const packageJson = {
        name: appName,
        version: '1.0.0',
        private: true,
        scripts: {
            start: 'node scripts/start.js',
            build: `PUBLIC_URL=${publicPath || '/'} node scripts/build.js`,
            'lint:fix': 'eslint . --ext .js,.jsx,.ts,.tsx --fix'
        },
        browserslist
    };

    fs.writeFileSync(
        path.join(root, 'package.json'),
        `${JSON.stringify(packageJson, null, 2)}\n`
    );

    const dependencies = [
        '@testing-library/jest-dom',
        '@testing-library/react',
        '@testing-library/user-event',
        'react',
        'react-dom',
        'react-scripts',
        'web-vitals',
        '@babel/plugin-proposal-private-property-in-object'
    ];

    if (language === Language.TypeScript) {
        const tsDependencies = [
            '@types/jest',
            '@types/node',
            '@types/react',
            '@types/react-dom'
        ];

        dependencies.push(...tsDependencies);
    }

    if (useReactRouter) {
        const routerDependencies = [
            'react-router-dom'
        ];

        dependencies.push(...routerDependencies);
    }

    await installDependencies({ root, dependencies })
        .then(() => {
            console.log('\n✅ Dependencies installed');
            // lint the project

            const lint = spawn.sync(
                'npm',
                ['run', 'lint:fix'],
                { stdio: 'inherit' }
            );

            if (lint.status !== 0) {
                console.log('Linting failed');
                process.exit(1);
            }

            console.log('\n✅ Linting complete');
        });
};
