const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactWebConfig = require('./joeTestDir/ReactWebConfig').ReactWebConfig;

module.exports = {
    entry: {
        app: './web/index.js',
    },
    output: {
        filename: '[name]-[hash].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'web/index.html',
            filename: 'index.html',
        }),
        ReactWebConfig(path.resolve(__dirname, '../.env')),
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

            // Gives the ability to load local images
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],
    },
    resolve: {
        alias: {
            'react-native-config': 'react-web-config',
            'react-native$': 'react-native-web',
        },
    },
};
