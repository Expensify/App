const path = require('path');
const webpack = require('webpack');
const _ = require('underscore');

const dependencies = require('../../desktop/package/package.json').dependencies;
const getCommonConfig = require('./webpack.common');

/**
 * Desktop creates 2 configurations in parallel
 * 1. electron-main - the core that serves the app content
 * 2. web - the app content that would be rendered in electron
 * Everything is placed in desktop/package and ready for packaging
 * @param {Object} env
 * @returns {webpack.Configuration[]}
 */
module.exports = (env) => {
    const rendererConfig = getCommonConfig({...env, platform: 'desktop'});
    const outputPath = path.resolve(__dirname, '../../desktop/package/dist');

    rendererConfig.name = 'web';
    rendererConfig.target = 'electron-renderer';
    rendererConfig.output.path = path.join(outputPath, 'www');

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
        resolve: {
            extensions: ['.js', '.jsx', '.json'],
            modules: ['src', 'node_modules'],
        },
        externals: [
            ..._.keys(dependencies),
            'fsevents',
        ],
        plugins: [
            new webpack.EnvironmentPlugin({
                NODE_ENV: 'production',
                DEBUG_PROD: false,
                START_MINIMIZED: false,
            }),
        ],
        node: {
            __dirname: false,
            __filename: false,
        },
    };

    return [mainProcessConfig, rendererConfig];
};
