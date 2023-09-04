import chalk from 'chalk';
import spawn from 'cross-spawn';
import { getOnline } from './online';

export const installDependencies = async ({ root, dependencies, devDependencies }: { root: string, dependencies?: string [], devDependencies?: string [] }) => {
    const npmArgs = ['install'];
    const isOnline = await getOnline();
    const command = 'npm';

    return new Promise((resolve, reject) => {
        if (dependencies && dependencies.length > 0) {
            npmArgs.push(...dependencies);
        }

        if (devDependencies && devDependencies.length > 0) {
            npmArgs.push(...devDependencies.map((dep) => `--save-dev ${dep}`));
        }

        if (!isOnline) {
            console.log(chalk.yellowBright('You appear to be offline.'));
            console.log(chalk.yellowBright('Falling back to the local cache'));
            npmArgs.push('--offline');
        }

        /**
         * Spawn the installation process.
         */
        const child = spawn(command, npmArgs, {
            stdio: 'inherit',
            env: {
                ...process.env,
                ADBLOCK: '1',
                /**
                 * we set NODE_ENV to development so as not to skip dev
                 * dependencies when installing the template in production
                 * */
                NODE_ENV: 'development',
                DISABLE_OPENCOLLECTIVE: '1'
            }
        });
        child.on('close', (code) => {
            if (code !== 0) {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject({ command: `npm ${npmArgs.join(' ')}` });
                return;
            }
            // eslint-disable-next-line no-void
            resolve(void 0);
        });
    });
};
