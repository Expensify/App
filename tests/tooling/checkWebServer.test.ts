import {afterEach, describe, expect, mock, spyOn, test} from 'bun:test';

/** A timed-out probe must not prevent the launcher from retrying or shutting down. */
import type {ClientRequest} from 'node:http';

import {EventEmitter} from 'node:events';
import {IncomingMessage} from 'node:http';
import https from 'node:https';
import {Socket} from 'node:net';

import checkWebServer from '../../scripts/utils/checkWebServer';

describe('public web server readiness', () => {
    afterEach(() => mock.restore());

    test('settles a timeout even when destroy emits no error', async () => {
        // Given Bun can destroy a timed-out request without emitting an error
        const request = Object.assign(new EventEmitter(), {destroy: mock(() => {})});
        // This fixture implements only the request events the readiness probe uses, without a real TLS connection.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const get = spyOn(https, 'get').mockReturnValue(request as unknown as ClientRequest);
        const ca = Buffer.from('test CA');
        const signal = new AbortController().signal;
        const result = checkWebServer('https://dev.new.expensify.com:8082', ca, true, signal);
        // When the first compilation takes longer than the probe timeout
        request.emit('timeout');
        // Then the launcher can retry and does not disable certificate checks
        await expect(result).resolves.toBe(false);
        expect(request.destroy).toHaveBeenCalledTimes(1);
        expect(get).toHaveBeenCalledWith('https://dev.new.expensify.com:8082', {ca, timeout: 2000, signal}, expect.any(Function));
    });

    test('settles connection errors so startup can retry or cancel', async () => {
        // Given a request created before the Worker starts listening
        const request = Object.assign(new EventEmitter(), {destroy: mock(() => {})});
        // This fixture deliberately contains only the event API used by the probe.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        spyOn(https, 'get').mockReturnValue(request as unknown as ClientRequest);
        const result = checkWebServer('https://dev.new.expensify.com:8082', Buffer.from('CA'), false, new AbortController().signal);
        // When the connection fails
        request.emit('error', new Error('Connection refused'));
        // Then it is a failed readiness probe, not an unhandled rejection or a pending promise
        await expect(result).resolves.toBe(false);
    });

    test.each([
        {status: 200, csp: true, worker: true, ready: true},
        {status: 200, csp: false, worker: true, ready: false},
        {status: 503, csp: true, worker: true, ready: false},
        {status: 200, csp: false, worker: false, ready: true},
    ])('requires a usable response from the selected public listener: %j', async ({status, csp, worker, ready}) => {
        // Given either the direct server or the Worker listener
        const request = Object.assign(new EventEmitter(), {destroy: mock(() => {})});
        // Only the client request event API is needed by this fixture.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const get = spyOn(https, 'get').mockReturnValue(request as unknown as ClientRequest);
        const result = checkWebServer('https://dev.new.expensify.com:8082', Buffer.from('CA'), worker, new AbortController().signal);
        const onResponse = get.mock.calls.at(0)?.[2];
        if (!onResponse) {
            throw new Error('Expected an HTTPS response callback');
        }
        const response = new IncomingMessage(new Socket());
        response.statusCode = status;
        response.headers = {};
        if (csp) {
            response.headers['content-security-policy'] = "default-src 'self'";
        }
        // When the listener returns its response
        onResponse(response);
        response.push(null);
        // Then only a successful response with the expected Worker headers can open the browser
        await expect(result).resolves.toBe(ready);
    });
});
