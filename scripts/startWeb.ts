/** Start the live Worker and Rsbuild together, keeping browser-facing URLs independent of the upstream. */
import concurrently from 'concurrently';
import dotenv from 'dotenv';
import {execFileSync, spawn} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

import checkWebServer from './utils/checkWebServer';
import {assertWebPortAvailable, getDevelopmentConnectOrigins, getWebDevFlags, getWebDevPorts} from './utils/webDevConfig';

async function startWeb() {
    dotenv.config();
    const {useWorker, useProxy, openBrowser} = getWebDevFlags(process.env);
    const {publicPort, internalPort} = await getWebDevPorts(process.env, useWorker);
    if (useProxy) {
        await assertWebPortAvailable(9000, '::');
    }
    for (const file of ['key.pem', 'certificate.pem']) {
        if (!existsSync(`config/rsbuild/${file}`)) {
            throw new Error('Missing local HTTPS certificate. Run npm run setup-https first.');
        }
    }
    if (useWorker && !existsSync('web/cloudflare-worker/node_modules/wrangler/bin/wrangler.js')) {
        throw new Error('Missing Worker dependencies. Run npm install to finish App setup.');
    }
    const origin = `https://dev.new.expensify.com:${publicPort}`;
    process.env.WEB_PORT = String(publicPort);
    process.env.WEB_INTERNAL_PORT = String(internalPort);
    process.env.USE_CLOUDFLARE_WORKER = String(useWorker);
    process.env.USE_WEB_PROXY = String(useProxy);
    const workerDir = path.resolve('web/cloudflare-worker');
    const ca = readFileSync(path.join(execFileSync('mkcert', ['-CAROOT'], {encoding: 'utf8'}).trim(), 'rootCA.pem'));
    // Values include local paths and JSON; neither should be expanded by the child shell.
    const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;
    const commands = [
        ...(useProxy ? [{name: 'api', command: 'npm run web-proxy'}] : []),
        {name: 'rsbuild', command: 'node node_modules/@rsbuild/core/bin/rsbuild.js dev --config config/rsbuild/rsbuild.config.ts'},
        ...(useWorker
            ? [
                  {
                      name: 'worker',
                      cwd: workerDir,
                      command: [
                          'node node_modules/wrangler/bin/wrangler.js dev --local --config wrangler.dev.jsonc',
                          `--ip 127.0.0.1 --port ${publicPort} --inspector-port 0 --local-protocol https`,
                          `--https-key-path ${quote(path.resolve('config/rsbuild/key.pem'))}`,
                          `--https-cert-path ${quote(path.resolve('config/rsbuild/certificate.pem'))}`,
                          `--var ${quote(`DEV_UPSTREAM:http://127.0.0.1:${internalPort}`)}`,
                          `--var ${quote(`DEV_CONNECT_ORIGINS:${JSON.stringify(getDevelopmentConnectOrigins(process.env))}`)}`,
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
        const deadline = Date.now() + 180_000;
        while (!controller.signal.aborted) {
            try {
                const ready = await checkWebServer(origin, ca, useWorker, controller.signal);
                if (ready) {
                    console.log(`Web app ready at ${origin}/ (${useWorker ? 'Cloudflare Worker' : 'direct Rsbuild'})`);
                    if (openBrowser && !controller.signal.aborted) {
                        const browserCommands: Partial<Record<NodeJS.Platform, string>> = {darwin: 'open', win32: 'cmd'};
                        const command = browserCommands[process.platform] ?? 'xdg-open';
                        const args = process.platform === 'win32' ? ['/c', 'start', '', `${origin}/`] : [`${origin}/`];
                        const browser = spawn(command, args, {stdio: 'ignore'});
                        browser.on('error', (error) => console.error(`Open ${origin}/ in your browser: ${error.message}`));
                    }
                    return;
                }
            } catch {
                // The dev server can be between starting its listener and completing its first compilation.
            }
            if (Date.now() > deadline) {
                throw new Error(`Timed out waiting for ${origin}. Check the dev server output.`);
            }
            await delay(250, undefined, {signal: controller.signal});
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
