import path from 'path';
import portfinder from 'portfinder';
import {TimeAnalyticsPlugin} from 'time-analytics-webpack-plugin';
import type {Configuration} from 'webpack';
import {DefinePlugin} from 'webpack';
import type {Configuration as DevServerConfiguration} from 'webpack-dev-server';
import {merge} from 'webpack-merge';
import type Environment from './types';
import getCommonConfiguration from './webpack.common';

const BASE_PORT = 8082;

/**
 * Configuration for the local dev server
 */
const getConfiguration = (environment: Environment): Promise<Configuration> =>
    portfinder.getPortPromise({port: BASE_PORT}).then((port) => {
        // Check if the USE_WEB_PROXY variable has been provided
        // and rewrite any requests to the local proxy server
        const proxySettings: Pick<DevServerConfiguration, 'proxy'> =
            process.env.USE_WEB_PROXY === 'false'
                ? {}
                : {
                      proxy: [
                          {
                              context: ['/api', '/staging', '/chat-attachments', '/receipts'],
                              target: 'http://[::1]:9000',
                          },
                      ],
                  };

        const baseConfig = getCommonConfiguration(environment);

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
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Document-Policy': 'js-profiling',
                },
            },
            plugins: [
                new DefinePlugin({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'process.env.PORT': port,
                }),
            ],
            cache: {
                type: 'filesystem',
                name: environment.platform ?? 'default',
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

export default getConfiguration;
