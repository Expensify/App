const path = require('path');
const webpack = require('webpack');
const _ = require('underscore');

const dependencies = require('../../desktop/package/package.json').dependencies;
const webpackWeb = require('./webpack.web');

/**
 * Desktop creates 2 configurations in parallel
 * 1. electron-main - the core that serves the app content
 * 2. web - the app content that would be rendered in electron
 * Everything is put together in desktop/package (todo: try to explain why)
 * @param {Object} env
 * @returns {webpack.Configuration[]}
 */
module.exports = (env) => {
    // Reuse web because Desktop is just web served (rendered) locally from Electron
    const webConfig = webpackWeb(env);
    const outputPath = path.resolve(__dirname, '../../desktop/package/dist');

    webConfig.name = 'web';
    webConfig.target = 'electron-renderer';
    webConfig.output.path = path.join(outputPath, 'www');

    const desktopConfig = {
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

    return [desktopConfig, webConfig];
};
