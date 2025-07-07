"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var clean_webpack_plugin_1 = require("clean-webpack-plugin");
var copy_webpack_plugin_1 = require("copy-webpack-plugin");
var dotenv_1 = require("dotenv");
var fs_1 = require("fs");
var html_webpack_plugin_1 = require("html-webpack-plugin");
var path_1 = require("path");
var terser_webpack_plugin_1 = require("terser-webpack-plugin");
var webpack_1 = require("webpack");
var webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
var CustomVersionFilePlugin_1 = require("./CustomVersionFilePlugin");
dotenv_1.default.config();
// require is necessary, importing anything from @vue/preload-webpack-plugin causes an error
var PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');
var includeModules = [
    'react-native-animatable',
    'react-native-reanimated',
    'react-native-picker-select',
    'react-native-web',
    'react-native-webview',
    '@react-native-picker',
    '@react-navigation/material-top-tabs',
    '@react-navigation/native',
    '@react-navigation/native-stack',
    '@react-navigation/stack',
    'react-native-modal',
    'react-native-gesture-handler',
    'react-native-google-places-autocomplete',
    'react-native-qrcode-svg',
    'react-native-view-shot',
    '@react-native/assets',
    'expo',
    'expo-av',
    'expo-image-manipulator',
    'expo-modules-core',
].join('|');
var environmentToLogoSuffixMap = {
    production: '-dark',
    staging: '-stg',
    dev: '-dev',
    adhoc: '-adhoc',
};
function mapEnvironmentToLogoSuffix(environmentFile) {
    var environment = environmentFile.split('.').at(2);
    if (typeof environment === 'undefined') {
        environment = 'dev';
    }
    return environmentToLogoSuffixMap[environment];
}
/**
 * Get a production grade config for web or desktop
 */
