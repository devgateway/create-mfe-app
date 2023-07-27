import cpy from 'cpy';
import fs from 'fs';
import path from 'path';
import spawn from 'cross-spawn';
import { AppType, Language } from '../types';
import { installDependencies } from '../utils/install';
import { moduleFederationHost, moduleFederationRemote, startScript, webpackProductionConfig } from './files';

interface InstallTemplateOptions {
    template: string;
    root: string;
    language: string;
    appName: string;
    publicPath?: string;
    appType?: string;
    port?: number;
}

export const installTemplate = async (options: InstallTemplateOptions) => {
    const {
        template, root, language, appName, publicPath, appType, port
    } = options;

    const copySrc = ['**'];
    const templateDir = path.join(__dirname, template);

    /**
     * Create the module federation config file and write content.
     * Push it to the copySrc array.
     * */
    const moduleFederationConfigFileName = path.join(root, 'module-federation.config.js');

    let mfFileContent = '';
    if (appType === AppType.Remote) {
        mfFileContent = moduleFederationRemote({ appName });
        fs.writeFileSync(moduleFederationConfigFileName, mfFileContent);
        copySrc.push('module-federation.config.js');
    } else {
        mfFileContent = moduleFederationHost({ appName });
        fs.writeFileSync(moduleFederationConfigFileName, mfFileContent);
        copySrc.push('module-federation.config.js');
    }

    /**
     * Create start.js and write content.
     * Push it to the copySrc array where it should be in the /scripts folder.
     * */
    const startFileName = path.join(root, 'scripts/start.js');
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
    const startFileContent = startScript({ port: port || 3000 });
    fs.writeFileSync(startFileName, startFileContent);
    copySrc.push('scripts/start.js');

    /**
     * Create the webpack production config file and write content.
     * */
    const webpackProductionConfigFileName = path.join(root, 'scripts/overrides/webpack.prod.js');
    fs.mkdirSync(path.join(root, 'scripts/overrides'), { recursive: true });
    const webpackProductionConfigFileContent = webpackProductionConfig({ publicPath });
    fs.writeFileSync(webpackProductionConfigFileName, webpackProductionConfigFileContent);
    copySrc.push('scripts/overrides/webpack.prod.js');

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
