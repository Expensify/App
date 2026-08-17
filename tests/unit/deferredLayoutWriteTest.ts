import {
    abandonDeferredWrite,
    deferOrExecuteWrite,
    flushDeferredWrite,
    getOptimisticWatchKey,
    getRegistrationPromiseForReport,
    isLayoutPending,
    isLayoutPendingForReport,
    isWritePending,
    isWritePendingForReport,
    registerDeferredWrite,
    reserveDeferredWriteChannel,
    resetForTesting,
} from '@libs/deferredLayoutWrite';

import CONST from '@src/CONST';

import {AppState} from 'react-native';

beforeEach(() => {
    jest.useFakeTimers();
    resetForTesting();
});

afterEach(() => {
    resetForTesting();
    jest.useRealTimers();
});

describe('deferredLayoutWrite', () => {
    it('registers and flushes a deferred write', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback);

        expect(isLayoutPending('test')).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        flushDeferredWrite('test');

        expect(callback).toHaveBeenCalledTimes(1);
        expect(isLayoutPending('test')).toBe(false);
    });

    it('fires the safety timeout when not flushed', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback, {safetyTimeoutMs: 3000});

        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(3000);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(isLayoutPending('test')).toBe(false);
    });

    it('does not double-fire after flush + timeout', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback, {safetyTimeoutMs: 3000});

        flushDeferredWrite('test');
        jest.advanceTimersByTime(3000);

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('flushes the previous write when overwriting with a new one', () => {
        const first = jest.fn();
        const second = jest.fn();

        registerDeferredWrite('test', first);
        registerDeferredWrite('test', second);

        expect(first).toHaveBeenCalledTimes(1);
        expect(second).not.toHaveBeenCalled();

        flushDeferredWrite('test');
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('abandons a reserved write without executing it', () => {
        reserveDeferredWriteChannel('test');

        abandonDeferredWrite('test');

        expect(isWritePending('test')).toBe(false);

        jest.advanceTimersByTime(5000);
    });

    it('does not abandon an already-registered write', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback, {safetyTimeoutMs: 3000});

        abandonDeferredWrite('test');

        expect(callback).not.toHaveBeenCalled();
        expect(isWritePending('test')).toBe(true);

        jest.advanceTimersByTime(3000);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('returns the optimisticWatchKey when registered', () => {
        registerDeferredWrite('test', jest.fn(), {optimisticWatchKey: 'transactions_123'});

        expect(getOptimisticWatchKey('test')).toBe('transactions_123');

        flushDeferredWrite('test');
        expect(getOptimisticWatchKey('test')).toBeUndefined();
    });

    it('returns undefined/false for unknown keys', () => {
        expect(isLayoutPending('unknown')).toBe(false);
        expect(isWritePending('unknown')).toBe(false);
        expect(getOptimisticWatchKey('unknown')).toBeUndefined();
    });

    it('is a no-op when flushing or abandoning an unknown key', () => {
        expect(() => flushDeferredWrite('unknown')).not.toThrow();
        expect(() => abandonDeferredWrite('unknown')).not.toThrow();
    });

    it('flushes all pending writes when the app goes to background', () => {
        const callbackA = jest.fn();
        const callbackB = jest.fn();

        registerDeferredWrite('a', callbackA);
        registerDeferredWrite('b', callbackB);

        expect(callbackA).not.toHaveBeenCalled();
        expect(callbackB).not.toHaveBeenCalled();

        AppState.emitCurrentTestState('background');

        expect(callbackA).toHaveBeenCalledTimes(1);
        expect(callbackB).toHaveBeenCalledTimes(1);
        expect(isWritePending('a')).toBe(false);
        expect(isWritePending('b')).toBe(false);
    });

    it('does not abandon a still-reserved write when the app goes to background: the wait must survive a resumed rAF', async () => {
        reserveDeferredWriteChannel('test', {destinationReportID: 'report-A'});
        const promise = getRegistrationPromiseForReport('test', 'report-A');

        AppState.emitCurrentTestState('background');

        // Still reserved and still unresolved - backgrounding only pauses whatever is waiting to
        // register (e.g. a throttled rAF), which still fires on resume. Abandoning here would
        // resolve a submit-waiter before that write actually lands.
        expect(isWritePending('test')).toBe(true);
        let resolved = false;
        promise?.then(() => {
            resolved = true;
        });
        await Promise.resolve();
        expect(resolved).toBe(false);
    });

    it('marks flushRequested (not abandon) for a reserved write when the app goes to background', () => {
        reserveDeferredWriteChannel('test');

        AppState.emitCurrentTestState('background');

        expect(isWritePending('test')).toBe(true);

        const callback = jest.fn();
        registerDeferredWrite('test', callback);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not flush writes when the app returns to active state', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback);

        AppState.emitCurrentTestState('active');

        expect(callback).not.toHaveBeenCalled();
        expect(isLayoutPending('test')).toBe(true);

        flushDeferredWrite('test');
    });

    it('marks a reserved channel as flushRequested instead of consuming it', () => {
        reserveDeferredWriteChannel('test');
        expect(isLayoutPending('test')).toBe(true);

        flushDeferredWrite('test');

        expect(isWritePending('test')).toBe(true);
    });

    it('executes the real callback immediately when registering on a flush-requested reservation', () => {
        reserveDeferredWriteChannel('test');
        flushDeferredWrite('test');

        const callback = jest.fn();
        registerDeferredWrite('test', callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(isWritePending('test')).toBe(false);
    });

    it('preserves optimisticWatchKey when flush-requested reservation is consumed', () => {
        reserveDeferredWriteChannel('test');
        flushDeferredWrite('test');

        const callback = jest.fn();
        registerDeferredWrite('test', callback, {optimisticWatchKey: 'transactions_123'});

        expect(callback).toHaveBeenCalledTimes(1);
        expect(isWritePending('test')).toBe(false);
        expect(getOptimisticWatchKey('test')).toBe('transactions_123');
    });

    it('defers the real callback normally when registering on a reservation that was not flushed', () => {
        reserveDeferredWriteChannel('test');

        const callback = jest.fn();
        registerDeferredWrite('test', callback);

        expect(callback).not.toHaveBeenCalled();
        expect(isLayoutPending('test')).toBe(true);

        flushDeferredWrite('test');
        expect(callback).toHaveBeenCalledTimes(1);
    });

    describe('single-record state machine (reserve -> stale -> register/abandon)', () => {
        it('1. reserve, timeout, late register: still scoped, promise resolves, write queued', async () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});
            const promise = getRegistrationPromiseForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A');
            expect(promise).toBeDefined();

            jest.advanceTimersByTime(5000);
            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A')).toBe(false);
            expect(isWritePendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A')).toBe(true);

            const callback = jest.fn();
            registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, callback, {destinationReportID: 'report-A'});

            await expect(promise).resolves.toBeUndefined();
            expect(isWritePendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A')).toBe(true);
            expect(callback).not.toHaveBeenCalled();
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('2. reserve(A) goes stale, then reserve(B) on the same key re-arms rather than no-ops', () => {
            reserveDeferredWriteChannel('test', {destinationReportID: 'report-A'});
            const promiseA = getRegistrationPromiseForReport('test', 'report-A');
            jest.advanceTimersByTime(5000);
            expect(isLayoutPending('test')).toBe(false);

            reserveDeferredWriteChannel('test', {destinationReportID: 'report-B'});
            // Re-arm keeps the original (A's) reservation record and its registration promise -
            // it does not silently reassign ownership to B.
            expect(isLayoutPendingForReport('test', 'report-A')).toBe(true);
            expect(isLayoutPendingForReport('test', 'report-B')).toBe(false);
            expect(getRegistrationPromiseForReport('test', 'report-A')).toBe(promiseA);

            // The re-armed safety timeout is a fresh 5s window, not already-expired.
            jest.advanceTimersByTime(4999);
            expect(isLayoutPending('test')).toBe(true);
            jest.advanceTimersByTime(1);
            expect(isLayoutPending('test')).toBe(false);
        });

        it('3. reserve(A), timeout, register scoped to B: B runs immediately, A untouched and still pending', () => {
            reserveDeferredWriteChannel('test', {destinationReportID: 'report-A'});
            jest.advanceTimersByTime(5000);

            const callbackB = jest.fn();
            registerDeferredWrite('test', callbackB, {destinationReportID: 'report-B'});

            expect(callbackB).toHaveBeenCalledTimes(1);
            expect(isWritePendingForReport('test', 'report-A')).toBe(true);
            expect(isWritePendingForReport('test', 'report-B')).toBe(false);
        });

        it('4. reserve, timeout, deferOrExecuteWrite still routes through registerDeferredWrite', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            jest.advanceTimersByTime(5000);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false});

            expect(apiWrite).not.toHaveBeenCalled();
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(apiWrite).toHaveBeenCalledTimes(1);
        });

        it('5. abandon after the safety timeout already ran still resolves the registration promise', async () => {
            reserveDeferredWriteChannel('test', {destinationReportID: 'report-A'});
            const promise = getRegistrationPromiseForReport('test', 'report-A');
            jest.advanceTimersByTime(5000);

            abandonDeferredWrite('test');

            await expect(promise).resolves.toBeUndefined();
            expect(isWritePending('test')).toBe(false);
        });

        it('6. isLayoutPending goes false after the timeout while isWritePending stays true', () => {
            reserveDeferredWriteChannel('test');
            jest.advanceTimersByTime(5000);

            expect(isLayoutPending('test')).toBe(false);
            expect(isWritePending('test')).toBe(true);
        });

        it('7. stale + flushRequested: late register executes immediately (span-safe latency fix)', () => {
            reserveDeferredWriteChannel('test');
            jest.advanceTimersByTime(5000);
            flushDeferredWrite('test');

            const callback = jest.fn();
            registerDeferredWrite('test', callback);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('8. stale without flushRequested: late register still defers (must NOT run immediately)', () => {
            reserveDeferredWriteChannel('test');
            jest.advanceTimersByTime(5000);

            const callback = jest.fn();
            registerDeferredWrite('test', callback);

            expect(callback).not.toHaveBeenCalled();
            flushDeferredWrite('test');
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('deferOrExecuteWrite', () => {
        it('defers to Search channel when shouldDeferForSearch is true', () => {
            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: true, optimisticWatchKey: 'transactions_123'});

            expect(apiWrite).not.toHaveBeenCalled();
            expect(isLayoutPending(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(true);
            expect(getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe('transactions_123');

            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            expect(apiWrite).toHaveBeenCalledTimes(1);
        });

        it('defers to DISMISS_MODAL channel when a reservation exists', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false, optimisticWatchKey: 'transactions_456'});

            expect(apiWrite).not.toHaveBeenCalled();
            expect(isWritePending(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBe(true);

            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(apiWrite).toHaveBeenCalledTimes(1);
        });

        it('executes immediately when no defer conditions are met', () => {
            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false});

            expect(apiWrite).toHaveBeenCalledTimes(1);
        });

        it('Search takes priority over DISMISS_MODAL when both conditions are true', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: true});

            expect(isLayoutPending(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)).toBe(true);
            expect(apiWrite).not.toHaveBeenCalled();

            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            expect(apiWrite).toHaveBeenCalledTimes(1);
        });

        it('skips DISMISS_MODAL deferral when isRetry is true', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false, isRetry: true});

            expect(apiWrite).toHaveBeenCalledTimes(1);
        });

        it('defaults isRetry to false (defers to DISMISS_MODAL)', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false});

            expect(apiWrite).not.toHaveBeenCalled();
            expect(isWritePending(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBe(true);
        });
    });

    describe('DISMISS_MODAL channel lifecycle', () => {
        it('reserve -> flush-while-reserved -> register executes immediately', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false});

            expect(apiWrite).toHaveBeenCalledTimes(1);
            expect(isWritePending(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBe(false);
        });

        it('reserve -> register -> flush executes on flush', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false});
            expect(apiWrite).not.toHaveBeenCalled();

            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(apiWrite).toHaveBeenCalledTimes(1);
        });

        it('safety timeout fires if channel is never flushed', () => {
            // deferOrExecuteWrite immediately registers on top of the reservation here, so this
            // exercises the registered record's own fresh safety timeout, not the reservation's -
            // see the "stale reservation" cases above for that one.
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false});

            jest.advanceTimersByTime(5000);
            expect(apiWrite).toHaveBeenCalledTimes(1);
            expect(isWritePending(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)).toBe(false);
        });

        it('second flush is a no-op after the channel was already consumed', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false});

            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(apiWrite).toHaveBeenCalledTimes(1);

            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(apiWrite).toHaveBeenCalledTimes(1);
        });
    });

    describe('isLayoutPendingForReport / isWritePendingForReport', () => {
        it('return false when no record exists', () => {
            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-1')).toBe(false);
            expect(isWritePendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-1')).toBe(false);
        });

        it('return false when the reservation has no destination', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-1')).toBe(false);
            expect(isWritePendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-1')).toBe(false);
        });

        it('return true only when destination matches the queried report', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});

            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A')).toBe(true);
            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-B')).toBe(false);
        });

        it('return false when reportID arg is undefined', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});
            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, undefined)).toBe(false);
            expect(isWritePendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, undefined)).toBe(false);
        });

        it('preserve the destination across reserve -> register handoff', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});

            const apiWrite = jest.fn();
            deferOrExecuteWrite(apiWrite, {shouldDeferForSearch: false});

            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A')).toBe(true);
            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-B')).toBe(false);

            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(isWritePendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A')).toBe(false);
        });

        it('isWritePendingForReport stays true after the layout goes stale', () => {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID: 'report-A'});
            jest.advanceTimersByTime(5000);

            expect(isLayoutPendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A')).toBe(false);
            expect(isWritePendingForReport(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, 'report-A')).toBe(true);
        });
    });
});
