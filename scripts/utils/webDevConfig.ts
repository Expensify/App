/** Resolve one set of ports and flags for every process in a local web session. */
import {LOCAL_BACKEND_URL_KEYS, QA_ACCESS_TEAM_DOMAIN_KEY} from '../../config/rsbuild/developmentEnvKeys';

/** A session whose install skipped or failed to install the Worker tooling still starts, serving Rsbuild directly. */
function getWebDevFlags(env: Record<string, string | undefined>, isWorkerInstalled: boolean) {
    const isWorkerRequested = env.USE_CLOUDFLARE_WORKER !== 'false';
    return {
        isWorkerEnabled: isWorkerRequested && isWorkerInstalled,
        isWorkerMissing: isWorkerRequested && !isWorkerInstalled,
        isProxyEnabled: env.USE_WEB_PROXY !== 'false',
        shouldOpenBrowser: env.WEB_OPEN !== 'false',
    };
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
    const teamDomain = env[QA_ACCESS_TEAM_DOMAIN_KEY];
    if (teamDomain) {
        const issuer = URL.parse(`https://${teamDomain}`);
        if (issuer?.host !== teamDomain.toLowerCase()) {
            throw new Error(`${QA_ACCESS_TEAM_DOMAIN_KEY} must be a bare hostname, like team.cloudflareaccess.com`);
        }
        origins.add(issuer.origin);
    }
    return [...origins];
}

/** Whether a session could bind the port. Releases its probe immediately, so the session's own server can bind it. */
function isWebPortAvailable(port: number, host = '127.0.0.1'): boolean {
    try {
        Bun.listen({
            hostname: host,
            port,
            socket: {
                data: (socket) => {
                    socket.end();
                },
            },
        }).stop(true);
        return true;
    } catch {
        return false;
    }
}

const DEFAULT_WEB_PORT = 8082;
const MIN_WEB_PORT = 1024;
const MAX_WEB_PORT = 65535;

function parseWebPort(env: Record<string, string | undefined>, key: 'WEB_PORT' | 'WEB_INTERNAL_PORT'): number | undefined {
    const value = env[key];
    if (value === undefined) {
        return undefined;
    }
    const port = Number(value);
    if (!Number.isInteger(port) || port < MIN_WEB_PORT || port > MAX_WEB_PORT) {
        throw new Error(`${key} must be an integer between ${MIN_WEB_PORT} and ${MAX_WEB_PORT}`);
    }
    return port;
}

/**
 * Ports the user set must be free, since they asked for exactly those. Otherwise take the first free ports from 8082 up,
 * so a second worktree's session starts alongside the first, as it did before the Worker.
 */
function findWebDevPorts(env: Record<string, string | undefined>, isWorkerEnabled: boolean, isPortAvailable: (port: number) => boolean) {
    const explicitPublicPort = parseWebPort(env, 'WEB_PORT');
    const explicitInternalPort = isWorkerEnabled ? parseWebPort(env, 'WEB_INTERNAL_PORT') : undefined;
    if (explicitPublicPort !== undefined && explicitPublicPort === explicitInternalPort) {
        throw new Error('WEB_PORT and WEB_INTERNAL_PORT must differ');
    }
    for (const port of [explicitPublicPort, explicitInternalPort]) {
        if (port !== undefined && !isPortAvailable(port)) {
            throw new Error(`Port ${port} is in use. Stop its owner, or unset WEB_PORT and WEB_INTERNAL_PORT to use free ports.`);
        }
    }
    const findFreePort = (from: number, taken: number | undefined) => {
        for (let port = from; port <= MAX_WEB_PORT; port++) {
            if (port !== taken && isPortAvailable(port)) {
                return port;
            }
        }
        throw new Error(`No free port from ${from} up for the web dev server`);
    };
    const publicPort = explicitPublicPort ?? findFreePort(DEFAULT_WEB_PORT, explicitInternalPort);
    // Rsbuild ignores the internal port without the Worker.
    const internalPort = isWorkerEnabled ? (explicitInternalPort ?? findFreePort(publicPort + 1, publicPort)) : publicPort + 1;
    return {publicPort, internalPort};
}

export {findWebDevPorts, getDevelopmentConnectOrigins, getWebDevFlags, isWebPortAvailable};
