const path = require('path');
const {merge} = require('webpack-merge');
const webpack = require('webpack');
const devConfig = require('./src/CONFIG.DEV');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        hot: true,
    },
    plugins: [
        new webpack.DefinePlugin({
            'REPORT_IDS': JSON.stringify(devConfig.REPORT_IDS),
        })
    ],
});
