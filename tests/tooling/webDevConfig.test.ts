/** Keep local Worker/API opt-outs and coordinated port selection independent. */
import {describe, expect, test} from 'bun:test';

import {assertWebPortAvailable, getDevelopmentConnectOrigins, getWebDevFlags, getWebDevPorts} from '../../scripts/utils/webDevConfig';

describe('web development configuration', () => {
    test('defaults both services on and allows independent opt-outs', () => {
        // Given contributor defaults
        // When flags are resolved
        const defaults = getWebDevFlags({});
        // Then neither opt-out changes the meaning of the other
        expect(defaults).toEqual({isWorkerEnabled: true, isProxyEnabled: true, shouldOpenBrowser: true});
        expect(getWebDevFlags({USE_WEB_PROXY: 'false'})).toMatchObject({isWorkerEnabled: true, isProxyEnabled: false});
        expect(getWebDevFlags({USE_CLOUDFLARE_WORKER: 'false', WEB_OPEN: 'false'})).toEqual({isWorkerEnabled: false, isProxyEnabled: true, shouldOpenBrowser: false});
        expect(getWebDevFlags({USE_CLOUDFLARE_WORKER: 'false', USE_WEB_PROXY: 'false'})).toMatchObject({isWorkerEnabled: false, isProxyEnabled: false});
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

    test('rejects invalid and overlapping ports before starting children', () => {
        // Given invalid coordinated ports
        // When the launcher checks them
        // Then startup fails instead of changing the upstream port behind the Worker's back
        expect(() => getWebDevPorts({WEB_PORT: 'invalid'}, true)).toThrow();
        expect(() => getWebDevPorts({WEB_PORT: '1023'}, true)).toThrow();
        expect(() => getWebDevPorts({WEB_PORT: '65536'}, true)).toThrow();
        expect(() => getWebDevPorts({WEB_PORT: '11000', WEB_INTERNAL_PORT: '11000'}, true)).toThrow('must differ');
    });

    test('fails clearly rather than reusing an occupied worktree origin', () => {
        // Given another server owns a port
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
            // When this session resolves and checks its ports
            // Then resolving them stays side-effect free, and the availability check stops startup before any child starts
            expect(getWebDevPorts({WEB_PORT: String(listener.port)}, false).publicPort).toBe(listener.port);
            expect(() => assertWebPortAvailable(listener.port)).toThrow('in use');
        } finally {
            listener.stop(true);
        }
    });

    test('releases the availability probe so the selected port can be bound', () => {
        // Given an available local port
        const initial = Bun.listen({
            hostname: '127.0.0.1',
            port: 0,
            socket: {
                data: (socket) => {
                    socket.end();
                },
            },
        });
        const port = initial.port;
        initial.stop(true);
        // When a session probes that port
        assertWebPortAvailable(port);
        // Then its actual server can bind the port immediately
        const listener = Bun.listen({
            hostname: '127.0.0.1',
            port,
            socket: {
                data: (socket) => {
                    socket.end();
                },
            },
        });
        listener.stop(true);
    });
});