var getCommonConfiguration = function (_a) {
    var _b = _a.file, file = _b === void 0 ? '.env' : _b, _c = _a.platform, platform = _c === void 0 ? 'web' : _c;
    return ({
        mode: 'production',
        devtool: 'source-map',
        entry: {
            main: ['babel-polyfill', './index.js'],
        },
        output: {
            filename: '[name]-[contenthash].bundle.js',
            path: path_1.default.resolve(__dirname, '../../dist'),
            publicPath: '/',
        },
        stats: {
            // We can ignore the "module not installed" warning from lottie-react-native
            // because we are not using the library for JSON format of Lottie animations.
            warningsFilter: ['./node_modules/lottie-react-native/lib/module/LottieView/index.web.js'],
        },
        plugins: __spreadArray(__spreadArray(__spreadArray(__spreadArray([
            new clean_webpack_plugin_1.CleanWebpackPlugin(),
            new html_webpack_plugin_1.default({
                template: 'web/index.html',
                filename: 'index.html',
                splashLogo: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../../assets/images/new-expensify".concat(mapEnvironmentToLogoSuffix(file), ".svg")), 'utf-8'),
                isWeb: platform === 'web',
                isProduction: file === '.env.production',
                isStaging: file === '.env.staging',
                useThirdPartyScripts: process.env.USE_THIRD_PARTY_SCRIPTS === 'true' || (platform === 'web' && ['.env.production', '.env.staging'].includes(file)),
            }),
            new PreloadWebpackPlugin({
                rel: 'preload',
                as: 'font',
                fileWhitelist: [/\.woff2$/],
                include: 'allAssets',
            }),
            new PreloadWebpackPlugin({
                rel: 'prefetch',
                as: 'fetch',
                fileWhitelist: [/\.lottie$/],
                include: 'allAssets',
            }),
            new webpack_1.ProvidePlugin({
                process: 'process/browser',
            }),
            // Copies favicons into the dist/ folder to use for unread status
            new copy_webpack_plugin_1.default({
                patterns: [
                    { from: 'web/favicon.png' },
                    { from: 'web/favicon-unread.png' },
                    { from: 'web/og-preview-image.png' },
                    { from: 'web/apple-touch-icon.png' },
                    { from: 'web/robots.txt' },
                    { from: 'assets/images/expensify-app-icon.svg' },
                    { from: 'web/manifest.json' },
                    { from: 'assets/css', to: 'css' },
                    { from: 'assets/fonts/web', to: 'fonts' },
                    { from: 'assets/sounds', to: 'sounds' },
                    { from: 'assets/pdfs', to: 'pdfs' },
                    { from: 'node_modules/react-pdf/dist/esm/Page/AnnotationLayer.css', to: 'css/AnnotationLayer.css' },
                    { from: 'node_modules/react-pdf/dist/esm/Page/TextLayer.css', to: 'css/TextLayer.css' },
                    { from: '.well-known/apple-app-site-association', to: '.well-known/apple-app-site-association', toType: 'file' },
                    { from: '.well-known/assetlinks.json', to: '.well-known/assetlinks.json' },
                    // These files are copied over as per instructions here
                    // https://github.com/wojtekmaj/react-pdf#copying-cmaps
                    { from: 'node_modules/pdfjs-dist/cmaps/', to: 'cmaps/' },
                ],
            }),
            new webpack_1.EnvironmentPlugin({ JEST_WORKER_ID: '' }),
            new webpack_1.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/,
            })
        ], (file === '.env.production' || file === '.env.staging'
            ? [
                new webpack_1.IgnorePlugin({
                    resourceRegExp: /@welldone-software\/why-did-you-render/,
                }),
            ]
            : []), true), (platform === 'web' ? [new CustomVersionFilePlugin_1.default()] : []), true), [
            new webpack_1.DefinePlugin(__assign(__assign({}, (platform === 'desktop' ? {} : { process: { env: {} } })), { 
                // eslint-disable-next-line @typescript-eslint/naming-convention
                __REACT_WEB_CONFIG__: JSON.stringify(dotenv_1.default.config({ path: file }).parsed), 
                // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
                // react-native-render-html uses variable to log exclusively during development.
                // See https://reactnative.dev/docs/javascript-environment
                // eslint-disable-next-line @typescript-eslint/naming-convention
                __DEV__: /staging|prod|adhoc/.test(file) === false }))
        ], false), (process.env.ANALYZE_BUNDLE === 'true' ? [new webpack_bundle_analyzer_1.BundleAnalyzerPlugin()] : []), true),
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                },
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
                    exclude: [new RegExp("node_modules/(?!(".concat(includeModules, ")/).*|.native.js$"))],
                },
                // We are importing this worker as a string by using asset/source otherwise it will default to loading via an HTTPS request later.
                // This causes issues if we have gone offline before the pdfjs web worker is set up as we won't be able to load it from the server.
                {
                    // eslint-disable-next-line prefer-regex-literals
                    test: new RegExp('node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
                    type: 'asset/source',
                },
                {
                    // eslint-disable-next-line prefer-regex-literals
                    test: new RegExp('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs'),
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
                    resourceQuery: { not: [/raw/] },
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: '@svgr/webpack',
                        },
                    ],
                },
                {
                    test: /\.pdf$/,
                    type: 'asset',
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
                {
                    test: /\.lottie$/,
                    type: 'asset/resource',
                },
                // This prevents import error coming from react-native-tab-view/lib/module/TabView.js
                // where Pager is imported without extension due to having platform-specific implementations
                {
                    test: /\.js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                    include: [path_1.default.resolve(__dirname, '../../node_modules/react-native-tab-view/lib/module/TabView.js')],
                },
            ],
        },
        resolve: {
            alias: {
                lodash: 'lodash-es',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'react-native-config': 'react-web-config',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'react-native$': 'react-native-web',
                // Module alias for web & desktop
                // https://webpack.js.org/configuration/resolve/#resolvealias
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@assets': path_1.default.resolve(__dirname, '../../assets'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@components': path_1.default.resolve(__dirname, '../../src/components/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@hooks': path_1.default.resolve(__dirname, '../../src/hooks/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@libs': path_1.default.resolve(__dirname, '../../src/libs/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@navigation': path_1.default.resolve(__dirname, '../../src/libs/Navigation/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@pages': path_1.default.resolve(__dirname, '../../src/pages/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@prompts': path_1.default.resolve(__dirname, '../../prompts'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@styles': path_1.default.resolve(__dirname, '../../src/styles/'),
                // This path is provide alias for files like `ONYXKEYS` and `CONST`.
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@src': path_1.default.resolve(__dirname, '../../src/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@userActions': path_1.default.resolve(__dirname, '../../src/libs/actions/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@desktop': path_1.default.resolve(__dirname, '../../desktop'),
            },
            // React Native libraries may have web-specific module implementations that appear with the extension `.web.js`
            // without this, web will try to use native implementations and break in not very obvious ways.
            // This is also why we have to use .website.js for our own web-specific files...
            // Because desktop also relies on "web-specific" module implementations
            // This also skips packing web only dependencies to desktop and vice versa
            extensions: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                '.web.js'
            ], (platform === 'desktop' ? ['.desktop.js'] : []), true), [
                '.website.js',
                '.js',
                '.jsx',
                '.web.ts'
            ], false), (platform === 'desktop' ? ['.desktop.ts'] : []), true), [
                '.website.ts'
            ], false), (platform === 'desktop' ? ['.desktop.tsx'] : []), true), [
                '.website.tsx',
                '.ts',
                '.web.tsx',
                '.tsx',
            ], false),
            fallback: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'process/browser': require.resolve('process/browser'),
                crypto: false,
            },
        },
        optimization: {
            minimizer: [
                // default settings according to https://webpack.js.org/configuration/optimization/#optimizationminimizer
                // with addition of preserving the class name for ImageManipulator (expo module)
                new terser_webpack_plugin_1.default({
                    terserOptions: {
                        compress: {
                            passes: 2,
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        keep_classnames: /ImageManipulator|ImageModule/,
                        mangle: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            keep_fnames: true,
                        },
                    },
                }),
                '...',
            ],
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    // We have to load the whole lottie player to get the player to work in offline mode
                    lottiePlayer: {
                        test: /[\\/]node_modules[\\/](@dotlottie\/react-player)[\\/]/,
                        name: 'lottiePlayer',
                        chunks: 'all',
                    },
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
};
exports.default = getCommonConfiguration;
