import chalk from 'chalk';
import Commander from 'commander';
import prompts from 'prompts';
import path from 'path';
import fs from 'fs';
import packageJson from './package.json';
import { validateNpmName } from './utils/validate-pkg';
import { generateRandomPort } from './utils/random-port';
import { getObjectValue } from './utils/get-values';
import { createApp } from './app';

let projectPath: string = '';

const handleSigTerm = () => process.exit(0);

process.on('SIGINT', handleSigTerm);
process.on('SIGTERM', handleSigTerm);

const onPromptState = (state: any) => {
    if (state.aborted) {
        process.stdout.write('\x1B[?25h');
        process.stdout.write('\n');
        process.exit(1);
    }
};

const program = new Commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action((name) => {
        projectPath = name;
    })
    .option('-n, --name <name>', 'Project name')
    .option('--js --javascript', 'Initialize with JavaScript (default)')
    .option('--ts --typescript', 'Initialize with TypeScript')
    .option('-t --app-type <type>', 'Application type (default: host)')
    .option('-p, --port <number>', 'Port number', generateRandomPort())
    .option('--pf --packages-folder <folder>', 'The folder that contains the MFEs(default: packages)')
    .option('--public-path <path>', 'The public path for the MFEs (default: /)')
    .option('-h, --help', 'Display this message')
    .parse(process.argv);

const getProgramValues = <T>(value: any): T => getObjectValue(program.opts(), value);

const runApp = async (): Promise<void> => {
    // const config = new Conf({ projectName: projectPath });

    if (typeof projectPath === 'string') {
        projectPath = projectPath.trim();
    }

    if (!projectPath) {
        const res = await prompts({
            onState: onPromptState,
            type: 'text',
            name: 'path',
            message: 'What is the name of your app?',
            initial: 'my-mfe-app'
        }, {
            onCancel: () => {
                console.error(chalk.red('Exiting the program...'));
                process.exit(1);
            }
        });

        if (typeof res.path === 'string') {
            projectPath = res.path.trim();
        }
    }

    if (!projectPath) {
        console.log(
            '\nPlease specify the project directory:\n'
            + `  ${chalk.cyan(program.name())} ${chalk.green(
                '<project-directory>'
            )}\n`
            + 'For example:\n'
            + `  ${chalk.cyan(program.name())} ${chalk.green('my-mfe-app')}\n\n`
            + `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
        );
        process.exit(1);
    }

    const resolvedProjectPath = path.resolve(projectPath);
    const projectName = path.basename(resolvedProjectPath);

    const { valid, problems } = validateNpmName(projectName);
    if (!valid) {
        console.error(
            `Could not create a project called ${chalk.red(
                `"${projectName}"`
            )} because of npm naming restrictions:`
        );

        problems!.forEach((p) => console.error(`    ${chalk.red.bold('*')} ${p}`));
        process.exit(1);
    }

    const root = path.resolve(resolvedProjectPath);
    const folderExists = fs.existsSync(root);

    if (folderExists) {
        process.exit(1);
    }

    /**
     * Set language preference if it is not set
     */
    const selectedJs = getProgramValues<boolean | undefined>('javascript');
    const selectedTs = getProgramValues<boolean | undefined>('typescript');

    if (!selectedJs && !selectedTs) {
        const res = await prompts({
            onState: onPromptState,
            type: 'select',
            name: 'language',
            message: 'What language would you like to use?',
            choices: [
                { title: 'JavaScript', value: 'js' },
                { title: 'TypeScript', value: 'ts' }
            ],
            initial: 0
        }, {
            onCancel: () => {
                console.error(chalk.red('Exiting the program...'));
                process.exit(1);
            }
        });

        if (res.language === 'js') {
            program.opts().javascript = true;
        } else {
            program.opts().typescript = true;
        }
    }

    /**
     * Select the type of MFE application (host or remote)
     * */
    const selectedAppType = getProgramValues<string | undefined>('appType');

    if (selectedAppType && selectedAppType !== 'host' && selectedAppType !== 'remote') {
        console.error(chalk.red('Invalid application type. Please select either "host" or "remote".'));
        process.exit(1);
    }

    if (!selectedAppType) {
        const res = await prompts({
            onState: onPromptState,
            type: 'select',
            name: 'appType',
            message: 'What type of application would you like to create?',
            choices: [
                { title: 'Host', value: 'host' },
                { title: 'Remote', value: 'remote' }
            ],
            initial: 0
        }, {
            onCancel: () => {
                console.error(chalk.red('Exiting the program...'));
                process.exit(1);
            }
        });

        program.opts().appType = res.appType;
    }

    /**
     * Set the port number
     * */
    const selectedPort = getProgramValues<number | undefined>('port');

    if (!selectedPort) {
        const res = await prompts({
            onState: onPromptState,
            type: 'number',
            name: 'port',
            message: 'What port number would you like to use?',
            initial: generateRandomPort()
        }, {
            onCancel: () => {
                console.error(chalk.red('Exiting the program...'));
                process.exit(1);
            }
        });

        program.opts().port = res.port;
    }

    /**
     * Set public path
     * */
    const selectedPublicPath = getProgramValues<string | undefined>('publicPath');

    if (!selectedPublicPath) {
        const res = await prompts({
            onState: onPromptState,
            type: 'text',
            name: 'publicPath',
            message: 'What public path would you like to use?',
            initial: '/'
        }, {
            onCancel: () => {
                console.error(chalk.red('Exiting the program...'));
                process.exit(1);
            }
        });

        program.opts().publicPath = res.publicPath;
    }

    /**
     * Set packages folder
     * */
    // TODO: Add validation for the folder name and also in the app
    const selectedPackagesFolder = getProgramValues<string | undefined>('packagesFolder');

    if (!selectedPackagesFolder) {
        const res = await prompts({
            onState: onPromptState,
            type: 'text',
            name: 'packagesFolder',
            message: 'What is the name of the folder that contains the MFEs?',
            initial: 'packages'
        }, {
            onCancel: () => {
                console.error(chalk.red('Exiting the program...'));
                process.exit(1);
            }
        });

        program.opts().packagesFolder = res.packagesFolder;
    }

    try {
        await createApp({
            appPath: projectPath,
            port: program.opts().port,
            language: program.opts().javascript ? 'js' : 'ts',
            appType: program.opts().appType,
            publicPath: program.opts().publicPath
        });
    } catch (err) {
        console.log(err);
    }
};

runApp()
    .then(() => {
        console.log(chalk.green('Done.'));
    })
    .catch((err) => {
        console.log(err);
    });
