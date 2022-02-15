const path = require('path');
const {IgnorePlugin, DefinePlugin} = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const CustomVersionFilePlugin = require('./CustomVersionFilePlugin');

const includeModules = [
    'react-native-animatable',
    'react-native-reanimated',
    'react-native-picker-select',
    'react-native-web',
    '@react-native-picker',
    'react-native-modal',
    'react-native-onyx',
    'react-native-gesture-handler',
    'react-native-flipper',
    'react-native-google-places-autocomplete',
].join('|');

/**
 * Get a production grade config for web or desktop
 * @param {Object} env
 * @param {String} env.envFile path to the env file to be used
 * @param {'web'|'desktop'} env.platform
 * @returns {Configuration}
 */
const webpackConfig = ({envFile = '.env', platform = 'web'}) => ({
    mode: 'production',
    devtool: 'source-map',
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
                {from: '.well-known/apple-app-site-association', to: '.well-known/apple-app-site-association'},

                // These files are copied over as per instructions here
                // https://github.com/wojtekmaj/react-pdf#copying-cmaps
                {from: 'node_modules/pdfjs-dist/cmaps/', to: 'cmaps/'},
            ],
        }),
        new IgnorePlugin(/^\.\/locale$/, /moment$/),
        ...(platform === 'web' ? [new CustomVersionFilePlugin()] : []),
        new DefinePlugin({
            __REACT_WEB_CONFIG__: JSON.stringify(
                dotenv.config({path: envFile}).parsed,
            ),

            // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
            // react-native-render-html uses variable to log exclusively during development.
            // See https://reactnative.dev/docs/javascript-environment
            __DEV__: /staging|prod/.test(envFile) === false,
        }),

        // This allows us to interactively inspect JS bundle contents
        ...(process.env.ANALYZE_BUNDLE === 'true' ? [new BundleAnalyzerPlugin()] : []),
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
                ],
            },
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                exclude: [
                    /node_modules|\.native\.js$/,
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
        // This also skips packing web only dependencies to desktop and vice versa
        extensions: ['.web.js', (platform === 'web') ? '.website.js' : '.desktop.js', '.js', '.jsx'],
    },
});

module.exports = webpackConfig;
