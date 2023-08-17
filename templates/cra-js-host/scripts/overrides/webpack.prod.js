const {ModuleFederationPlugin} = require('webpack').container;

const webpackConfigPath = 'react-scripts/config/webpack.config';
// eslint-disable-next-line import/no-dynamic-require
const webpackConfig = require(webpackConfigPath);
const ppackageJson = require("../../package.json");
const packageJson = require('../../package.json');

const PUBLIC_PATH = '/';

const override = config => {
    // eslint-disable-next-line global-require
    const moduleFederationPlugin = new ModuleFederationPlugin({
        name: 'container',
        filename: 'remoteEntry.js',
        remotes: {},
        shared: {
            ...ppackageJson.dependencies,
            shared: {
                ...packageJson.dependencies,
                react: {
                    singleton: true,
                    requiredVersion: packageJson.dependencies.react,
                },
                'react-dom': {
                    singleton: true,
                    requiredVersion: packageJson.dependencies['react-dom'],
                },
            },
        },
    });
    config.plugins.push(moduleFederationPlugin);

    config.mode = 'production';

    config.devServer = {
        ...config.devServer,
        historyApiFallback: true,
    }

    config.output = {
        // Make sure to use [name] or [id] in output.filename
        //  when using multiple entry points
        ...config.output,
        publicPath: PUBLIC_PATH,
        filename: '[name].bundle.js',
        chunkFilename: '[id].bundle.js'
    };

    config.module.rules = [
        ...config.module.rules,
        {
            test: [/\.js?$/, /\.ts?$/, /\.jsx?$/, /\.tsx?$/],
            enforce: 'pre',
            exclude: /node_modules/,
            use: ['source-map-loader'],
        }
    ];

    return config;
};

require.cache[require.resolve(webpackConfigPath)].exports = env => override(webpackConfig(env));

// eslint-disable-next-line import/no-dynamic-require
module.exports = require(webpackConfigPath);

