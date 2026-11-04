/** Start the live Worker and Rsbuild together, keeping browser-facing URLs independent of the upstream. */
import {$} from 'bun';
import concurrently from 'concurrently';

// The Worker is a separately installed package that the App does not depend on, so it can only be reached by path.
// eslint-disable-next-line import/no-relative-packages
import {API_PROXY_PORT} from '../web/cloudflare-worker/src/developmentAPIProxy';
import checkWebServer from './utils/checkWebServer';
import getWebCommands from './utils/getWebCommands';
import {findWebDevPorts, getDevelopmentConnectOrigins, getWebDevFlags, isWebPortAvailable} from './utils/webDevConfig';
import waitForWebServer from './waitForWebServer';

async function startWeb() {
    // Bun loads .env automatically, preserving explicit shell overrides.
    const isWorkerInstalled = await Bun.file('web/cloudflare-worker/node_modules/wrangler/bin/wrangler.js').exists();
    const {isWorkerEnabled, isWorkerMissing, isProxyEnabled, shouldOpenBrowser} = getWebDevFlags(Bun.env, isWorkerInstalled);
    if (isWorkerMissing) {
        console.warn('Cloudflare Worker tooling is not installed, so serving Rsbuild directly without the Worker. Run npm install (it skips the Worker when CI is set).');
    }
    const {publicPort, internalPort} = findWebDevPorts(Bun.env, isWorkerEnabled, isWebPortAvailable);
    const shouldStartProxy = isProxyEnabled && isWebPortAvailable(API_PROXY_PORT, '::');
    if (isProxyEnabled && !shouldStartProxy) {
        console.log(`Reusing the API proxy already on port ${API_PROXY_PORT}, e.g. from another worktree's session. API requests stop working if that session stops.`);
    }
    for (const file of ['key.pem', 'certificate.pem']) {
        if (!(await Bun.file(`config/rsbuild/${file}`).exists())) {
            throw new Error('Missing local HTTPS certificate. Run npm run setup-https first.');
        }
    }
    const origin = `https://dev.new.expensify.com:${publicPort}`;
    const commands = getWebCommands({
        root: process.cwd(),
        isWorkerEnabled,
        isProxyEnabled,
        shouldStartProxy,
        publicPort,
        internalPort,
        connectOrigins: getDevelopmentConnectOrigins(Bun.env),
    });
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
        const isReady = await waitForWebServer((signal) => checkWebServer(origin, isWorkerEnabled, signal), controller.signal, {
            slowAfter: 180_000,
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
