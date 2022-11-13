const path = require('path');
const portfinder = require('portfinder');
const {DefinePlugin} = require('webpack');
const {merge} = require('webpack-merge');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const getCommonConfig = require('./webpack.common');

const BASE_PORT = 8080;

/**
 * Configuration for the local dev server
 * @param {Object} env
 * @returns {Configuration}
 */
module.exports = (env = {}) => portfinder.getPortPromise({port: BASE_PORT})
    .then((port) => {
        // Check if the USE_WEB_PROXY variable has been provided
        // and rewrite any requests to the local proxy server
        const proxySettings = process.env.USE_WEB_PROXY === 'false'
            ? {}
            : {
                proxy: {
                    '/api': 'http://[::1]:9000',
                    '/chat-attachments': 'http://[::1]:9000',
                },
            };

        const baseConfig = getCommonConfig(env);
        const speedMeasure = new SpeedMeasurePlugin();

        const config = merge(baseConfig, {
            mode: 'development',
            devtool: 'eval-source-map',
            devServer: {
                static: {
                    directory: path.join(__dirname, '../../dist'),
                },
                client: {
                    overlay: false,
                },
                hot: true,
                ...proxySettings,
                historyApiFallback: true,
                port,
            },
            plugins: [
                new DefinePlugin({
                    'process.env.PORT': port,
                }),
            ],
            cache: {
                type: 'filesystem',
                name: env.platform || 'default',
                buildDependencies: {
                    // By default, webpack and loaders are build dependencies
                    // This (also) makes all dependencies of this config file - build dependencies
                    config: [__filename],
                },
            },
        });

        return speedMeasure.wrap(config);
    });
