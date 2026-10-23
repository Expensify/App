/** Resolve one set of ports and flags for every process in a local web session. */
import {LOCAL_BACKEND_URL_KEYS} from '../../config/rsbuild/developmentEnvKeys';

function getWebDevFlags(env: Record<string, string | undefined>) {
    return {isWorkerEnabled: env.USE_CLOUDFLARE_WORKER !== 'false', isProxyEnabled: env.USE_WEB_PROXY !== 'false', shouldOpenBrowser: env.WEB_OPEN !== 'false'};
}

function getDevelopmentConnectOrigins(env: Record<string, string | undefined>): string[] {
    const origins = new Set<string>();
    for (const key of LOCAL_BACKEND_URL_KEYS) {
        const value = env[key];
        if (!value) {
            continue;
        }
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
            throw new Error(`${key} must be an HTTP(S) URL without credentials`);
        }
        origins.add(url.origin);
    }
    return [...origins];
}

/** Fail on conflicts rather than letting a child silently attach to another worktree's server. */
function assertWebPortAvailable(port: number, host = '127.0.0.1'): void {
    try {
        const listener = Bun.listen({
            hostname: host,
            port,
            socket: {
                data: (socket) => {
                    socket.end();
                },
            },
        });
        listener.stop(true);
    } catch {
        throw new Error(`Port ${port} on ${host} is in use. Stop its owner or change this session's port/proxy settings.`);
    }
}

/** Parse and validate the session's ports. Use `assertWebPortAvailable` to check that they are free. */
function getWebDevPorts(env: Record<string, string | undefined>, isWorkerEnabled: boolean) {
    const publicPort = Number(env.WEB_PORT ?? 8082);
    const internalPort = Number(env.WEB_INTERNAL_PORT ?? publicPort + 1);
    if (isWorkerEnabled && publicPort === internalPort) {
        throw new Error('WEB_PORT and WEB_INTERNAL_PORT must differ');
    }
    const ports = isWorkerEnabled ? [publicPort, internalPort] : [publicPort];
    if (ports.some((port) => !Number.isInteger(port) || port < 1024 || port > 65535)) {
        throw new Error('WEB_PORT and WEB_INTERNAL_PORT must be integers between 1024 and 65535');
    }
    return {publicPort, internalPort, ports};
}

export {assertWebPortAvailable, getDevelopmentConnectOrigins, getWebDevFlags, getWebDevPorts};
