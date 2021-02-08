const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
// eslint-disable-next-line no-unused-vars
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const dotenv = require('dotenv');
const common = require('./webpack.common.js');

const env = dotenv.config({path: path.resolve(__dirname, '../../.env.production')}).parsed;

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        // Uncomment this and run `npm run build` to interactively inspect JS bundle contents
        // new BundleAnalyzerPlugin(),
        new webpack.DefinePlugin({
            __REACT_WEB_CONFIG__: JSON.stringify(env),

            // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
            // react-native-render-html uses variable to log exclusively during development.
            // See https://reactnative.dev/docs/javascript-environment
            __DEV__: false,
        }),
    ],
});
