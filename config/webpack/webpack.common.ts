import {sentryWebpackPlugin} from '@sentry/webpack-plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {createRequire} from 'module';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import type {Class} from 'type-fest';
import {fileURLToPath} from 'url';
import webpack from 'webpack';
import type {Configuration, WebpackPluginInstance} from 'webpack';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
// Storybook 10 loads TS files directly and requires .ts extension for ESM imports
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
// eslint-disable-next-line import/extensions
import CustomVersionFilePlugin from './CustomVersionFilePlugin.ts';
// eslint-disable-next-line import/extensions
import type Environment from './types.ts';

const require = createRequire(import.meta.url);
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
    'expo-video',
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
 * Get a production grade config for web
 */
const getCommonConfiguration = ({file = '.env', platform = 'web'}: Environment): Configuration => {
    const isDevelopment = file === '.env' || file === '.env.development';

    if (!isDevelopment) {
        const releaseName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
        console.debug(`[SENTRY ${platform.toUpperCase()}] Release: ${releaseName}`);
        console.debug(`[SENTRY ${platform.toUpperCase()}] Assets Path: ${'./dist/**/*.{js,map}'}`);
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    return {
        mode: isDevelopment ? 'development' : 'production',
        devtool: 'source-map',
        entry: {
            main: ['babel-polyfill', './index.js'],
        },
        output: {
            // Use simple filenames in development to prevent memory leaks from contenthash changes
            filename: isDevelopment ? '[name].bundle.js' : '[name]-[contenthash].bundle.js',
            path: path.resolve(dirname, '../../dist'),
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
                splashLogo: fs.readFileSync(path.resolve(dirname, `../../assets/images/new-expensify${mapEnvironmentToLogoSuffix(file)}.svg`), 'utf-8'),
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
            new webpack.ProvidePlugin({
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
            new webpack.EnvironmentPlugin({JEST_WORKER_ID: ''}),
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/,
            }),
            ...(file === '.env.production' || file === '.env.staging'
                ? [
                      new webpack.IgnorePlugin({
                          resourceRegExp: /@welldone-software\/why-did-you-render/,
                      }),
                  ]
                : []),
            ...(platform === 'web' ? [new CustomVersionFilePlugin()] : []),
            new webpack.DefinePlugin({
                process: {env: {}},
                // Define EXPO_OS for web platform to fix expo-modules-core warning
                'process.env.EXPO_OS': JSON.stringify('web'),
                __REACT_WEB_CONFIG__: JSON.stringify(dotenv.config({path: file}).parsed),

                // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
                // react-native-render-html uses variable to log exclusively during development.
                // See https://reactnative.dev/docs/javascript-environment
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
                              create: true,
                              setCommits: {
                                  auto: true,
                              },
                          },
                          sourcemaps: {
                              // Use relative path from project root - works for web (dist/)
                              assets: './dist/**/*.{js,map}',
                              filesToDeleteAfterUpload: './dist/**/*.map',
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
                    include: [path.resolve(dirname, '../../node_modules/react-native-tab-view/lib/module/TabView.js')],
                },
            ],
        },
        resolve: {
            alias: {
                lodash: 'lodash-es',
                'react-native-config': 'react-web-config',
                'react-native$': 'react-native-web',
                // Module alias for web
                // https://webpack.js.org/configuration/resolve/#resolvealias
                '@assets': path.resolve(dirname, '../../assets'),
                '@components': path.resolve(dirname, '../../src/components/'),
                '@hooks': path.resolve(dirname, '../../src/hooks/'),
                '@libs': path.resolve(dirname, '../../src/libs/'),
                '@navigation': path.resolve(dirname, '../../src/libs/Navigation/'),
                '@pages': path.resolve(dirname, '../../src/pages/'),
                '@prompts': path.resolve(dirname, '../../prompts'),
                '@styles': path.resolve(dirname, '../../src/styles/'),
                // This path is provide alias for files like `ONYXKEYS` and `CONST`.
                '@src': path.resolve(dirname, '../../src/'),
                '@userActions': path.resolve(dirname, '../../src/libs/actions/'),
                '@selectors': path.resolve(dirname, '../../src/selectors/'),
            },

            // React Native libraries may have web-specific module implementations that appear with the extension `.web.js`
            // without this, web will try to use native implementations and break in not very obvious ways.
            // This is also why we have to use .website.js for our own web-specific files...
            extensions: ['.web.js', '.website.js', '.js', '.jsx', '.web.ts', '.website.ts', '.website.tsx', '.ts', '.web.tsx', '.tsx'],
            fallback: {
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
                        keep_classnames: /ImageManipulator|ImageModule/,
                        mangle: {
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

/* eslint-enable @typescript-eslint/naming-convention */

export default getCommonConfiguration;
