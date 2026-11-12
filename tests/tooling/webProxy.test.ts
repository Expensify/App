/** Exercises the development API proxy against a local upstream, including failed connections. */
import {afterAll, beforeAll, describe, expect, mock, test} from 'bun:test';

import type {RequestOptions} from 'https';

import {once} from 'events';
import http from 'http';

const createServer = http.createServer;
const request = http.request;
let upstream: http.Server;
let proxy: http.Server | undefined;
let origin: string;
let receivedUserAgent: string | string[] | undefined;

beforeAll(async () => {
    upstream = createServer((incoming, response) => {
        if (incoming.url === '/reset') {
            incoming.socket.destroy();
            return;
        }
        receivedUserAgent = incoming.headers['user-agent'];
        response.end('upstream-ok');
    });
    upstream.listen(0, '127.0.0.1');
    await once(upstream, 'listening');
    const upstreamAddress = upstream.address();
    if (!upstreamAddress || typeof upstreamAddress === 'string') {
        throw new Error('The local upstream must listen on a TCP port.');
    }

    const captureServer = (listener: http.RequestListener) => {
        proxy = createServer(listener);
        return proxy;
    };
    mock.module('http', () => ({default: {createServer: captureServer}, createServer: captureServer}));
    const forwardLocally = (options: RequestOptions) => request({...options, protocol: 'http:', hostname: '127.0.0.1', port: upstreamAddress.port});
    mock.module('https', () => ({default: {request: forwardLocally}, request: forwardLocally}));
    mock.module('../../web/cloudflare-worker/src/developmentAPIProxy', () => ({API_PROXY_PORT: 0}));
    // The proxy has its own listener; use an ephemeral port without changing another dev session.
    process.env.USE_WEB_PROXY = 'true';
    await import('../../web/proxy');
    if (!proxy) {
        throw new Error('The development API proxy did not start.');
    }
    if (!proxy.listening) {
        await once(proxy, 'listening');
    }
    const address = proxy.address();
    if (!address || typeof address === 'string') {
        throw new Error('The development API proxy must listen on a TCP port.');
    }
    origin = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
    for (const server of [proxy, upstream]) {
        if (!server) {
            continue;
        }
        server.closeAllConnections();
        await new Promise<void>((resolve) => {
            server.close(() => resolve());
        });
    }
    mock.restore();
});

describe('web API proxy', () => {
    test('identifies the proxy instead of forwarding the browser identity', async () => {
        // Given a browser identity that must not describe the proxy connection to the backend.
        const browserUserAgent = 'test-browser/1.0';

        // When a real request passes through the proxy to a working local upstream.
        const response = await fetch(`${origin}/api/Ping`, {headers: new Headers([['User-Agent', browserUserAgent]]), signal: AbortSignal.timeout(1000)});

        // Then the proxy identifies itself and preserves the successful response.
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('upstream-ok');
        expect(receivedUserAgent).toBe('Development-NewDot/1.0');
    });

    test('finishes the downstream response when the upstream connection resets', async () => {
        // Given an upstream that closes its socket before sending response headers.
        const url = `${origin}/reset`;

        // When the browser requests a response through the real proxy handler.
        const response = await fetch(url, {signal: AbortSignal.timeout(1000)});

        // Then it receives a gateway error instead of waiting indefinitely.
        expect(response.status).toBe(502);
        expect(await response.text()).toBe('');
    });
});
