const path = require('path');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const ReactWebConfig = require('./ReactWebConfig').ReactWebConfig;

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        ReactWebConfig(path.resolve(__dirname, './.env.production')),
    ],
});
