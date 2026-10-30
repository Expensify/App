/** Readiness probes must time out or cancel without blocking the development launcher. */
import {afterEach, describe, expect, mock, spyOn, test} from 'bun:test';

import {getCACertificates} from 'node:tls';

import checkWebServer from '../../scripts/utils/checkWebServer';

describe('public web server readiness', () => {
    afterEach(() => mock.restore());

    test.each([new DOMException('Probe timed out', 'TimeoutError'), new TypeError('Connection refused'), new Error('Certificate verification failed')])(
        'treats fetch failures as an unsuccessful probe: %s',
        async (error) => {
            // Given a listener that is starting up, unresponsive, or has an untrusted certificate
            const get = spyOn(globalThis, 'fetch').mockRejectedValue(error);
            const signal = new AbortController().signal;
            // When the launcher probes the public origin
            const isReady = await checkWebServer('https://dev.new.expensify.com:8082', true, signal);
            // Then it can retry, verifying TLS against the OS trust store that `npm run setup-https` adds the mkcert CA to
            expect(isReady).toBe(false);
            const [url, init] = get.mock.calls.at(0) ?? [];
            expect(url).toBe('https://dev.new.expensify.com:8082');
            expect(init).toMatchObject({tls: {ca: getCACertificates('system')}});
            expect(init?.signal).toBeInstanceOf(AbortSignal);
        },
    );

    test('cancels an outstanding probe when the launcher stops', async () => {
        // Given a probe waiting for its response
        const waitingFetch = Object.assign(
            (_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) =>
                new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {once: true});
                }),
            {preconnect: fetch.preconnect},
        );
        spyOn(globalThis, 'fetch').mockImplementation(waitingFetch);
        const controller = new AbortController();
        const result = checkWebServer('https://dev.new.expensify.com:8082', true, controller.signal);
        // When the session is stopped
        controller.abort();
        // Then readiness finishes without waiting for the timeout
        await expect(result).resolves.toBe(false);
    });

    test('times out a real listener that does not return response headers', async () => {
        // Given a real local server that cannot finish its first response yet
        const server = Bun.serve({
            hostname: '127.0.0.1',
            port: 0,
            fetch: () => new Promise<Response>(() => {}),
        });
        try {
            // When the launcher probes it without an external cancellation
            const result = checkWebServer(server.url.href, false, new AbortController().signal);
            // Then the built-in request timeout releases the probe rather than hanging startup
            await expect(result).resolves.toBe(false);
        } finally {
            await server.stop(true);
        }
    });

    test.each([
        {status: 200, hasCSP: true, isWorkerEnabled: true, isReady: true},
        {status: 200, hasCSP: false, isWorkerEnabled: true, isReady: false},
        {status: 503, hasCSP: true, isWorkerEnabled: true, isReady: false},
        {status: 200, hasCSP: false, isWorkerEnabled: false, isReady: true},
    ])('requires a usable response from the selected public listener: %j', async ({status, hasCSP, isWorkerEnabled, isReady}) => {
        // Given either the direct server or the Worker listener
        const headers = new Headers();
        if (hasCSP) {
            headers.set('Content-Security-Policy', "default-src 'self'");
        }
        const response = new Response('app shell', {status, headers});
        spyOn(globalThis, 'fetch').mockResolvedValue(response);
        // When the listener returns its response
        const isServerReady = await checkWebServer('https://dev.new.expensify.com:8082', isWorkerEnabled, new AbortController().signal);
        // Then only a successful response with the expected Worker headers can open the browser
        expect(isServerReady).toBe(isReady);
        expect(response.bodyUsed).toBe(true);
    });
});
