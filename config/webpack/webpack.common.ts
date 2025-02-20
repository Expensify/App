import CopyPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import type {Class} from 'type-fest';
import type {Configuration, WebpackPluginInstance} from 'webpack';
import {EnvironmentPlugin} from 'webpack';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import {merge} from 'webpack-merge';
import CustomVersionFilePlugin from './CustomVersionFilePlugin';
import type Environment from './types';
import getBaseConfiguration from './webpack.base';

type Options = {
    rel: string;
    as: string;
    fileWhitelist: RegExp[];
    include: string;
};

type PreloadWebpackPluginClass = Class<WebpackPluginInstance, [Options]>;

// require is necessary, importing anything from @vue/preload-webpack-plugin causes an error
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin') as PreloadWebpackPluginClass;

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
    const baseConfig = getBaseConfiguration({file, platform});
    return merge(baseConfig, {
        entry: {
            main: ['babel-polyfill', './index.js'],
        },
        output: {
            filename: '[name]-[contenthash].bundle.js',
            path: path.resolve(__dirname, '../../dist'),
            publicPath: '/',
        },
        plugins: [
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
            ...(platform === 'web' ? [new CustomVersionFilePlugin()] : []),

            // This allows us to interactively inspect JS bundle contents
            ...(process.env.ANALYZE_BUNDLE === 'true' ? [new BundleAnalyzerPlugin()] : []),
        ],
        module: {
            rules: [
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
            ],
        },
        optimization: {
            minimizer: [
                // default settings accordint to https://webpack.js.org/configuration/optimization/#optimizationminimizer
                // with addition of preserving the class name for ImageManipulator (expo module)
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            passes: 2,
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        keep_classnames: /ImageManipulator|ImageModule/,
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

export default getCommonConfiguration;
