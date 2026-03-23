import {getDBTimeWithSkew, getIsOffline, getLastOfflineAt, onReachabilityConfirmed, setForceOffline, setHasRadio, setSustainedFailures, subscribe} from '@src/libs/NetworkState';

// Log triggers a circular dep chain (NetworkState → Log → Network → SequentialQueue → NetworkState.subscribe())
// that causes the listeners Set to be undefined during module init. Mock Log to break the cycle.
jest.mock('@src/libs/Log');

describe('NetworkState', () => {
    beforeEach(() => {
        setHasRadio(true);
        setSustainedFailures(false);
        setForceOffline(false);
    });

    describe('getIsOffline — state computation', () => {
        test('returns false when all flags are default', () => {
            expect(getIsOffline()).toBe(false);
        });

        test('returns true when radio is off', () => {
            setHasRadio(false);
            expect(getIsOffline()).toBe(true);
        });

        test('returns true when sustained failures are active', () => {
            setSustainedFailures(true);
            expect(getIsOffline()).toBe(true);
        });

        test('returns true when force offline is set', () => {
            setForceOffline(true);
            expect(getIsOffline()).toBe(true);
        });

        test('returns true when multiple flags are active', () => {
            setHasRadio(false);
            setSustainedFailures(true);
            expect(getIsOffline()).toBe(true);
        });

        test('returns false after clearing the only active flag', () => {
            setHasRadio(false);
            expect(getIsOffline()).toBe(true);

            setHasRadio(true);
            expect(getIsOffline()).toBe(false);
        });
    });

    describe('subscribe — listener pattern', () => {
        test('listener is called on state change', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setHasRadio(false);
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        test('multiple listeners all get called', () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            const unsub1 = subscribe(listener1);
            const unsub2 = subscribe(listener2);

            setHasRadio(false);
            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);

            unsub1();
            unsub2();
        });

        test('unsubscribe removes the listener', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            unsubscribe();

            setHasRadio(false);
            expect(listener).not.toHaveBeenCalled();
        });

        test('listener is not called when state does not change', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            // hasRadio is already true, setting to true again should be a no-op
            setHasRadio(true);
            expect(listener).not.toHaveBeenCalled();

            unsubscribe();
        });
    });

    describe('lastOfflineAt tracking', () => {
        test('returns undefined when online', () => {
            expect(getLastOfflineAt()).toBeUndefined();
        });

        test('returns an ISO timestamp when offline', () => {
            setHasRadio(false);
            const lastOfflineAt = getLastOfflineAt();
            expect(lastOfflineAt).toBeDefined();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarded by toBeDefined() above
            expect(new Date(lastOfflineAt!).toISOString()).toBe(lastOfflineAt);
        });

        test('is cleared when going back online', () => {
            setHasRadio(false);
            expect(getLastOfflineAt()).toBeDefined();

            setHasRadio(true);
            expect(getLastOfflineAt()).toBeUndefined();
        });

        test('timestamp does not change on subsequent offline triggers', () => {
            setHasRadio(false);
            const firstTimestamp = getLastOfflineAt();

            // Adding another offline trigger should not change the timestamp
            setSustainedFailures(true);
            expect(getLastOfflineAt()).toBe(firstTimestamp);
        });
    });

    describe('setHasRadio — transitions', () => {
        test('true to false triggers listener', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setHasRadio(false);
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        test('false to true triggers listener', () => {
            setHasRadio(false);

            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setHasRadio(true);
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        test('true to true does not trigger listener', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setHasRadio(true);
            expect(listener).not.toHaveBeenCalled();

            unsubscribe();
        });

        test('false to false does not trigger listener', () => {
            setHasRadio(false);

            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setHasRadio(false);
            expect(listener).not.toHaveBeenCalled();

            unsubscribe();
        });
    });

    describe('setSustainedFailures — transitions', () => {
        test('false to true triggers listener', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setSustainedFailures(true);
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        test('true to false triggers listener', () => {
            setSustainedFailures(true);

            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setSustainedFailures(false);
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        test('false to false does not trigger listener', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setSustainedFailures(false);
            expect(listener).not.toHaveBeenCalled();

            unsubscribe();
        });

        test('true to true does not trigger listener', () => {
            setSustainedFailures(true);

            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setSustainedFailures(true);
            expect(listener).not.toHaveBeenCalled();

            unsubscribe();
        });
    });

    describe('setForceOffline', () => {
        test('makes getIsOffline return true', () => {
            setForceOffline(true);
            expect(getIsOffline()).toBe(true);
        });

        test('clearing it restores online state', () => {
            setForceOffline(true);
            expect(getIsOffline()).toBe(true);

            setForceOffline(false);
            expect(getIsOffline()).toBe(false);
        });

        test('always triggers listener', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            setForceOffline(true);
            expect(listener).toHaveBeenCalledTimes(1);

            listener.mockClear();
            setForceOffline(false);
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });
    });

    describe('getDBTimeWithSkew', () => {
        test('returns a valid DB time string with no skew', () => {
            const result = getDBTimeWithSkew();
            // DB time format: YYYY-MM-DD HH:MM:SS.SSS
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
        });
    });

    describe('onReachabilityConfirmed — reconnect listener isolation', () => {
        // onReachabilityRestored() is internal and only called by the NetInfo listener
        // when isInternetReachable transitions from false→true. These tests verify that
        // the reconnect listeners are properly isolated — they should NOT fire from
        // state changes through the public setters (setHasRadio, setSustainedFailures).

        test('reconnect listener is not called by setHasRadio offline→online transition', () => {
            const reconnectListener = jest.fn();
            const unsubscribe = onReachabilityConfirmed(reconnectListener);

            setHasRadio(false);
            setHasRadio(true);
            expect(reconnectListener).not.toHaveBeenCalled();

            unsubscribe();
        });

        test('reconnect listener IS called when sustained failures clear (backend outage recovery)', () => {
            const reconnectListener = jest.fn();
            const unsubscribe = onReachabilityConfirmed(reconnectListener);

            setSustainedFailures(true);
            setSustainedFailures(false);
            // A successful request proved connectivity — reconnect to backfill missed Onyx updates.
            // Without this, a backend outage recovery (where NetInfo never transitions false→true)
            // would leave the UI online but stale.
            expect(reconnectListener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        test('reconnect listener is not called by setForceOffline clearing', () => {
            const reconnectListener = jest.fn();
            const unsubscribe = onReachabilityConfirmed(reconnectListener);

            setForceOffline(true);
            setForceOffline(false);
            expect(reconnectListener).not.toHaveBeenCalled();

            unsubscribe();
        });

        test('unsubscribe removes reconnect listener', () => {
            const reconnectListener = jest.fn();
            const unsubscribe = onReachabilityConfirmed(reconnectListener);

            unsubscribe();

            // Even if onReachabilityRestored somehow fired, unsubscribed listener should not be called
            setHasRadio(false);
            setHasRadio(true);
            expect(reconnectListener).not.toHaveBeenCalled();
        });
    });
});
