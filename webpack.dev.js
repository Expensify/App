const path = require('path');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const ReactWebConfig = require('./ReactWebConfig').ReactWebConfig;

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        hot: true,
    },
    plugins: [
        ReactWebConfig(path.resolve(__dirname, './.env')),
    ]
});
