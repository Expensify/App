import {sentryWebpackPlugin} from '@sentry/webpack-plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import type {Class} from 'type-fest';
import type {Configuration, WebpackPluginInstance} from 'webpack';
import {DefinePlugin, EnvironmentPlugin, IgnorePlugin, ProvidePlugin} from 'webpack';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import CustomVersionFilePlugin from './CustomVersionFilePlugin';
import type Environment from './types';

dotenv.config();

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
    'react-native-reanimated',
    'react-native-worklets',
    'react-native-picker-select',
    'react-native-web',
    'react-native-webview',
    '@react-native-picker',
    '@react-navigation/material-top-tabs',
    '@react-navigation/native',
    '@react-navigation/native-stack',
    '@react-navigation/stack',
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
const getCommonConfiguration = ({file = '.env', platform = 'web'}: Environment): Configuration => {
    const isDevelopment = file === '.env' || file === '.env.development';

    if (!isDevelopment) {
        const releaseName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
        console.debug(`[SENTRY ${platform.toUpperCase()}] Release: ${releaseName}`);
        console.debug(`[SENTRY ${platform.toUpperCase()}] Assets Path: ${platform === 'desktop' ? './desktop/dist/www/**/*.{js,map}' : './dist/**/*.{js,map}'}`);
    }

    return {
        mode: isDevelopment ? 'development' : 'production',
        devtool: 'source-map',
        entry: {
            main: ['babel-polyfill', './index.js'],
        },
        output: {
            // Use simple filenames in development to prevent memory leaks from contenthash changes
            filename: isDevelopment ? '[name].bundle.js' : '[name]-[contenthash].bundle.js',
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
                    {from: 'web/robots.txt'},
                    {from: 'assets/images/expensify-app-icon.svg'},
                    {from: 'web/manifest.json'},
                    {from: 'assets/css', to: 'css'},
                    {from: 'assets/fonts/web', to: 'fonts'},
                    {from: 'assets/sounds', to: 'sounds'},
                    {from: 'assets/pdfs', to: 'pdfs'},
                    {from: 'node_modules/react-pdf/dist/esm/Page/AnnotationLayer.css', to: 'css/AnnotationLayer.css'},
                    {from: 'node_modules/react-pdf/dist/esm/Page/TextLayer.css', to: 'css/TextLayer.css'},
                    {from: '.well-known/apple-app-site-association', to: '.well-known/apple-app-site-association', toType: 'file'},
                    {from: '.well-known/assetlinks.json', to: '.well-known/assetlinks.json'},

                    // These files are copied over as per instructions here
                    // https://github.com/wojtekmaj/react-pdf#copying-cmaps
                    {from: 'node_modules/pdfjs-dist/cmaps/', to: 'cmaps/'},

                    // Group‑IB web SDK injection file
                    {from: 'web/snippets/gib.js', to: 'gib.js'},
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
                // Define EXPO_OS for web platform to fix expo-modules-core warning
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'process.env.EXPO_OS': JSON.stringify('web'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                __REACT_WEB_CONFIG__: JSON.stringify(dotenv.config({path: file}).parsed),

                // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
                // react-native-render-html uses variable to log exclusively during development.
                // See https://reactnative.dev/docs/javascript-environment
                // eslint-disable-next-line @typescript-eslint/naming-convention
                __DEV__: /staging|prod|adhoc/.test(file) === false,
            }),
            ...(isDevelopment ? [] : [new MiniCssExtractPlugin()]),

            // Upload source maps to Sentry
            ...(isDevelopment
                ? []
                : ([
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                      sentryWebpackPlugin({
                          authToken: process.env.SENTRY_AUTH_TOKEN as string | undefined,
                          org: 'expensify',
                          project: 'app',
                          release: {
                              name: `${process.env.npm_package_name}@${process.env.npm_package_version}`,
                          },
                          sourcemaps: {
                              // Use relative path from project root - works for both web (dist/) and desktop (desktop/dist/www/)
                              assets: platform === 'desktop' ? './desktop/dist/www/**/*.{js,map}' : './dist/**/*.{js,map}',
                              filesToDeleteAfterUpload: platform === 'desktop' ? './desktop/dist/www/**/*.map' : './dist/**/*.map',
                          },
                          debug: false,
                          telemetry: false,
                      }),
                  ] as WebpackPluginInstance[])),

            // This allows us to interactively inspect JS bundle contents
            ...(process.env.ANALYZE_BUNDLE === 'true' ? [new BundleAnalyzerPlugin()] : []),
        ],
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
                    exclude: [new RegExp(`node_modules/(?!(${includeModules})/).*|.native.js$`)],
                },
                // We are importing this worker as a string by using asset/source otherwise it will default to loading via an HTTPS request later.
                // This causes issues if we have gone offline before the pdfjs web worker is set up as we won't be able to load it from the server.
                {
                    test: new RegExp('node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
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
                    test: /\.pdf$/,
                    type: 'asset',
                },
                {
                    test: /\.css$/i,
                    use: isDevelopment ? ['style-loader', 'css-loader'] : [MiniCssExtractPlugin.loader, 'css-loader'],
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
                    include: [path.resolve(__dirname, '../../node_modules/react-native-tab-view/lib/module/TabView.js')],
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
                '@prompts': path.resolve(__dirname, '../../prompts'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@styles': path.resolve(__dirname, '../../src/styles/'),
                // This path is provide alias for files like `ONYXKEYS` and `CONST`.
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@src': path.resolve(__dirname, '../../src/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@userActions': path.resolve(__dirname, '../../src/libs/actions/'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@desktop': path.resolve(__dirname, '../../desktop'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@selectors': path.resolve(__dirname, '../../src/selectors/'),
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
            minimizer: [
                // default settings according to https://webpack.js.org/configuration/optimization/#optimizationminimizer
                // with addition of preserving the class name for ImageManipulator (expo module)
                new TerserPlugin({
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
                    // heic-to library is used sparsely and we want to load it as a separate chunk
                    // to reduce the potential bundled size of the initial chunk
                    heicTo: {
                        test: /[\\/]node_modules[\\/](heic-to)[\\/]/,
                        name: 'heicTo',
                        chunks: 'all',
                    },
                    // ExpensifyIcons chunk - separate chunk loaded eagerly for offline support
                    expensifyIcons: {
                        test: /[\\/]src[\\/]components[\\/]Icon[\\/]chunks[\\/]expensify-icons\.chunk\.ts$/,
                        name: 'expensifyIcons',
                        chunks: 'all',
                    },
                    // Illustrations chunk - separate chunk loaded eagerly for offline support
                    illustrations: {
                        test: /[\\/]src[\\/]components[\\/]Icon[\\/]chunks[\\/]illustrations\.chunk\.ts$/,
                        name: 'illustrations',
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
    };
};

export default getCommonConfiguration;
