import CONST from '@src/CONST';

let failureCount = 0;
let firstFailureTimestamp = 0;
const sustainedFailureListeners = new Set<(active: boolean) => void>();

/**
 * Register a listener for sustained failure state changes.
 * Called by NetworkState to wire up the hard stop trigger.
 */
function onSustainedFailureChange(listener: (active: boolean) => void): () => void {
    sustainedFailureListeners.add(listener);
    return () => sustainedFailureListeners.delete(listener);
}

/**
 * Record a successful request outcome.
 * Resets the failure tracker — one success proves connectivity.
 */
function recordSuccess() {
    if (failureCount === 0) {
        return;
    }

    console.debug(`[FailureTracker] Success after ${failureCount} failures — resetting tracker`);
    failureCount = 0;
    firstFailureTimestamp = 0;

    for (const cb of sustainedFailureListeners) {
        cb(false);
    }
}

/**
 * Record a failed request outcome.
 * If failures exceed the threshold (count AND time window), triggers sustained failure hard stop.
 */
function recordFailure() {
    const now = Date.now();

    if (failureCount === 0) {
        firstFailureTimestamp = now;
    }

    failureCount++;

    const elapsed = now - firstFailureTimestamp;
    const thresholdCount = CONST.NETWORK.SUSTAINED_FAILURE_THRESHOLD_COUNT;
    const thresholdWindow = CONST.NETWORK.SUSTAINED_FAILURE_WINDOW_MS;

    console.debug(`[FailureTracker] Failure #${failureCount} (elapsed: ${elapsed}ms, threshold: ${thresholdCount} in ${thresholdWindow}ms)`);

    // Only trigger sustained failure when BOTH count AND time thresholds are met
    if (failureCount >= thresholdCount && elapsed >= thresholdWindow) {
        console.debug('[FailureTracker] Sustained failure threshold reached — triggering hard stop');
        for (const cb of sustainedFailureListeners) {
            cb(true);
        }
    }
}

/**
 * Reset the failure counters without clearing the sustained failure flag.
 * Called when reachability is restored to give the app a clean slate —
 * prevents stale failure history from immediately re-triggering a hard stop
 * if the first reconnect attempt fails.
 */
function reset() {
    console.debug(`[FailureTracker] Resetting counters (was: ${failureCount} failures)`);
    failureCount = 0;
    firstFailureTimestamp = 0;
}

function getFailureCount(): number {
    return failureCount;
}

export {recordSuccess, recordFailure, reset, getFailureCount, onSustainedFailureChange};
