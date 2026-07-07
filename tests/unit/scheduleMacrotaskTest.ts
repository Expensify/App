/**
 * scheduleMacrotask picks its implementation once, at import time, based on `process.env.NODE_ENV` and
 * whether `MessageChannel` exists. To exercise the MessageChannel branch we install a controllable fake
 * global MessageChannel, clear the test guard, and re-import the module in isolation so its import-time
 * selection re-runs under those conditions.
 */

import type {ScheduleMacrotask} from '@libs/scheduleMacrotask';

const mockLogAlert = jest.fn();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {alert: mockLogAlert},
}));

// A fake MessageChannel we fully control: `postMessage` records a pending delivery instead of hopping the
// event loop, and `deliver()` fires the registered handler — so the macrotask boundary is deterministic.
let deliveries: Array<() => void> = [];
let postCount = 0;

function createFakePort(postMessage: MessagePort['postMessage'] = () => {}): MessagePort {
    return {
        onmessage: null,
        onmessageerror: null,
        postMessage,
        close: () => {},
        start: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    };
}

class FakeMessageChannel implements MessageChannel {
    port1: MessagePort = createFakePort();

    port2: MessagePort = createFakePort(() => {
        postCount += 1;
        deliveries.push(() => {
            this.port1.onmessage?.(new MessageEvent('message'));
        });
    });
}

const deliver = () => {
    const pending = deliveries.splice(0);
    for (const run of pending) {
        run();
    }
};

const loadScheduler = (nodeEnv: string, messageChannelAvailable = true): ScheduleMacrotask => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalMessageChannel = global.MessageChannel;
    process.env.NODE_ENV = nodeEnv;
    if (messageChannelAvailable) {
        global.MessageChannel = FakeMessageChannel;
    } else {
        // Simulate an environment without MessageChannel (e.g. React Native).
        Reflect.deleteProperty(global, 'MessageChannel');
    }

    let scheduler: ScheduleMacrotask = () => {};
    jest.isolateModules(() => {
        scheduler = require<{default: ScheduleMacrotask}>('@libs/scheduleMacrotask').default;
    });

    process.env.NODE_ENV = originalNodeEnv;
    global.MessageChannel = originalMessageChannel;
    return scheduler;
};

describe('scheduleMacrotask', () => {
    beforeEach(() => {
        deliveries = [];
        postCount = 0;
        mockLogAlert.mockClear();
    });

    describe('setTimeout fallback', () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it('uses setTimeout (not MessageChannel) when NODE_ENV is test, and runs the callback on a macrotask', () => {
            const scheduleMacrotask = loadScheduler('test');
            const callback = jest.fn();

            scheduleMacrotask(callback);
            expect(callback).not.toHaveBeenCalled(); // not synchronous
            expect(postCount).toBe(0); // MessageChannel was not used

            jest.runOnlyPendingTimers();
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('uses setTimeout (not MessageChannel) when MessageChannel is not available, even outside the test env', () => {
            // NODE_ENV is not 'test' here, so the fallback is chosen purely because MessageChannel is absent.
            const scheduleMacrotask = loadScheduler('development', false);
            const callback = jest.fn();

            scheduleMacrotask(callback);
            expect(callback).not.toHaveBeenCalled(); // not synchronous
            expect(postCount).toBe(0); // there was no MessageChannel to use

            jest.runOnlyPendingTimers();
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('MessageChannel path', () => {
        it('does not run the callback synchronously', () => {
            const scheduleMacrotask = loadScheduler('development');
            const callback = jest.fn();

            scheduleMacrotask(callback);

            expect(callback).not.toHaveBeenCalled();
        });

        it('coalesces callbacks scheduled in one tick into a single postMessage and runs them FIFO', () => {
            const scheduleMacrotask = loadScheduler('development');
            const order: number[] = [];

            scheduleMacrotask(() => order.push(1));
            scheduleMacrotask(() => order.push(2));
            scheduleMacrotask(() => order.push(3));

            // One wake-up for the whole batch (the `queue.length === 1` guard).
            expect(postCount).toBe(1);
            expect(order).toEqual([]);

            deliver();
            expect(order).toEqual([1, 2, 3]);
        });

        it('re-arms for the next batch after a drain', () => {
            const scheduleMacrotask = loadScheduler('development');
            const callback = jest.fn();

            scheduleMacrotask(callback);
            deliver();
            expect(callback).toHaveBeenCalledTimes(1);
            expect(postCount).toBe(1);

            scheduleMacrotask(callback);
            expect(postCount).toBe(2); // posted again because the queue went empty -> non-empty
            deliver();
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('isolates a throwing task so sibling tasks queued in the same tick still run, and logs it', () => {
            const scheduleMacrotask = loadScheduler('development');
            const order: string[] = [];

            scheduleMacrotask(() => order.push('before'));
            scheduleMacrotask(() => {
                throw new Error('boom');
            });
            scheduleMacrotask(() => order.push('after'));

            deliver();

            // The throw did not abort the drain — sibling tasks still ran — and it was logged.
            expect(order).toEqual(['before', 'after']);
            expect(mockLogAlert).toHaveBeenCalledTimes(1);
        });

        it('defers a callback scheduled during a drain to the next tick', () => {
            const scheduleMacrotask = loadScheduler('development');
            const order: string[] = [];

            scheduleMacrotask(() => {
                order.push('first');
                scheduleMacrotask(() => order.push('reentrant'));
            });

            deliver();
            expect(order).toEqual(['first']); // the re-entrant task did not run in this drain
            expect(postCount).toBe(2); // ...it re-armed a fresh wake-up

            deliver();
            expect(order).toEqual(['first', 'reentrant']);
        });
    });
});
