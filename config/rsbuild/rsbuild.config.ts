import type {RsbuildConfig} from '@rsbuild/core';

import {defineConfig} from '@rsbuild/core';
import {ReactRefreshRspackPlugin} from '@rspack/plugin-react-refresh';
import fs from 'fs';
import path from 'path';
import portfinder from 'portfinder';
import {fileURLToPath} from 'url';

import type Environment from './types.ts';

// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
import getCommonConfiguration from './rsbuild.common.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const BASE_PORT = 8082;

let envFile: Environment['file'] = '.env';
switch (process.env.ENV) {
    case 'production':
        envFile = '.env.production';
        break;
    case 'staging':
        envFile = '.env.staging';
        break;
    case 'adhoc':
        envFile = '.env.adhoc';
        break;
    default:
        envFile = '.env';
}

export default defineConfig(async ({command}) => {
    const isDevServer = command === 'dev';
    const common: RsbuildConfig = getCommonConfiguration({file: envFile, platform: 'web'});

    if (!isDevServer) {
        return common;
    }

    const port = await portfinder.getPortPromise({port: BASE_PORT});
    // Check if the USE_WEB_PROXY variable has been provided and rewrite any requests to the local proxy server
    const proxy = process.env.USE_WEB_PROXY === 'false' ? undefined : [{pathFilter: ['/api', '/staging', '/chat-attachments', '/receipts'], target: 'http://[::1]:9000'}];

    const commonRspackTool = common.tools?.rspack;

    const devConfig: RsbuildConfig = {
        ...common,
        dev: {
            client: {overlay: false},
            lazyCompilation: false,
        },
        source: {
            ...common.source,
            define: {
                ...common.source?.define,
                // The dev server's resolved port can differ from BASE_PORT if 8082 is already in use.
                // CONFIG.DEV_PORT (src/CONFIG.ts) reads this at runtime to build correct dev environment URLs.
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'process.env.PORT': port,
            },
        },
        server: {
            proxy,
            port,
            host: 'dev.new.expensify.com',
            // Rsbuild's --open flag defaults to the first entry's route, e.g. "/main" for our "main" entry key,
            // which 404s since the app has no route by that name. Open the actual app root instead.
            open: '/',
            https: {
                key: fs.readFileSync(path.join(dirname, 'key.pem')),
                cert: fs.readFileSync(path.join(dirname, 'certificate.pem')),
            },
            headers: {
                // HTTP header names aren't valid camelCase identifiers.
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Document-Policy': 'js-profiling',
            },
        },
        performance: {
            ...common.performance,
            buildCache: {
                buildDependencies: [filename],
            },
        },
        tools: {
            ...common.tools,
            rspack: (config, utils) => {
                // See the equivalent cast in rsbuild.common.ts for why the Promise branch is discarded here.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                const afterCommon = (typeof commonRspackTool === 'function' ? (commonRspackTool(config, utils) ?? config) : config) as typeof config;

                // A list of paths rspack trusts would not be modified while rspack is running.
                // Onyx and react-native-live-markdown can be modified on the fly, changes to other
                // node_modules would not be reflected live.
                afterCommon.cache ??= {type: 'persistent'};
                if (typeof afterCommon.cache === 'object' && afterCommon.cache.type === 'persistent') {
                    afterCommon.cache.snapshot = {
                        managedPaths: [/([\\/]node_modules[\\/](?!react-native-onyx|@expensify\/react-native-live-markdown))/],
                    };
                }

                afterCommon.plugins ??= [];
                afterCommon.plugins.push(new ReactRefreshRspackPlugin());

                return afterCommon;
            },
        },
    };

    return devConfig;
});
