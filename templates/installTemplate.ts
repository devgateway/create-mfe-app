import cpy from 'cpy';
import fs from 'fs';
import path from "path";
import {Language} from "../types";

interface InstallTemplateOptions {
    template: string;
    root: string;
    language: string;
    appName: string;
}

export const installTemplate = async (options: InstallTemplateOptions) => {
    const { template, root, language, appName } = options;

    const copySrc = ['**'];
    const templateDir = path.join(__dirname, '../templates', template);

    /**
     * Copy the template files from template to the target directory.
     */
    console.log('\nInitializing project with template:', template, '\n');

    await cpy(copySrc, root, {
        cwd: templateDir,
        rename: (name) => {
            switch (name) {
                case 'gitignore':
                    return '.gitignore';
                case 'README-template.md':
                    return 'README.md';
                default:
                    return name;
            }
        }
    });

    /**
     * Create a package.json for the new project.
     */
    const packageJson = {
        name: appName,
        version: '0.1.0',
        private: true,
        scripts: {
            start: 'node scripts/start.js',
            build: 'node scripts/build.js',
        }
    }

    fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2) + '\n'
    )

    const dependencies = [
        "@testing-library/jest-dom",
        "@testing-library/react",
        "@testing-library/user-event",
        "react",
        "react-dom",
        "react-scripts",
        "web-vitals",
        "@babel/plugin-proposal-private-property-in-object"
    ]

    if (language === Language.TypeScript) {
        const tsDependencies = [
            "@types/jest",
            "@types/node",
            "@types/react",
            "@types/react-dom",
        ]
    }



}
