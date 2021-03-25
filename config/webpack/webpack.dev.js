const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const dotenv = require('dotenv');
const common = require('./webpack.common.js');

const env = dotenv.config({path: path.resolve(__dirname, '../../.env')}).parsed;

module.exports = () => {
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

    // Check if the ngrok URL for the web application was been provided,
    // and if so, host the webpack dev server there.
    const ngrokSettings = env.USE_NGROK_CASH === 'true' && env.NGROK_URL_CASH
        ? {public: env.NGROK_URL_CASH}
        : {};

    return merge(common, {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, '../dist'),
            hot: true,
            ...proxySettings,
            ...ngrokSettings,
            historyApiFallback: true,
        },
        plugins: [
            new webpack.DefinePlugin({
                __REACT_WEB_CONFIG__: JSON.stringify(env),

                // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
                // react-native-render-html uses variable to log exclusively during development.
                // See https://reactnative.dev/docs/javascript-environment
                __DEV__: true,
            }),
        ],
    });
};
