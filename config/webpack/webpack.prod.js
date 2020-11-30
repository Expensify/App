const path = testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const dotenv = require('dotenv');
const common = require('./webpack.common.js');

const env = dotenv.config({path: path.resolve(__dirname, '../../.env.production')}).parsed;

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            __REACT_WEB_CONFIG__: JSON.stringify(env),
        })
    ],
});
