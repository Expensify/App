/** Start the live Worker and Rsbuild together, keeping browser-facing URLs independent of the upstream. */
import {$} from 'bun';
import concurrently from 'concurrently';

import waitForPublicWebServer from './utils/waitForPublicWebServer';
import {assertWebPortAvailable, getDevelopmentConnectOrigins, getWebDevFlags, getWebDevPorts} from './utils/webDevConfig';

async function startWeb() {
    // Bun loads .env automatically, preserving explicit shell overrides.
    const {isWorkerEnabled, isProxyEnabled, shouldOpenBrowser} = getWebDevFlags(Bun.env);
    const {publicPort, internalPort} = getWebDevPorts(Bun.env, isWorkerEnabled);
    if (isProxyEnabled) {
        assertWebPortAvailable(9000, '::');
    }
    for (const file of ['key.pem', 'certificate.pem']) {
        if (!(await Bun.file(`config/rsbuild/${file}`).exists())) {
            throw new Error('Missing local HTTPS certificate. Run npm run setup-https first.');
        }
    }
    if (isWorkerEnabled && !(await Bun.file('web/cloudflare-worker/node_modules/wrangler/bin/wrangler.js').exists())) {
        throw new Error('Missing Worker dependencies. Run npm install to finish App setup.');
    }
    const origin = `https://dev.new.expensify.com:${publicPort}`;
    Bun.env.WEB_PORT = String(publicPort);
    Bun.env.WEB_INTERNAL_PORT = String(internalPort);
    Bun.env.USE_CLOUDFLARE_WORKER = String(isWorkerEnabled);
    Bun.env.USE_WEB_PROXY = String(isProxyEnabled);
    const root = process.cwd();
    const workerDir = `${root}/web/cloudflare-worker`;
    // concurrently accepts command strings, so escape its dynamic paths and JSON bindings.
    const commands = [
        ...(isProxyEnabled ? [{name: 'api', command: 'npm run web-proxy'}] : []),
        {name: 'rsbuild', command: 'node node_modules/@rsbuild/core/bin/rsbuild.js dev --config config/rsbuild/rsbuild.config.ts'},
        ...(isWorkerEnabled
            ? [
                  {
                      name: 'worker',
                      cwd: workerDir,
                      command: [
                          `bun ../../scripts/waitForWebServer.ts http://127.0.0.1:${internalPort}/ &&`,
                          'node node_modules/wrangler/bin/wrangler.js dev --local --config wrangler.dev.jsonc',
                          `--ip 127.0.0.1 --port ${publicPort} --inspector-port 0 --local-protocol https`,
                          `--https-key-path ${$.escape(`${root}/config/rsbuild/key.pem`)}`,
                          `--https-cert-path ${$.escape(`${root}/config/rsbuild/certificate.pem`)}`,
                          `--var ${$.escape(`DEV_UPSTREAM:http://127.0.0.1:${internalPort}`)}`,
                          `--var ${$.escape(`DEV_CONNECT_ORIGINS:${JSON.stringify(getDevelopmentConnectOrigins(Bun.env))}`)}`,
                      ].join(' '),
                  },
              ]
            : []),
    ];
    const controller = new AbortController();
    const {commands: children, result} = concurrently(commands, {killOthersOn: ['success', 'failure'], killTimeout: 3000});
    const stop = () => {
        controller.abort();
        for (const child of children) {
            child.kill('SIGTERM');
        }
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    // Verify the browser-facing listener and certificate, not just the internal compiler's listener.
    const readiness = (async () => {
        const isReady = await waitForPublicWebServer(origin, isWorkerEnabled, controller.signal, {
            onSlow: () => console.warn(`Still waiting for ${origin}/. Check the dev server output. If it compiled, check that its certificate is trusted (npm run setup-https).`),
        });
        if (!isReady) {
            return;
        }
        console.log(`Web app ready at ${origin}/ (${isWorkerEnabled ? 'Cloudflare Worker' : 'direct Rsbuild'})`);
        if (shouldOpenBrowser) {
            const browserCommands: Partial<Record<NodeJS.Platform, string>> = {darwin: 'open', win32: 'cmd'};
            const command = browserCommands[process.platform] ?? 'xdg-open';
            const args = process.platform === 'win32' ? ['/c', 'start', '', `${origin}/`] : [`${origin}/`];
            $`${command} ${args}`.quiet().catch((error: unknown) => {
                console.error(`Open ${origin}/ in your browser:`, error);
            });
        }
    })();
    try {
        await Promise.race([result, readiness]);
        await result;
    } finally {
        stop();
        await readiness.catch(() => {});
        process.removeListener('SIGINT', stop);
        process.removeListener('SIGTERM', stop);
    }
}

startWeb().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
