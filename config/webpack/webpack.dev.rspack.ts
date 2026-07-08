import type {Configuration, DevServer as DevServerConfiguration} from '@rspack/core';

/* eslint-disable @typescript-eslint/naming-convention */
import {DefinePlugin} from '@rspack/core';
import {ReactRefreshRspackPlugin} from '@rspack/plugin-react-refresh';
import path from 'path';
import portfinder from 'portfinder';
import {merge} from 'webpack-merge';

import type Environment from './types';

import ForceGarbageCollectionPlugin from './ForceGarbageCollectionPlugin';
import getCommonConfiguration from './webpack.common.rspack';

const BASE_PORT = 8082;

/**
 * Rspack port of webpack.dev.ts — dev-server config used to validate parity (HMR, memory
 * behaviour) before switching `npm run web` over. Not wired into any script yet.
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
            // @rspack/cli's dev-server silently turns this on (imports: true) whenever it's left
            // `undefined`, wrapping every dynamic import() in a lazy-compilation proxy module. With
            // this many async chunks (navigators, screens) that causes an infinite
            // "App updated. Recompiling..." loop and 404s on *.hot-update.js — this is a CLI-only
            // default, not an `experiments.lazyCompilation` setting, so it must be disabled here explicitly.
            lazyCompilation: false,
            devServer: {
                static: {
                    directory: path.join(__dirname, '../../dist'),
                },
                client: {
                    overlay: false,
                },
                // rspack-dev-server's 'auto' allowedHosts (the webpack-dev-server default) doesn't
                // reliably recognize the custom `host` below over HTTPS, causing the HMR websocket to
                // loop "Invalid Host/Origin header" → disconnect → reconnect. This is a local-only dev
                // server behind our own HTTPS cert, so bypassing the host check is an acceptable trade-off.
                allowedHosts: 'all',
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
                    'Document-Policy': 'js-profiling',
                },
            },
            plugins: [
                new DefinePlugin({
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
                    {
                        test: /\.js$/,
                        resolve: {
                            fullySpecified: false,
                        },
                        include: [path.resolve(__dirname, '../../node_modules/react-native-tab-view/lib/module/TabView.js')],
                    },
                ],
            },
            // Rspack's incremental/persistent build cache is configured differently from webpack 5's
            // `cache: {type: 'filesystem'}` — left out here deliberately; see contributingGuides note
            // for the follow-up once we validate whether the default incremental rebuild is fast enough
            // to skip it, or whether `experiments.cache` needs to be turned on explicitly.
        });

        return config;
    });

export default getConfiguration;
