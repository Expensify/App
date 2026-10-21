/** Keep local Worker/API opt-outs and coordinated port selection independent. */
import {describe, expect, test} from 'bun:test';

import net from 'node:net';

import {getDevelopmentConnectOrigins, getWebDevFlags, getWebDevPorts} from '../../scripts/utils/webDevConfig';

describe('web development configuration', () => {
    test('defaults both services on and allows independent opt-outs', () => {
        // Given contributor defaults
        // When flags are resolved
        const defaults = getWebDevFlags({});
        // Then neither opt-out changes the meaning of the other
        expect(defaults).toEqual({useWorker: true, useProxy: true, openBrowser: true});
        expect(getWebDevFlags({USE_WEB_PROXY: 'false'})).toMatchObject({useWorker: true, useProxy: false});
        expect(getWebDevFlags({USE_CLOUDFLARE_WORKER: 'false', WEB_OPEN: 'false'})).toEqual({useWorker: false, useProxy: true, openBrowser: false});
        expect(getWebDevFlags({USE_CLOUDFLARE_WORKER: 'false', USE_WEB_PROXY: 'false'})).toMatchObject({useWorker: false, useProxy: false});
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

    test('rejects invalid and overlapping ports before starting children', async () => {
        // Given invalid coordinated ports
        // When the launcher checks them
        // Then startup fails instead of changing the upstream port behind the Worker's back
        await expect(getWebDevPorts({WEB_PORT: 'invalid'}, true)).rejects.toThrow();
        await expect(getWebDevPorts({WEB_PORT: '1023'}, true)).rejects.toThrow();
        await expect(getWebDevPorts({WEB_PORT: '65536'}, true)).rejects.toThrow();
        await expect(getWebDevPorts({WEB_PORT: '11000', WEB_INTERNAL_PORT: '11000'}, true)).rejects.toThrow('must differ');
    });

    test('fails clearly rather than reusing an occupied worktree origin', async () => {
        // Given another server owns a port
        const server = net.createServer();
        await new Promise<void>((resolve) => {
            server.listen(0, '127.0.0.1', resolve);
        });
        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Missing test port');
        }
        try {
            // When this session tries to use it
            // Then no child is started against that unrelated listener
            await expect(getWebDevPorts({WEB_PORT: String(address.port)}, false)).rejects.toThrow('in use');
        } finally {
            await new Promise<void>((resolve) => {
                server.close(() => resolve());
            });
        }
    });
});
