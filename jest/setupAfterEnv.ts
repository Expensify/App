import '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

jest.useRealTimers();

// Under Jest, any Node.js timer (setTimeout/setInterval) still active when a worker finishes
// its assigned tests can prevent the worker from exiting gracefully, producing the CI warning:
//   "A worker process has failed to exit gracefully ... ensure that .unref() was called on them."
// We can't fix every test/module individually, and tests never rely on timers to keep the event
// loop alive (awaited promises and microtasks do that). So we patch global.setTimeout/setInterval
// to auto-unref every returned Timer. This only affects whether a timer keeps the event loop
// alive; it does NOT prevent callbacks from firing while the loop is running.
(() => {
    type TimerCandidate = {unref?: () => unknown};
    const maybeUnref = (timer: unknown): unknown => {
        if (timer && typeof (timer as TimerCandidate).unref === 'function') {
            (timer as TimerCandidate).unref!();
        }
        return timer;
    };

    const originalSetTimeout = global.setTimeout;
    const originalSetInterval = global.setInterval;
    const originalSetImmediate = global.setImmediate;

    // Preserve any static properties (e.g. __promisify__) by reusing the original function object.
    const wrappedSetTimeout = ((...args: Parameters<typeof originalSetTimeout>) => maybeUnref(originalSetTimeout.apply(global, args))) as unknown as typeof originalSetTimeout;
    const wrappedSetInterval = ((...args: Parameters<typeof originalSetInterval>) => maybeUnref(originalSetInterval.apply(global, args))) as unknown as typeof originalSetInterval;
    const wrappedSetImmediate = ((...args: Parameters<typeof originalSetImmediate>) => maybeUnref(originalSetImmediate.apply(global, args))) as unknown as typeof originalSetImmediate;

    Object.assign(wrappedSetTimeout, originalSetTimeout);
    Object.assign(wrappedSetInterval, originalSetInterval);
    Object.assign(wrappedSetImmediate, originalSetImmediate);

    global.setTimeout = wrappedSetTimeout;
    global.setInterval = wrappedSetInterval;
    global.setImmediate = wrappedSetImmediate;
})();

// This mock must live in setupAfterEnv (not setupFiles) because @shopify/flash-list/jestSetup,
// imported in setup.ts, registers its own measureLayout mock. Placing ours here ensures it
// runs after FlashList's setup and takes precedence.
jest.mock(
    '@shopify/flash-list/dist/recyclerview/utils/measureLayout',
    () =>
        ({
            ...jest.requireActual('@shopify/flash-list/dist/recyclerview/utils/measureLayout'),
            measureParentSize: jest.fn().mockImplementation(() => ({
                x: 0,
                y: 0,
                width: 300,
                height: 400,
            })),
            measureFirstChildLayout: jest.fn().mockImplementation(() => ({
                x: 0,
                y: 0,
                width: 300,
                height: 400,
            })),
            measureItemLayout: jest.fn().mockImplementation(() => ({
                x: 0,
                y: 0,
                width: 300,
                height: 75,
            })),
        }) as Record<string, unknown>,
);

// Auto-initialize Onyx for tests.
// Tests that already call Onyx.init() in their own beforeAll will safely re-configure Onyx —
// the second init() just re-runs initStoreValues and re-resolves the already-resolved deferred task.
beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

// After every test file, unref any still-active Node timers. We don't clear them — tests that
// actually test timer behaviour already handle their own cleanup — but we make sure no leaked
// module-level interval (e.g. Network's processMainQueue interval, pingPusher, etc.) keeps the
// jest worker alive past the last test. This addresses the CI warning:
//   "A worker process has failed to exit gracefully ... ensure that .unref() was called on them."
afterAll(() => {
    // _getActiveHandles is a private Node.js API but the only reliable way to enumerate timers.
    const getHandles = (process as unknown as {_getActiveHandles?: () => unknown[]})._getActiveHandles;
    if (typeof getHandles !== 'function') {
        return;
    }
    for (const handle of getHandles.call(process)) {
        const ctor = (handle as {constructor?: {name?: string}})?.constructor?.name;
        if (ctor !== 'Timeout' && ctor !== 'Immediate') {
            continue;
        }
        const unref = (handle as {unref?: () => void}).unref;
        if (typeof unref === 'function') {
            unref.call(handle);
        }
    }
});
