const path = require('path');
const portfinder = require('portfinder');
const {DefinePlugin} = require('webpack');
const {merge} = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const {TimeAnalyticsPlugin} = require('time-analytics-webpack-plugin');
const getCommonConfig = require('./webpack.common');

const BASE_PORT = 8082;

/**
 * Configuration for the local dev server
 * @param {Object} env
 * @returns {Configuration}
 */
module.exports = (env = {}) =>
    portfinder.getPortPromise({port: BASE_PORT}).then((port) => {
        // Check if the USE_WEB_PROXY variable has been provided
        // and rewrite any requests to the local proxy server
        const proxySettings =
            process.env.USE_WEB_PROXY === 'false'
                ? {}
                : {
                      proxy: {
                          '/api': 'http://[::1]:9000',
                          '/staging': 'http://[::1]:9000',
                          '/chat-attachments': 'http://[::1]:9000',
                          '/receipts': 'http://[::1]:9000',
                      },
                  };

        const baseConfig = getCommonConfig(env);

        const config = merge(baseConfig, {
            mode: 'development',
            devtool: 'eval-source-map',
            devServer: {
                static: {
                    directory: path.join(__dirname, '../../dist'),
                },
                client: {
                    overlay: false,
                },
                hot: true,
                ...proxySettings,
                historyApiFallback: true,
                port,
                host: 'dev.new.expensify.com',
                allowedHosts: 'all',
                server: {
                    type: 'https',
                    options: {
                        key: path.join(__dirname, 'key.pem'),
                        cert: path.join(__dirname, 'certificate.pem'),
                    },
                },
            },
            plugins: [
                new DefinePlugin({
                    'process.env.PORT': port,
                }),
                new CopyPlugin({
                    patterns: [
                        {from: 'web/favicon.png'},
                        {from: 'web/favicon-unread.png'},
                        {from: 'web/og-preview-image.png'},
                        {from: 'web/apple-touch-icon.png'},
                        {from: 'assets/images/expensify-app-icon.svg'},
                        {from: 'web/manifest.json'},
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
            ],
            cache: {
                type: 'filesystem',
                name: env.platform || 'default',
                buildDependencies: {
                    // By default, webpack and loaders are build dependencies
                    // This (also) makes all dependencies of this config file - build dependencies
                    config: [__filename],
                },
            },
            snapshot: {
                // A list of paths webpack trusts would not be modified while webpack is running
                managedPaths: [
                    // Onyx can be modified on the fly, changes to other node_modules would not be reflected live
                    /([\\/]node_modules[\\/](?!react-native-onyx))/,
                ],
            },
        });

        return TimeAnalyticsPlugin.wrap(config);
    });
