import chalk from 'chalk';
import Commander from 'commander';
import prompts from 'prompts';
import path from 'path';
import fs from 'fs';
import packageJson from './package.json';
import {validateNpmName} from './src/utils/validate-pkg';
import {generateRandomPort} from './src/utils/random-port';
import {getObjectValue} from './src/utils/get-values';
import {createApp} from './src/app';

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
    .option('--use-cra', 'Use create-react-app')
    .option('--js --javascript', 'Initialize with JavaScript (default)')
    .option('--ts --typescript', 'Initialize with TypeScript')
    .option('-t --app-type <type>', 'Application type (default: host)')
    .option('-p, --port <number>', 'Port number', generateRandomPort())
    .option('--react-router', 'Add React Router')
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

    const {
        valid,
        problems
    } = validateNpmName(projectName);
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

    // select whether to use create-react-app
    const selectedCra = getProgramValues<boolean | undefined>('useCra');

    if (!selectedCra) {
        const res = await prompts({
            onState: onPromptState,
            type: 'confirm',
            name: 'useCra',
            message: 'Would you like to use create-react-app?',
            initial: true
        }, {
            onCancel: () => {
                console.error(chalk.red('Exiting the program...'));
                process.exit(1);
            }
        });

        program.opts().useCra = res.useCra;
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
                {
                    title: 'JavaScript',
                    value: 'js'
                },
                {
                    title: 'TypeScript',
                    value: 'ts'
                }
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
                {
                    title: 'Host',
                    value: 'host'
                },
                {
                    title: 'Remote',
                    value: 'remote'
                }
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

    // set react router
    const selectedReactRouter = getProgramValues<boolean | undefined>('reactRouter');

    if (!selectedReactRouter) {
        const res = await prompts({
            onState: onPromptState,
            type: 'confirm',
            name: 'reactRouter',
            message: 'Would you like to add React Router?',
            initial: true
        }, {
            onCancel: () => {
                console.error(chalk.red('Exiting the program...'));
                process.exit(1);
            }
        });

        program.opts().reactRouter = res.reactRouter;
    }

    try {
        await createApp({
            appPath: projectPath,
            port: program.opts().port,
            language: program.opts().javascript ? 'js' : 'ts',
            appType: program.opts().appType,
            publicPath: program.opts().publicPath,
            reactRouter: program.opts().reactRouter,
            createReactApp: program.opts().useCra
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
