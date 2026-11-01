import type {RsbuildConfig} from '@rsbuild/core';

import {defineConfig} from '@rsbuild/core';
import {ReactRefreshRspackPlugin} from '@rspack/plugin-react-refresh';
import fs from 'fs';
import path from 'path';
import portfinder from 'portfinder';
import {fileURLToPath} from 'url';

import type Environment from './types.ts';

// The Worker is a separately installed package that the App does not depend on, so it can only be reached by path.
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
// eslint-disable-next-line import/no-relative-packages
import {API_PROXY_PATHS, API_PROXY_PORT} from '../../web/cloudflare-worker/src/developmentAPIProxy.ts';
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
// eslint-disable-next-line import/no-relative-packages
import NONCE_PLACEHOLDER from '../../web/cloudflare-worker/src/noncePlaceholder.ts';
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
import getDevServerSettings from './getDevServerSettings.ts';
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
    const common: RsbuildConfig = await getCommonConfiguration({file: envFile, platform: 'web', isDevServer});

    if (!isDevServer) {
        return {
            ...common,
            performance: {
                ...common.performance,
                // Invalidate the persistent cache (enabled in rsbuild.common.ts) if this config file
                // itself changes, same as the dev-server branch below.
                buildCache: {buildDependencies: [filename]},
            },
        };
    }

    const {isWorkerEnabled, publicPort, port, strictPort, open} = await getDevServerSettings(process.env, () => portfinder.getPortPromise({port: BASE_PORT}));
    // Check if the USE_WEB_PROXY variable has been provided and rewrite any requests to the local proxy server
    const proxyTarget = process.env.LOCAL_WEB_PROXY_TARGET ?? `http://[::1]:${API_PROXY_PORT}`;
    const proxy = process.env.USE_WEB_PROXY === 'false' ? undefined : [{pathFilter: API_PROXY_PATHS, target: proxyTarget}];

    const commonRspackTool = common.tools?.rspack;

    const devConfig: RsbuildConfig = {
        ...common,
        dev: {
            client: {overlay: false},
            assetPrefix: '/',
            lazyCompilation: false,
        },
        security: isWorkerEnabled ? {nonce: NONCE_PLACEHOLDER} : common.security,
        source: {
            ...common.source,
            define: {
                ...common.source?.define,
                // CONFIG.DEV_PORT builds browser-facing links, so it must not use the private Rsbuild port.
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'process.env.PORT': publicPort,
            },
        },
        server: {
            proxy,
            port,
            strictPort,
            host: isWorkerEnabled ? '127.0.0.1' : 'dev.new.expensify.com',
            open,
            https: isWorkerEnabled
                ? undefined
                : {
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

                afterCommon.plugins ??= [];
                afterCommon.plugins.push(new ReactRefreshRspackPlugin());

                return afterCommon;
            },
        },
    };

    return devConfig;
});
