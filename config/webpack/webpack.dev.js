const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const dotenv = require('dotenv');
const common = require('./webpack.common.js');

const env = dotenv.config({path: path.resolve(__dirname, '../../.env')}).parsed;

module.exports = ({proxy}) => {
    const proxySettings = {};
    if (proxy) {
        proxySettings.proxy = {
            '/api': 'http://localhost:9000',
            '/chat-attachments': 'http://localhost:9000',
        };
    }

    return merge(common, {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, '../dist'),
            hot: true,
            ...proxySettings,
        },
        plugins: [
            new webpack.DefinePlugin({
                __REACT_WEB_CONFIG__: JSON.stringify(env),
            })
        ]
    });
};
