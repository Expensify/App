import CONST from '@src/CONST';
import Log from './Log';
import NetworkState from './NetworkState';

let failureCount = 0;
let firstFailureTimestamp = 0;

/**
 * Record a successful request outcome.
 * Resets the failure tracker — one success proves connectivity.
 */
function recordSuccess() {
    if (failureCount > 0) {
        Log.info(`[FailureTracker] Success after ${failureCount} failures — resetting tracker`);
    }
    failureCount = 0;
    firstFailureTimestamp = 0;

    // If we were in sustained failure hard stop, clear it
    NetworkState.setSustainedFailures(false);
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

    Log.info(`[FailureTracker] Failure #${failureCount} (elapsed: ${elapsed}ms, threshold: ${thresholdCount} in ${thresholdWindow}ms)`);

    // Only trigger sustained failure when BOTH count AND time thresholds are met
    if (failureCount >= thresholdCount && elapsed >= thresholdWindow) {
        Log.info('[FailureTracker] Sustained failure threshold reached — triggering hard stop');
        NetworkState.setSustainedFailures(true);
    }
}

/**
 * Reset the tracker (for testing).
 */
function reset() {
    failureCount = 0;
    firstFailureTimestamp = 0;
}

function getFailureCount(): number {
    return failureCount;
}

export {recordSuccess, recordFailure, reset, getFailureCount};
