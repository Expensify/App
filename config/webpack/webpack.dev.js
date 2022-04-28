const path = require('path');
const {merge} = require('webpack-merge');
const getCommonConfig = require('./webpack.common');

/**
 * Configuration for the local dev server
 * @param {Object} env
 * @returns {Configuration}
 */
module.exports = (env = {}) => {
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

    return merge(baseConfig, {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, '../../dist'),
            hot: true,
            ...proxySettings,
            historyApiFallback: true,
        },
    });
};
