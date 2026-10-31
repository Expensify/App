/** Startup dependencies should wait for usable HTTP responses for as long as the session runs, and stop cleanly on cancellation. */
import {afterEach, describe, expect, mock, setSystemTime, test} from 'bun:test';

import waitForWebServer, {isRsbuildReady} from '../../scripts/waitForWebServer';

describe('dev server readiness', () => {
    afterEach(() => setSystemTime());

    test('retries failed and throwing probes until the server is ready', async () => {
        // Given a server that is not listening, then compiling, then ready
        const results = [new TypeError('Connection refused'), false, true];
        const probe = mock(async () => {
            const result = results.shift();
            if (result instanceof Error) {
                throw result;
            }
            return result ?? true;
        });
        // When the launcher waits for it
        // Then it is ready only after the successful probe
        expect(await waitForWebServer(probe, new AbortController().signal, {interval: 1})).toBe(true);
        expect(probe).toHaveBeenCalledTimes(3);
    });

    test('waits through a slow first compile, reporting the delay once rather than stopping the session', async () => {
        // Given a server whose first compile outlasts any fixed startup deadline
        let probes = 0;
        const probe = async () => {
            if (++probes === 2) {
                setSystemTime(new Date(Date.now() + 10 * 60_000));
            }
            return probes >= 5;
        };
        const onSlow = mock(() => {});
        // When the launcher waits for it
        const isReady = await waitForWebServer(probe, new AbortController().signal, {interval: 1, slowAfter: 180_000, onSlow});
        // Then it keeps waiting until the server is ready, and reports the delay once
        expect(isReady).toBe(true);
        expect(probes).toBe(5);
        expect(onSlow).toHaveBeenCalledTimes(1);
    });

    test('stops without readiness when the session stops', async () => {
        // Given a server that never becomes ready
        const controller = new AbortController();
        const probe = async () => {
            controller.abort();
            return false;
        };
        // When the session is stopped
        // Then waiting ends without starting dependent processes
        expect(await waitForWebServer(probe, controller.signal, {interval: 1})).toBe(false);
    });
});

describe('Rsbuild startup gate', () => {
    test('requires a successful response, not a listening socket', async () => {
        // Given Rsbuild compiling, redirecting, then serving the app
        const statuses = [503, 302, 200];
        const server = Bun.serve({port: 0, hostname: '127.0.0.1', fetch: () => new Response(null, {status: statuses.shift() ?? 200, headers: {Location: '/'}})});
        try {
            // When the gate probes it
            const signal = new AbortController().signal;
            // Then only the 200 starts the Worker
            expect([await isRsbuildReady(server.url.href, signal), await isRsbuildReady(server.url.href, signal), await isRsbuildReady(server.url.href, signal)]).toEqual([
                false,
                false,
                true,
            ]);
        } finally {
            await server.stop(true);
        }
    });

    test('cancels an in-flight request when the session stops', async () => {
        // Given a request that cannot yet return headers
        const controller = new AbortController();
        const {promise: response, resolve: sendResponse} = Promise.withResolvers<Response>();
        const server = Bun.serve({
            port: 0,
            hostname: '127.0.0.1',
            fetch: () => {
                controller.abort();
                return response;
            },
        });
        try {
            // When the session is cancelled
            // Then readiness ends promptly rather than starting a dependent process
            expect(await waitForWebServer((signal) => isRsbuildReady(server.url.href, signal), controller.signal)).toBe(false);
        } finally {
            // Bun cannot stop a server while a handler is still pending.
            sendResponse(new Response('ready'));
            await server.stop(true);
        }
    });
});
