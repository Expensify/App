const path = require('path');
const {IgnorePlugin} = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CustomVersionFilePlugin = require('./CustomVersionFilePlugin');

// Check for a --platform command line argument (default to 'web')
// If it is 'web', we want to ignore .desktop.js files, and if it is 'desktop', we want to ignore .website.js files.
const platformIndex = process.argv.findIndex(arg => arg === '--platform');
const platform = (platformIndex > 0) ? process.argv[platformIndex + 1] : 'web';
const platformExclude = platform === 'web' ? new RegExp(/\.desktop\.js$/) : new RegExp(/\.website\.js$/);

const includeModules = [
    'react-native-animatable',
    'react-native-reanimated',
    'react-native-picker-select',
    'react-native-web',
    '@react-native-picker',
    'react-native-modal',
    'react-native-onyx',
    'react-native-gesture-handler',
    '@unimodules',
].join('|');

const webpackConfig = {
    entry: {
        app: './index.js',
    },
    output: {
        filename: '[name]-[hash].bundle.js',
        path: path.resolve(__dirname, '../../dist'),
        publicPath: '/',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'web/index.html',
            filename: 'index.html',
            usePolyfillIO: platform === 'web',
        }),

        // Copies favicons into the dist/ folder to use for unread status
        new CopyPlugin({
            patterns: [
                {from: 'web/favicon.png'},
                {from: 'web/favicon-unread.png'},
                {from: 'web/og-preview-image.png'},
                {from: 'assets/css', to: 'css'},
                {from: 'node_modules/react-pdf/dist/esm/Page/AnnotationLayer.css', to: 'css/AnnotationLayer.css'},
                {from: 'assets/images/shadow.png', to: 'images/shadow.png'},
                {from: 'apple-app-site-association'},

                // These files are copied over as per instructions here
                // https://github.com/wojtekmaj/react-pdf#copying-cmaps
                {from: 'node_modules/pdfjs-dist/cmaps/', to: 'cmaps/'},
            ],
        }),
        new IgnorePlugin(/^\.\/locale$/, /moment$/),
        new CustomVersionFilePlugin(),
    ],
    module: {
        rules: [
            // Transpiles and lints all the JS
            {
                test: /\.js$/,
                loader: 'babel-loader',

                /**
                 * Exclude node_modules except any packages we need to convert for rendering HTML because they import
                 * "react-native" internally and use JSX which we need to convert to JS for the browser.
                 *
                 * You'll need to add anything in here that needs the alias for "react-native" -> "react-native-web"
                 * You can remove something from this list if it doesn't use "react-native" as an import and it doesn't
                 * use JSX/JS that needs to be transformed by babel.
                 */
                exclude: [
                    new RegExp(`node_modules/(?!(${includeModules})/).*|.native.js$`),
                    platformExclude,
                ],
            },
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                exclude: [
                    /node_modules|\.native\.js$/,
                    platformExclude,
                ],
                options: {
                    cache: false,
                    emitWarning: true,
                    configFile: path.resolve(__dirname, '../../.eslintrc.js'),
                },
            },

            // Rule for react-native-web-webview
            {
                test: /postMock.html$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                    },
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

            // Load svg images
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: '@svgr/webpack',
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        alias: {
            'react-native-config': 'react-web-config',
            'react-native$': 'react-native-web',
        },

        // React Native libraries may have web-specific module implementations that appear with the extension `.web.js`
        // without this, web will try to use native implementations and break in not very obvious ways.
        // This is also why we have to use .website.js for our own web-specific files...
        // Because desktop also relies on "web-specific" module implementations
        extensions: ['.web.js', (platform === 'web') ? '.website.js' : '.desktop.js', '.js', '.jsx'],
    },
};

if (platform === 'desktop') {
    webpackConfig.target = 'electron-renderer';
}

module.exports = webpackConfig;
