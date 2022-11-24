const path = require('path');
const {
    IgnorePlugin, DefinePlugin, ProvidePlugin, EnvironmentPlugin,
} = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const FontPreloadPlugin = require('webpack-font-preload-plugin');
const CustomVersionFilePlugin = require('./CustomVersionFilePlugin');

const includeModules = [
    'react-native-animatable',
    'react-native-reanimated',
    'react-native-picker-select',
    '@expensify/react-native-web',
    'react-native-webview',
    '@react-native-picker',
    'react-native-modal',
    'react-native-gesture-handler',
    'react-native-flipper',
    'react-native-google-places-autocomplete',
    '@react-navigation/drawer',
].join('|');

const envToLogoSuffixMap = {
    production: '',
    staging: '-stg',
    dev: '-dev',
};

function mapEnvToLogoSuffix(envFile) {
    let env = envFile.split('.')[2];
    if (typeof env === 'undefined') {
        env = 'dev';
    }
    return envToLogoSuffixMap[env];
}

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
        main: [
            'babel-polyfill',
            './index.js',
        ],
        splash: ['./web/splash/splash.js'],
    },
    output: {
        filename: '[name]-[contenthash].bundle.js',
        path: path.resolve(__dirname, '../../dist'),
        publicPath: '/',
    },
    stats: {
        warningsFilter: [
            // @react-navigation for web uses the legacy modules (related to react-native-reanimated)
            // This results in 33 warnings with stack traces that appear during build and each time we make a change
            // We can't do anything about the warnings, and they only get in the way, so we suppress them
            './node_modules/@react-navigation/drawer/lib/module/views/legacy/Drawer.js',
            './node_modules/@react-navigation/drawer/lib/module/views/legacy/Overlay.js',
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'web/index.html',
            filename: 'index.html',
            usePolyfillIO: platform === 'web',
        }),
        new HtmlInlineScriptPlugin({
            scriptMatchPattern: [/splash.+[.]js$/],
        }),
        new FontPreloadPlugin(),
        new ProvidePlugin({
            process: 'process/browser',
        }),

        // Copies favicons into the dist/ folder to use for unread status
        new CopyPlugin({
            patterns: [
                {from: 'web/favicon.png'},
                {from: 'web/favicon-unread.png'},
                {from: 'web/og-preview-image.png'},
                {from: 'assets/css', to: 'css'},
                {from: 'assets/fonts/web', to: 'fonts'},
                {from: 'node_modules/react-pdf/dist/esm/Page/AnnotationLayer.css', to: 'css/AnnotationLayer.css'},
                {from: 'assets/images/shadow.png', to: 'images/shadow.png'},
                {from: '.well-known/apple-app-site-association', to: '.well-known/apple-app-site-association', toType: 'file'},
                {from: '.well-known/assetlinks.json', to: '.well-known/assetlinks.json'},

                // These files are copied over as per instructions here
                // https://github.com/wojtekmaj/react-pdf#copying-cmaps
                {from: 'node_modules/pdfjs-dist/cmaps/', to: 'cmaps/'},
            ],
        }),
        new EnvironmentPlugin({JEST_WORKER_ID: null}),
        new IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        ...(platform === 'web' ? [new CustomVersionFilePlugin()] : []),
        new DefinePlugin({
            ...(platform === 'desktop' ? {} : {process: {env: {}}}),
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
                type: 'asset',
            },

            // Load font assets,
            {
                test: /\.(woff|woff2)$/i,
                type: 'asset',
            },

            // Load svg images
            {
                test: /\.svg$/,
                resourceQuery: {not: [/raw/]},
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
            {
                resourceQuery: /raw/,
                type: 'asset/source',
            },
        ],
    },
    resolve: {
        alias: {
            logo$: path.resolve(__dirname, `../../assets/images/new-expensify${mapEnvToLogoSuffix(envFile)}.svg`),
            'react-native-config': 'react-web-config',
            'react-native$': '@expensify/react-native-web',
            'react-native-web': '@expensify/react-native-web',
            'react-content-loader/native': 'react-content-loader',
        },

        // React Native libraries may have web-specific module implementations that appear with the extension `.web.js`
        // without this, web will try to use native implementations and break in not very obvious ways.
        // This is also why we have to use .website.js for our own web-specific files...
        // Because desktop also relies on "web-specific" module implementations
        // This also skips packing web only dependencies to desktop and vice versa
        extensions: ['.web.js', (platform === 'web') ? '.website.js' : '.desktop.js', '.js', '.jsx'],
        fallback: {
            'process/browser': require.resolve('process/browser'),
        },
    },
});

module.exports = webpackConfig;
