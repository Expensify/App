const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        app: './web/index.js',
    },
    output: {
        filename: '[name]-[hash].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        hot: true,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'web/index.html',
            filename: 'index.html',
        }),
    ],
    module: {
        rules: [
            // Transpiles and lints all the JS
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules|\.native.js$/,
            },
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                exclude: /node_modules|\.native.js$/,
                options: {
                    cache: true,
                    emitWarning: true,
                },
            },
        ],
    },
    resolve: {
        alias: {
            'react-native$': 'react-native-web',
        },
    },
};
