import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import type {Class} from 'type-fest';
import type {Configuration, WebpackPluginInstance} from 'webpack';
import {DefinePlugin, EnvironmentPlugin, IgnorePlugin, ProvidePlugin} from 'webpack';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import CustomVersionFilePlugin from './CustomVersionFilePlugin';
import type Environment from './types';

type Options = {
    rel: string;
    as: string;
    fileWhitelist: RegExp[];
    include: string;
};

type PreloadWebpackPluginClass = Class<WebpackPluginInstance, [Options]>;

// require is necessary, importing anything from @vue/preload-webpack-plugin causes an error
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin') as PreloadWebpackPluginClass;

const includeModules = [
    'react-native-animatable',
    'react-native-reanimated',
    'react-native-picker-select',
    'react-native-web',
    'react-native-webview',
    '@react-native-picker',
    'react-native-modal',
    'react-native-gesture-handler',
    'react-native-google-places-autocomplete',
    'react-native-qrcode-svg',
    'react-native-view-shot',
    '@react-native/assets',
    'expo-av',
].join('|');

const environmentToLogoSuffixMap: Record<string, string> = {
    production: '-dark',
    staging: '-stg',
    dev: '-dev',
    adhoc: '-adhoc',
};

function mapEnvironmentToLogoSuffix(environmentFile: string): string {
    let environment = environmentFile.split('.').at(2);
    if (typeof environment === 'undefined') {
        environment = 'dev';
    }
    return environmentToLogoSuffixMap[environment];
}

/**
 * Get a production grade config for web or desktop
 */
const getCommonConfiguration = ({file = '.env', platform = 'web'}: Environment): Configuration => ({
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
        // We can ignore the "module not installed" warning from lottie-react-native
        // because we are not using the library for JSON format of Lottie animations.
        warningsFilter: ['./node_modules/lottie-react-native/lib/module/LottieView/index.web.js'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'web/index.html',
            filename: 'index.html',
            splashLogo: fs.readFileSync(path.resolve(__dirname, `../../assets/images/new-expensify${mapEnvironmentToLogoSuffix(file)}.svg`), 'utf-8'),
            isWeb: platform === 'web',
            isProduction: file === '.env.production',
            isStaging: file === '.env.staging',
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
                {from: 'assets/images/expensify-app-icon.svg'},
                {from: 'web/manifest.json'},
                {from: 'web/thirdPartyScripts.js'},
                {from: 'assets/css', to: 'css'},
                {from: 'assets/fonts/web', to: 'fonts'},
                {from: 'assets/sounds', to: 'sounds'},
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
        new EnvironmentPlugin({JEST_WORKER_ID: ''}),
        new IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        ...(file === '.env.production' || file === '.env.staging'
            ? [
                  new IgnorePlugin({
                      resourceRegExp: /@welldone-software\/why-did-you-render/,
                  }),
              ]
            : []),
        ...(platform === 'web' ? [new CustomVersionFilePlugin()] : []),
        new DefinePlugin({
            ...(platform === 'desktop' ? {} : {process: {env: {}}}),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __REACT_WEB_CONFIG__: JSON.stringify(dotenv.config({path: file}).parsed),

            // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
            // react-native-render-html uses variable to log exclusively during development.
            // See https://reactnative.dev/docs/javascript-environment
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __DEV__: /staging|prod|adhoc/.test(file) === false,
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
                test: new RegExp('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'),
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
            {
                test: /\.lottie$/,
                type: 'asset/resource',
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
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'react-native-sound': 'react-native-web-sound',
            // Module alias for web & desktop
            // https://webpack.js.org/configuration/resolve/#resolvealias
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@assets': path.resolve(__dirname, '../../assets'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@components': path.resolve(__dirname, '../../src/components/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@hooks': path.resolve(__dirname, '../../src/hooks/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@libs': path.resolve(__dirname, '../../src/libs/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@navigation': path.resolve(__dirname, '../../src/libs/Navigation/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@pages': path.resolve(__dirname, '../../src/pages/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@styles': path.resolve(__dirname, '../../src/styles/'),
            // This path is provide alias for files like `ONYXKEYS` and `CONST`.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@src': path.resolve(__dirname, '../../src/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@userActions': path.resolve(__dirname, '../../src/libs/actions/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@desktop': path.resolve(__dirname, '../../desktop'),
        },

        // React Native libraries may have web-specific module implementations that appear with the extension `.web.js`
        // without this, web will try to use native implementations and break in not very obvious ways.
        // This is also why we have to use .website.js for our own web-specific files...
        // Because desktop also relies on "web-specific" module implementations
        // This also skips packing web only dependencies to desktop and vice versa
        extensions: [
            '.web.js',
            ...(platform === 'desktop' ? ['.desktop.js'] : []),
            '.website.js',
            '.js',
            '.jsx',
            '.web.ts',
            ...(platform === 'desktop' ? ['.desktop.ts'] : []),
            '.website.ts',
            ...(platform === 'desktop' ? ['.desktop.tsx'] : []),
            '.website.tsx',
            '.ts',
            '.web.tsx',
            '.tsx',
        ],
        fallback: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'process/browser': require.resolve('process/browser'),
            crypto: false,
        },
    },

    optimization: {
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

export default getCommonConfiguration;
