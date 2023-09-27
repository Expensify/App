const path = require('path');
const fs = require('fs');
const {IgnorePlugin, DefinePlugin, ProvidePlugin, EnvironmentPlugin} = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
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
    'react-native-qrcode-svg',
    'react-native-view-shot',
].join('|');

const envToLogoSuffixMap = {
    production: '',
    staging: '-stg',
    dev: '-dev',
    adhoc: '-adhoc',
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
        main: ['babel-polyfill', './index.js'],
    },
    output: {
        filename: '[name]-[contenthash].bundle.js',
        path: path.resolve(__dirname, '../../dist'),
        publicPath: '/',
    },
    stats: {
        warningsFilter: [],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'web/index.html',
            filename: 'index.html',
            splashLogo: fs.readFileSync(path.resolve(__dirname, `../../assets/images/new-expensify${mapEnvToLogoSuffix(envFile)}.svg`), 'utf-8'),
            usePolyfillIO: platform === 'web',
            isStaging: envFile === '.env.staging',
        }),
        new FontPreloadPlugin({
            extensions: ['woff2'],
        }),
        new ProvidePlugin({
            process: 'process/browser',
        }),

        // Copies favicons into the dist/ folder to use for unread status
        new CopyPlugin({
            patterns: [
                {from: 'web/favicon.png'},
                {from: 'web/favicon-unread.png'},
                {from: 'web/og-preview-image.png'},
                {from: 'web/apple-touch-icon.png'},
                {from: 'assets/css', to: 'css'},
                {from: 'assets/fonts/web', to: 'fonts'},
                {from: 'node_modules/react-pdf/dist/esm/Page/AnnotationLayer.css', to: 'css/AnnotationLayer.css'},
                {from: 'node_modules/react-pdf/dist/esm/Page/TextLayer.css', to: 'css/TextLayer.css'},
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
            __REACT_WEB_CONFIG__: JSON.stringify(dotenv.config({path: envFile}).parsed),

            // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
            // react-native-render-html uses variable to log exclusively during development.
            // See https://reactnative.dev/docs/javascript-environment
            __DEV__: /staging|prod|adhoc/.test(envFile) === false,
        }),

        // This allows us to interactively inspect JS bundle contents
        ...(process.env.ANALYZE_BUNDLE === 'true' ? [new BundleAnalyzerPlugin()] : []),
    ],
    module: {
        rules: [
            // Transpiles and lints all the JS
            {
                test: /\.(js|ts)x?$/,
                loader: 'babel-loader',

                /**
                 * Exclude node_modules except any packages we need to convert for rendering HTML because they import
                 * "react-native" internally and use JSX which we need to convert to JS for the browser.
                 *
                 * You'll need to add anything in here that needs the alias for "react-native" -> "react-native-web"
                 * You can remove something from this list if it doesn't use "react-native" as an import and it doesn't
                 * use JSX/JS that needs to be transformed by babel.
                 */
                exclude: [new RegExp(`node_modules/(?!(${includeModules})/).*|.native.js$`)],
            },

            // We are importing this worker as a string by using asset/source otherwise it will default to loading via an HTTPS request later.
            // This causes issues if we have gone offline before the pdfjs web worker is set up as we won't be able to load it from the server.
            {
                test: new RegExp('node_modules/pdfjs-dist/legacy/build/pdf.worker.js'),
                type: 'asset/source',
            },

            // Rule for react-native-web-webview
            {
                test: /postMock.html$/,
                type: 'asset',
                generator: {
                    filename: '[name].[ext]',
                },
            },

            // Gives the ability to load local images
            {
                test: /\.(png|jpe?g|gif)$/i,
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
                test: /\.(woff|woff2)$/i,
                type: 'asset',
            },
            {
                resourceQuery: /raw/,
                type: 'asset/source',
            },
        ],
    },
    resolve: {
        alias: {
            'react-native-config': 'react-web-config',
            'react-native$': '@expensify/react-native-web',
            'react-native-web': '@expensify/react-native-web',
            'react-content-loader/native': 'react-content-loader',
            'lottie-react-native': 'react-native-web-lottie',
        },

        // React Native libraries may have web-specific module implementations that appear with the extension `.web.js`
        // without this, web will try to use native implementations and break in not very obvious ways.
        // This is also why we have to use .website.js for our own web-specific files...
        // Because desktop also relies on "web-specific" module implementations
        // This also skips packing web only dependencies to desktop and vice versa
        extensions: ['.web.js', platform === 'web' ? '.website.js' : '.desktop.js', '.js', '.jsx', '.web.ts', platform === 'web' ? '.website.ts' : '.desktop.ts', '.ts', '.web.tsx', '.tsx'],
        fallback: {
            'process/browser': require.resolve('process/browser'),
        },
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                // Extract all 3rd party dependencies (~75% of App) to separate js file
                // This gives a more efficient caching - 3rd party deps don't change as often as main source
                // When dependencies don't change webpack would produce the same js file (and content hash)
                // After App update end users would download just the main source and resolve the rest from cache
                // When dependencies do change cache is invalidated and users download everything - same as before
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',

                    // Capture only the scripts needed for the initial load, so any async imports
                    // would be grouped (and lazy loaded) separately
                    chunks: 'initial',
                },
            },
        },
    },
});

module.exports = webpackConfig;
