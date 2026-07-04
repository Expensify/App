import type {Configuration} from '@rspack/core';
import type {Configuration as DevServerConfiguration} from '@rspack/dev-server';

import {rspack} from '@rspack/core';
import {ReactRefreshRspackPlugin} from '@rspack/plugin-react-refresh';
/* eslint-disable @typescript-eslint/naming-convention */
import path from 'path';
import portfinder from 'portfinder';

import type Environment from './types';

import ForceGarbageCollectionPlugin from './ForceGarbageCollectionPlugin';
import getCommonConfiguration from './rspack.common';

const BASE_PORT = 8082;

/**
 * [POC] rspack port of config/webpack/webpack.dev.ts — configuration for the local dev server.
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

        const config: Configuration = {
            ...baseConfig,
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
                        key: path.join(__dirname, '../webpack/key.pem'),
                        cert: path.join(__dirname, '../webpack/certificate.pem'),
                    },
                },
                headers: {
                    'Document-Policy': 'js-profiling',
                },
            },
            plugins: [
                ...(baseConfig.plugins ?? []),
                new rspack.DefinePlugin({
                    'process.env.PORT': port,
                    'process.env.NODE_ENV': JSON.stringify('development'),
                }),
                new ReactRefreshRspackPlugin(),
                new ForceGarbageCollectionPlugin(),
            ],
            // This prevents import error coming from react-native-tab-view/lib/module/TabView.js
            // where Pager is imported without extension due to having platform-specific implementations
            module: {
                rules: [
                    ...(baseConfig.module?.rules ?? []),
                    {
                        test: /\.js$/,
                        resolve: {
                            fullySpecified: false,
                        },
                        include: [path.resolve(__dirname, '../../node_modules/react-native-tab-view/lib/module/TabView.js')],
                    },
                ],
            },
            cache: {
                type: 'persistent',
                version: environment.platform ?? 'default',
                buildDependencies: [__filename],
                snapshot: {
                    // A list of paths rspack trusts would not be modified while rspack is running
                    // Onyx and react-native-live-markdown can be modified on the fly, changes to other node_modules would not be reflected live
                    managedPaths: [/([\\/]node_modules[\\/](?!react-native-onyx|@expensify\/react-native-live-markdown))/],
                },
            },
        };

        return config;
    });

export default getConfiguration;
