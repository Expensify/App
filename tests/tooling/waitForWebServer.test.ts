/** Startup dependencies should wait for usable HTTP responses and stop cleanly on failure or cancellation. */
import {describe, expect, setSystemTime, test} from 'bun:test';

import waitForWebServer from '../../scripts/waitForWebServer';

describe('Rsbuild startup gate', () => {
    test('waits through unavailable responses before allowing the dependent command to start', async () => {
        // Given an upstream whose first responses are not ready
        let requests = 0;
        const server = Bun.serve({port: 0, hostname: '127.0.0.1', fetch: () => new Response('compiling', {status: ++requests < 3 ? 503 : 200})});
        try {
            // When the gate waits for the server
            await waitForWebServer(server.url.href, new AbortController().signal, {timeout: 1000, interval: 5});
            // Then it returns only after a successful response
            expect(requests).toBe(3);
        } finally {
            await server.stop(true);
        }
    });

    test('waits through a slow first compile by default rather than stopping the session', async () => {
        // Given an upstream whose first compile outlasts any fixed startup deadline
        let requests = 0;
        const server = Bun.serve({
            port: 0,
            hostname: '127.0.0.1',
            fetch: () => {
                if (++requests === 2) {
                    setSystemTime(new Date(Date.now() + 10 * 60_000));
                }
                return new Response('compiling', {status: requests < 4 ? 503 : 200});
            },
        });
        try {
            // When the gate waits with its default settings
            await waitForWebServer(server.url.href, new AbortController().signal, {interval: 5});
            // Then it starts the Worker once Rsbuild responds
            expect(requests).toBe(4);
        } finally {
            setSystemTime();
            await server.stop(true);
        }
    });

    test('reports compilation/startup timeouts instead of starting the Worker', async () => {
        // Given an upstream that never becomes ready
        const server = Bun.serve({port: 0, hostname: '127.0.0.1', fetch: () => new Response(null, {status: 503})});
        try {
            // When the startup deadline expires
            // Then the gate rejects, so the shell never starts Wrangler
            await expect(waitForWebServer(server.url.href, new AbortController().signal, {timeout: 50, interval: 5})).rejects.toThrow('Timed out waiting for Rsbuild');
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
            // Then readiness rejects promptly rather than starting a dependent process
            await expect(waitForWebServer(server.url.href, controller.signal)).rejects.toThrow();
        } finally {
            // Bun cannot stop a server while a handler is still pending.
            sendResponse(new Response('ready'));
            await server.stop(true);
        }
    });
});
