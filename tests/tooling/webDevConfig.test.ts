/** Keep local Worker/API opt-outs and coordinated port selection independent. */
import {describe, expect, test} from 'bun:test';

import {findWebDevPorts, getDevelopmentConnectOrigins, getWebDevFlags, isWebPortAvailable} from '../../scripts/utils/webDevConfig';

const isFree = () => true;

describe('web development configuration', () => {
    test('defaults both services on and allows independent opt-outs', () => {
        // Given contributor defaults, with the Worker tooling installed
        // When flags are resolved
        const defaults = getWebDevFlags({}, true);
        // Then neither opt-out changes the meaning of the other
        expect(defaults).toEqual({isWorkerEnabled: true, isWorkerMissing: false, isProxyEnabled: true, shouldOpenBrowser: true});
        expect(getWebDevFlags({USE_WEB_PROXY: 'false'}, true)).toMatchObject({isWorkerEnabled: true, isProxyEnabled: false});
        expect(getWebDevFlags({USE_CLOUDFLARE_WORKER: 'false', WEB_OPEN: 'false'}, true)).toEqual({
            isWorkerEnabled: false,
            isWorkerMissing: false,
            isProxyEnabled: true,
            shouldOpenBrowser: false,
        });
        expect(getWebDevFlags({USE_CLOUDFLARE_WORKER: 'false', USE_WEB_PROXY: 'false'}, true)).toMatchObject({isWorkerEnabled: false, isProxyEnabled: false});
    });

    test('serves Rsbuild directly when the Worker tooling is not installed', () => {
        // Given a checkout whose install skipped or failed to install the Worker, e.g. with CI set
        // When flags are resolved
        // Then the session still starts without the Worker, and says why, rather than failing
        expect(getWebDevFlags({}, false)).toMatchObject({isWorkerEnabled: false, isWorkerMissing: true});
        // And a session that opted out of the Worker has nothing to report
        expect(getWebDevFlags({USE_CLOUDFLARE_WORKER: 'false'}, false)).toMatchObject({isWorkerEnabled: false, isWorkerMissing: false});
    });

    test('validates and deduplicates explicit backend origins', () => {
        // Given backend settings with paths
        // When CSP origins are resolved
        const origins = getDevelopmentConnectOrigins({EXPENSIFY_URL: 'https://api.example.test/path', SECURE_EXPENSIFY_URL: 'https://api.example.test/secure'});
        // Then only exact origins survive and credentials/non-HTTP schemes cannot enter the policy
        expect(origins).toEqual(['https://api.example.test']);
        expect(() => getDevelopmentConnectOrigins({EXPENSIFY_URL: 'file:///etc/hosts'})).toThrow();
        expect(() => getDevelopmentConnectOrigins({EXPENSIFY_URL: 'https://user:pass@example.test'})).toThrow();
    });

    test('allows the QA backend and its Cloudflare Access team domain', () => {
        // Given a QA backend behind Cloudflare Access, whose token endpoint the app calls on the bare team domain
        // When CSP origins are resolved
        const origins = getDevelopmentConnectOrigins({
            QA_EXPENSIFY_URL: 'https://qa.example.test/',
            QA_SECURE_EXPENSIFY_URL: 'https://secure-qa.example.test/',
            QA_CF_TEAM_DOMAIN: 'team.cloudflareaccess.com',
        });
        // Then the app can reach the QA hosts and the Access issuer
        expect(origins).toEqual(['https://qa.example.test', 'https://secure-qa.example.test', 'https://team.cloudflareaccess.com']);
    });

    test('names QA_CF_TEAM_DOMAIN when it is not a bare hostname', () => {
        // Given a team domain written as a URL, which the app would prefix with https:// again
        // When CSP origins are resolved
        // Then startup explains the setting rather than allowing an origin the app never calls
        for (const QA_CF_TEAM_DOMAIN of ['https://team.cloudflareaccess.com', 'team.cloudflareaccess.com/path', 'user@team.cloudflareaccess.com']) {
            expect(() => getDevelopmentConnectOrigins({QA_CF_TEAM_DOMAIN})).toThrow('QA_CF_TEAM_DOMAIN');
        }
    });

    test('rejects invalid and overlapping ports before starting children', () => {
        // Given invalid coordinated ports
        // When the launcher resolves them
        // Then startup fails instead of changing the upstream port behind the Worker's back
        expect(() => findWebDevPorts({WEB_PORT: 'invalid'}, true, isFree)).toThrow();
        expect(() => findWebDevPorts({WEB_PORT: '1023'}, true, isFree)).toThrow();
        expect(() => findWebDevPorts({WEB_PORT: '65536'}, true, isFree)).toThrow();
        expect(() => findWebDevPorts({WEB_PORT: '11000', WEB_INTERNAL_PORT: '11000'}, true, isFree)).toThrow('must differ');
    });

    test('uses the default ports when they are free', () => {
        // Given a machine with no other web session
        // When the launcher resolves its ports
        // Then the app is at its usual origin
        expect(findWebDevPorts({}, true, isFree)).toEqual({publicPort: 8082, internalPort: 8083});
    });

    test('moves a second session to the next free ports rather than failing', () => {
        // Given another worktree's session on the default ports
        const busy = new Set([8082, 8083, 8085]);
        // When this session resolves its ports
        // Then it takes the next free ones, as portfinder did before the Worker
        expect(findWebDevPorts({}, true, (port) => !busy.has(port))).toEqual({publicPort: 8084, internalPort: 8086});
        expect(findWebDevPorts({}, false, (port) => !busy.has(port)).publicPort).toBe(8084);
    });

    test('fails fast on a busy port the user chose explicitly', () => {
        // Given explicitly requested ports that another server owns
        const busy = new Set([9100, 9201]);
        // When the launcher resolves them
        // Then it says which one is taken rather than silently moving the session
        expect(() => findWebDevPorts({WEB_PORT: '9100'}, true, (port) => !busy.has(port))).toThrow('Port 9100 is in use');
        expect(() => findWebDevPorts({WEB_PORT: '9200', WEB_INTERNAL_PORT: '9201'}, true, (port) => !busy.has(port))).toThrow('Port 9201 is in use');
        // And a free explicit choice is used as is, with the other port found around it
        expect(findWebDevPorts({WEB_INTERNAL_PORT: '8082'}, true, isFree)).toEqual({publicPort: 8083, internalPort: 8082});
    });

    test('detects a port another server owns, and releases its own probe', () => {
        // Given another server on one port
        const listener = Bun.listen({
            hostname: '127.0.0.1',
            port: 0,
            socket: {
                data: (socket) => {
                    socket.end();
                },
            },
        });
        try {
            // When the launcher probes it, and a port it freed itself
            // Then the owned port is unavailable
            expect(isWebPortAvailable(listener.port)).toBe(false);
        } finally {
            listener.stop(true);
        }
        // And once free, the probe does not keep it from the session's own server
        expect(isWebPortAvailable(listener.port)).toBe(true);
        Bun.listen({
            hostname: '127.0.0.1',
            port: listener.port,
            socket: {
                data: (socket) => {
                    socket.end();
                },
            },
        }).stop(true);
    });
});
