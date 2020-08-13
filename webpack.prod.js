const {merge} = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.REPORT_IDS': JSON.stringify('63212778,63212795,63212764,63212607,63699490'),
        })
    ],
});
