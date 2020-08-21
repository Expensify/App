const fs = require('fs');
const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const APP_VERSION = require('./package.json').version;

/**
 * Simple webpack plugin that writes the app version (from package.json) and the webpack hash to './version.json'
 */
class CustomVersionFilePlugin {
    apply(compiler) {
        compiler.hooks.done.tap(this.constructor.name, stats => new Promise((resolve, reject) => {
            const json = JSON.stringify({
                appVersion: APP_VERSION,
                buildHash: stats.hash,
            });
            fs.writeFile('./version.json', json, 'utf8', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        }));
    }
}

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

        // Copies favicons into the dist/ folder to use for unread status
        new CopyPlugin({
            patterns: [
                {from: 'web/favicon.png'},
                {from: 'web/favicon-unread.png'},
            ],
        }),

        new CustomVersionFilePlugin(),
    ],
    module: {
        rules: [
            // Transpiles and lints all the JS
            {
                test: /\.js$/,
                loader: 'babel-loader',

                /**
                 * Exclude node_modules except two packages we need to convert for rendering HTML because they import
                 * "react-native" internally and use JSX which we need to convert to JS for the browser.
                 *
                 * You'll need to add anything in here that needs the alias for "react-native" -> "react-native-web"
                 * You can remove something from this list if it doesn't use "react-native" as an import and it doesn't
                 * use JSX/JS that needs to be transformed by babel.
                 */
                exclude: /node_modules\/(?!(react-native-render-html|react-native-webview)\/).*|\.native.js$/,
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
