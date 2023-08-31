import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import { isWriteable } from './utils/writeable';
import { AppType, Language } from './types';
import { installTemplate } from './installTemplate';

interface Config {
    appPath: string;
    port: number;
    language?: string;
    appType?: 'host' | 'remote';
    publicPath?: string;
    reactRouter?: boolean;
    createReactApp?: boolean;
}

export const createApp = async (config: Config) => {
    const {
        appPath, language, appType, publicPath, port, createReactApp, reactRouter
    } = config;

    let template = `${createReactApp ? 'cra' : 'webpack'}-${language || Language.JavaScript}-${appType || AppType.Remote}`;

    if (reactRouter) {
        template += '-router';
    }

    const root = path.resolve(appPath);

    if (!(await isWriteable(path.dirname(root)))) {
        console.error(
            chalk.redBright(
                'The application path is not writable, please check folder permissions and try again.'
            )
        );
        console.error(
            chalk.yellowBright(
                'It is likely you do not have write permissions for this folder.'
            )
        );
        process.exit(1);
    }

    console.log(`${chalk.green(`Creating a new MFE application in ${chalk.green.bold(root)}.`)}\n`);
    fs.mkdirSync(root, { recursive: true });
    process.chdir(root);

    await installTemplate({
        root,
        template,
        language: language || Language.JavaScript,
        appName: path.basename(root),
        publicPath: publicPath || '/',
        appType: appType || AppType.Remote,
        port: port || 3000,
        useReactRouter: reactRouter || false
    }).then(() => {
        const displayedCommand = 'npm';

        console.log();
        console.log(`Success! Created ${root} at ${appPath}`);
        console.log('Inside that directory, you can run several commands:');
        console.log();
        console.log(chalk.cyan(`  ${displayedCommand} start`));
        console.log('    Starts the development server.');
        console.log();
        console.log(
            chalk.cyan(`  ${displayedCommand} run build`)
        );
        console.log('    Bundles the app into static files for production.');
        console.log();
        console.log(chalk.cyan(`  ${displayedCommand} test`));
        console.log('    Starts the test runner.');
        console.log();
        console.log(
            chalk.cyan(`  ${displayedCommand} run eject`)
        );
        console.log(
            '    Removes this tool and copies build dependencies, configuration files'
        );
        console.log(
            '    and scripts into the app directory. If you do this, you can’t go back!'
        );
        console.log();
        console.log('We suggest that you begin by typing:');
        console.log();
        console.log(chalk.cyan('  cd'), path.basename(root));
        console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);

        console.log();
        console.log('Happy hacking!!');
    });
};
