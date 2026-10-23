/** The launcher should wait for the public listener as long as the session runs, without stopping it on a slow start. */
import {afterEach, describe, expect, mock, setSystemTime, spyOn, test} from 'bun:test';

import waitForPublicWebServer from '../../scripts/utils/waitForPublicWebServer';

function mockFetch(respond: () => Response) {
    spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async () => respond(), {preconnect: fetch.preconnect}));
}

describe('public web server startup', () => {
    afterEach(() => {
        setSystemTime();
        mock.restore();
    });

    test('keeps waiting past a slow first compile and reports the delay once', async () => {
        // Given a public listener that only becomes ready long after startup
        let requests = 0;
        mockFetch(() => {
            if (++requests === 2) {
                setSystemTime(new Date(Date.now() + 10 * 60_000));
            }
            return new Response('app shell', {status: requests < 5 ? 503 : 200});
        });
        const onSlow = mock(() => {});
        // When the launcher waits for it
        const isReady = await waitForPublicWebServer('https://dev.new.expensify.com:8082', false, new AbortController().signal, {interval: 1, onSlow});
        // Then the session is not stopped, and the delay is reported once rather than on every retry
        expect(isReady).toBe(true);
        expect(requests).toBe(5);
        expect(onSlow).toHaveBeenCalledTimes(1);
    });

    test('stops waiting without readiness when the session stops', async () => {
        // Given a listener that never becomes ready
        const controller = new AbortController();
        mockFetch(() => {
            controller.abort();
            return new Response(null, {status: 503});
        });
        // When the session is stopped
        // Then waiting ends without reporting the server as ready
        expect(await waitForPublicWebServer('https://dev.new.expensify.com:8082', false, controller.signal, {interval: 1})).toBe(false);
    });
});
