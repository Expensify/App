const path = require('path');
const webpack = require('webpack');
const _ = require('underscore');

const desktopDependencies = require('../../desktop/package.json').dependencies;
const getCommonConfig = require('./webpack.common');

/**
 * Desktop creates 2 configurations in parallel
 * 1. electron-main - the core that serves the app content
 * 2. web - the app content that would be rendered in electron
 * Everything is placed in desktop/dist and ready for packaging
 * @param {Object} env
 * @returns {webpack.Configuration[]}
 */
module.exports = (env) => {
    const rendererConfig = getCommonConfig({...env, platform: 'desktop'});
    const outputPath = path.resolve(__dirname, '../../desktop/dist');

    rendererConfig.name = 'renderer';
    rendererConfig.output.path = path.join(outputPath, 'www');

    // Expose react-native-config to desktop-main
    const definePlugin = _.find(rendererConfig.plugins, plugin => plugin.constructor === webpack.DefinePlugin);

    const mainProcessConfig = {
        mode: 'production',
        name: 'desktop-main',
        target: 'electron-main',
        entry: {
            main: './desktop/main.js',
            contextBridge: './desktop/contextBridge.js',
        },
        output: {
            filename: '[name].js',
            path: outputPath,
            libraryTarget: 'commonjs2',
        },
        resolve: rendererConfig.resolve,
        plugins: [definePlugin],
        externals: [
            ..._.keys(desktopDependencies),
            'fsevents',
        ],
        node: {
            /**
             * Disables webpack processing of __dirname and __filename, so it works like in node
             * https://github.com/webpack/webpack/issues/2010
             */
            __dirname: false,
            __filename: false,
        },
        module: {
            rules: [
                {
                    test: /react-native-onyx/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-react'],

                        },
                    },
                },
            ],
        },
    };

    return [mainProcessConfig, rendererConfig];
};
