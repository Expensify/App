/** Resolve one set of ports and flags for every process in a local web session. */
import net from 'node:net';

const LOCAL_BACKEND_KEYS = ['EXPENSIFY_URL', 'SECURE_EXPENSIFY_URL', 'STAGING_EXPENSIFY_URL', 'STAGING_SECURE_EXPENSIFY_URL', 'NGROK_URL', 'SECURE_NGROK_URL'];

function getWebDevFlags(env: NodeJS.ProcessEnv) {
    return {useWorker: env.USE_CLOUDFLARE_WORKER !== 'false', useProxy: env.USE_WEB_PROXY !== 'false', openBrowser: env.WEB_OPEN !== 'false'};
}

function getDevelopmentConnectOrigins(env: NodeJS.ProcessEnv): string[] {
    return [
        ...new Set(
            LOCAL_BACKEND_KEYS.flatMap((key) => {
                const value = env[key];
                if (!value) {
                    return [];
                }
                const url = new URL(value);
                if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
                    throw new Error(`${key} must be an HTTP(S) URL without credentials`);
                }
                return [url.origin];
            }),
        ),
    ];
}

/** Fail on conflicts rather than letting a child silently attach to another worktree's server. */
async function assertWebPortAvailable(port: number, host = '127.0.0.1'): Promise<void> {
    const server = net.createServer();
    await new Promise<void>((resolve, reject) => {
        server.once('error', () => reject(new Error(`Port ${port} on ${host} is in use. Stop its owner or change this session's port/proxy settings.`)));
        server.listen(port, host, () => server.close(() => resolve()));
    });
}

async function getWebDevPorts(env: NodeJS.ProcessEnv, useWorker: boolean) {
    const publicPort = Number(env.WEB_PORT ?? 8082);
    const internalPort = Number(env.WEB_INTERNAL_PORT ?? publicPort + 1);
    if (useWorker && publicPort === internalPort) {
        throw new Error('WEB_PORT and WEB_INTERNAL_PORT must differ');
    }
    for (const port of useWorker ? [publicPort, internalPort] : [publicPort]) {
        if (!Number.isInteger(port) || port < 1024 || port > 65535) {
            throw new Error('WEB_PORT and WEB_INTERNAL_PORT must be integers between 1024 and 65535');
        }
        await assertWebPortAvailable(port);
    }
    return {publicPort, internalPort};
}

export {assertWebPortAvailable, getDevelopmentConnectOrigins, getWebDevFlags, getWebDevPorts};
