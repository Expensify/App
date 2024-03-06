/* eslint-disable @typescript-eslint/naming-convention */
import type webpack from 'webpack';

import portfinder = require('portfinder');
import TimeAnalyticsWebpackPlugin = require('time-analytics-webpack-plugin');
import getCommonConfig from './webpack.common';

const {TimeAnalyticsPlugin} = TimeAnalyticsWebpackPlugin;
const path = require('path');
const {DefinePlugin} = require('webpack');
const {merge} = require('webpack-merge');

const BASE_PORT = 8082;

type EnvFile = Partial<{
    envFile: string;
    platform: 'web' | 'desktop';
}>;

/**
 * Configuration for the local dev server
 */
const getConfig = (env: EnvFile = {}): Promise<webpack.Configuration> =>
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
            ],
            cache: {
                type: 'filesystem',
                name: env.platform ?? 'default',
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

export default getConfig;
export type {EnvFile};
