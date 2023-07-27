const toPascalCase = (str: string = '') => {
    const regexPattern = /[^A-Za-z0-9]/g;
    const words = str.split(regexPattern);

    const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));

    return capitalizedWords.join('');
};

export const moduleFederationRemote = ({ appName }: { appName: string }) => `
     const { dependencies } = require('./package.json');

    module.exports = {
    name: '${appName}',
    filename: 'remoteEntry.js',
    exposes: {
        './${toPascalCase(appName)}': './src/bootstrap',
    },
    shared: {
        ...dependencies,
        react: {
            singleton: true,
            requiredVersion: dependencies.react,
        },
        'react-dom': {
            singleton: true,
            requiredVersion: dependencies['react-dom'],
        },
    },
    };
    `;

export const moduleFederationHost = ({ appName }: { appName: string }) => `
    const { dependencies } = require('./package.json');
    
    module.exports = {
        name: '${appName}',
        filename: 'remoteEntry.js',
        remotes: {},
        shared: {
            ...dependencies,
            react: {
                singleton: true,
                requiredVersion: dependencies.react,
            },
            'react-dom': {
                singleton: true,
                requiredVersion: dependencies['react-dom'],
            },
        },
    };`;

export const webpackProductionConfig = ({ publicPath }: { publicPath?: string }) => `
    const { ModuleFederationPlugin } = require('webpack').container;

const webpackConfigPath = 'react-scripts/config/webpack.config';
// eslint-disable-next-line import/no-dynamic-require
const webpackConfig = require(webpackConfigPath);

const override = config => {
  // eslint-disable-next-line global-require
  config.plugins.push(new ModuleFederationPlugin(require('../../module-federation.config')));
   config.mode = 'production';
  config.output = {
    // Make sure to use [name] or [id] in output.filename
    //  when using multiple entry points
    ...config.output,
    ${publicPath && `publicPath: '${publicPath}',`}
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  };

  config.module.rules = [
    ...config.module.rules,
    {
      test: [/\\.js?$/, /\\.ts?$/, /\\.jsx?$/, /\\.tsx?$/],
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

    `;

export const startScript = ({ port }: { port: number }) => `
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.GENERATE_SOURCEMAP = process.env.GENERATE_SOURCEMAP || 'false';
    process.env.PORT = process.env.PORT || ${port};
    require('./overrides/webpack.dev');
    require('react-scripts/scripts/start');
    `;
