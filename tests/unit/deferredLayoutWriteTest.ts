import {AppState} from 'react-native';
import {cancelDeferredWrite, flushDeferredWrite, getOptimisticWatchKey, hasDeferredWrite, registerDeferredWrite, reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('deferredLayoutWrite', () => {
    it('registers and flushes a deferred write', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback);

        expect(hasDeferredWrite('test')).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        flushDeferredWrite('test');

        expect(callback).toHaveBeenCalledTimes(1);
        expect(hasDeferredWrite('test')).toBe(false);
    });

    it('fires the safety timeout when not flushed', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback, {safetyTimeoutMs: 3000});

        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(3000);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(hasDeferredWrite('test')).toBe(false);
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

    it('cancels a deferred write without executing it', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback, {safetyTimeoutMs: 3000});

        cancelDeferredWrite('test');

        expect(callback).not.toHaveBeenCalled();
        expect(hasDeferredWrite('test')).toBe(false);

        jest.advanceTimersByTime(3000);
        expect(callback).not.toHaveBeenCalled();
    });

    it('returns the optimisticWatchKey when registered', () => {
        registerDeferredWrite('test', jest.fn(), {optimisticWatchKey: 'transactions_123'});

        expect(getOptimisticWatchKey('test')).toBe('transactions_123');

        flushDeferredWrite('test');
        expect(getOptimisticWatchKey('test')).toBeUndefined();
    });

    it('returns undefined for hasDeferredWrite and getOptimisticWatchKey on unknown keys', () => {
        expect(hasDeferredWrite('unknown')).toBe(false);
        expect(getOptimisticWatchKey('unknown')).toBeUndefined();
    });

    it('is a no-op when flushing or cancelling an unknown key', () => {
        expect(() => flushDeferredWrite('unknown')).not.toThrow();
        expect(() => cancelDeferredWrite('unknown')).not.toThrow();
    });

    it('flushes all pending writes when the app goes to background', () => {
        const callbackA = jest.fn();
        const callbackB = jest.fn();

        registerDeferredWrite('a', callbackA);
        registerDeferredWrite('b', callbackB);

        expect(callbackA).not.toHaveBeenCalled();
        expect(callbackB).not.toHaveBeenCalled();

        (AppState as unknown as {emitCurrentTestState: (state: string) => void}).emitCurrentTestState('background');

        expect(callbackA).toHaveBeenCalledTimes(1);
        expect(callbackB).toHaveBeenCalledTimes(1);
        expect(hasDeferredWrite('a')).toBe(false);
        expect(hasDeferredWrite('b')).toBe(false);
    });

    it('does not flush writes when the app returns to active state', () => {
        const callback = jest.fn();
        registerDeferredWrite('test', callback);

        (AppState as unknown as {emitCurrentTestState: (state: string) => void}).emitCurrentTestState('active');

        expect(callback).not.toHaveBeenCalled();
        expect(hasDeferredWrite('test')).toBe(true);

        flushDeferredWrite('test');
    });

    it('marks a reserved channel as flushRequested instead of consuming it', () => {
        reserveDeferredWriteChannel('test');
        expect(hasDeferredWrite('test')).toBe(true);

        flushDeferredWrite('test');

        expect(hasDeferredWrite('test')).toBe(true);
    });

    it('executes the real callback immediately when registering on a flush-requested reservation', () => {
        reserveDeferredWriteChannel('test');
        flushDeferredWrite('test');

        const callback = jest.fn();
        registerDeferredWrite('test', callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(hasDeferredWrite('test')).toBe(false);
    });

    it('preserves optimisticWatchKey when flush-requested reservation is consumed', () => {
        reserveDeferredWriteChannel('test');
        flushDeferredWrite('test');

        const callback = jest.fn();
        registerDeferredWrite('test', callback, {optimisticWatchKey: 'transactions_123'});

        expect(callback).toHaveBeenCalledTimes(1);
        expect(hasDeferredWrite('test')).toBe(false);
        expect(getOptimisticWatchKey('test')).toBe('transactions_123');
    });

    it('defers the real callback normally when registering on a reservation that was not flushed', () => {
        reserveDeferredWriteChannel('test');

        const callback = jest.fn();
        registerDeferredWrite('test', callback);

        expect(callback).not.toHaveBeenCalled();
        expect(hasDeferredWrite('test')).toBe(true);

        flushDeferredWrite('test');
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
