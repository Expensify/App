import CONST from '@src/CONST';
import {getFailureCount, onSustainedFailureChange, recordFailure, recordSuccess, reset, resetCounters} from '@src/libs/FailureTracker';

describe('FailureTracker', () => {
    beforeEach(() => {
        reset();
    });

    test('recordSuccess resets failure count', () => {
        recordFailure();
        recordFailure();
        expect(getFailureCount()).toBe(2);

        recordSuccess();
        expect(getFailureCount()).toBe(0);
    });

    test('does not trigger sustained failure before count threshold', () => {
        const listener = jest.fn();
        const unsubscribe = onSustainedFailureChange(listener);

        // Record failures below the threshold count
        for (let i = 0; i < CONST.NETWORK.SUSTAINED_FAILURE_THRESHOLD_COUNT - 1; i++) {
            recordFailure();
        }

        expect(listener).not.toHaveBeenCalledWith(true);
        unsubscribe();
    });

    test('does not trigger sustained failure before time threshold', () => {
        const listener = jest.fn();
        const unsubscribe = onSustainedFailureChange(listener);

        // Record enough failures but within the time window
        for (let i = 0; i < CONST.NETWORK.SUSTAINED_FAILURE_THRESHOLD_COUNT; i++) {
            recordFailure();
        }

        // All failures happened instantly (elapsed ~0ms), so time threshold is not met
        expect(listener).not.toHaveBeenCalledWith(true);
        unsubscribe();
    });

    test('triggers sustained failure when both thresholds are met', () => {
        jest.useFakeTimers();
        const listener = jest.fn();
        const unsubscribe = onSustainedFailureChange(listener);

        // Record failures up to count threshold - 1
        for (let i = 0; i < CONST.NETWORK.SUSTAINED_FAILURE_THRESHOLD_COUNT - 1; i++) {
            recordFailure();
        }

        // Advance time past the window threshold
        jest.advanceTimersByTime(CONST.NETWORK.SUSTAINED_FAILURE_WINDOW_MS + 1);

        // One more failure should trigger sustained failures
        recordFailure();
        expect(listener).toHaveBeenCalledWith(true);

        unsubscribe();
        jest.useRealTimers();
    });

    test('recordSuccess clears sustained failure', () => {
        jest.useFakeTimers();
        const listener = jest.fn();
        const unsubscribe = onSustainedFailureChange(listener);

        // Trigger sustained failure
        for (let i = 0; i < CONST.NETWORK.SUSTAINED_FAILURE_THRESHOLD_COUNT - 1; i++) {
            recordFailure();
        }
        jest.advanceTimersByTime(CONST.NETWORK.SUSTAINED_FAILURE_WINDOW_MS + 1);
        recordFailure();
        expect(listener).toHaveBeenCalledWith(true);

        // Success should clear it
        recordSuccess();
        expect(listener).toHaveBeenCalledWith(false);

        unsubscribe();
        jest.useRealTimers();
    });

    test('resetCounters clears failure count without notifying listeners', () => {
        const listener = jest.fn();
        const unsubscribe = onSustainedFailureChange(listener);

        recordFailure();
        recordFailure();
        expect(getFailureCount()).toBe(2);

        listener.mockClear();
        resetCounters();

        expect(getFailureCount()).toBe(0);
        // resetCounters should NOT call listeners — it only resets the counters
        expect(listener).not.toHaveBeenCalled();

        unsubscribe();
    });

    test('after resetCounters, sustained failure requires fresh threshold', () => {
        jest.useFakeTimers();
        const listener = jest.fn();
        const unsubscribe = onSustainedFailureChange(listener);

        // Build up failures close to threshold
        for (let i = 0; i < CONST.NETWORK.SUSTAINED_FAILURE_THRESHOLD_COUNT - 1; i++) {
            recordFailure();
        }
        jest.advanceTimersByTime(CONST.NETWORK.SUSTAINED_FAILURE_WINDOW_MS + 1);

        // Reset counters (simulating reachability restored)
        resetCounters();
        listener.mockClear();

        // One failure after reset should NOT trigger sustained failure
        recordFailure();
        expect(listener).not.toHaveBeenCalledWith(true);

        unsubscribe();
        jest.useRealTimers();
    });

    test('unsubscribe removes listener', () => {
        const listener = jest.fn();
        const unsubscribe = onSustainedFailureChange(listener);

        unsubscribe();

        // Trigger a success — listener should not be called
        recordFailure();
        recordSuccess();
        expect(listener).not.toHaveBeenCalled();
    });
});
