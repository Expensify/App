import type {WriteReadyBarrier} from './API/writeWhenReady';

import {SAFETY_TIMEOUT_MS} from './API/writeWhenReady';
import Log from './Log';

/**
 * Tracks "a submit-expense write is on its way to report X", for callers to check via
 * `hasPendingSubmitWriteForReport`. Meant for a one-off read; there's no onChange/listener API.
 */

/** The report a submit write is currently pending for, if any. Only one submission is ever in flight. */
let pendingReportID: string | undefined;

/** ID of the current pending submission, bumped each time `markPendingSubmitWriteForReport` runs. */
let generation = 0;

let safetyTimeoutID: ReturnType<typeof setTimeout> | undefined;

function clearPending(forGeneration: number) {
    if (generation !== forGeneration || pendingReportID === undefined) {
        return;
    }
    pendingReportID = undefined;
    clearTimeout(safetyTimeoutID);
    safetyTimeoutID = undefined;
}

function startSafetyTimeout(reportID: string, forGeneration: number) {
    clearTimeout(safetyTimeoutID);
    safetyTimeoutID = setTimeout(() => {
        Log.warn('[pendingSubmitWrite] Pending write signal cleared by its safety timeout - the submission never released it', {reportID});
        clearPending(forGeneration);
    }, SAFETY_TIMEOUT_MS);
}

/**
 * Marks `reportID` pending, returns a function to call once the write settles. Calling that returned
 * function twice, or after a later submission replaced this one, is a no-op. Also self-clears after
 * `SAFETY_TIMEOUT_MS` in case the caller never calls it.
 */
function markPendingSubmitWriteForReport(reportID: string | undefined): () => void {
    if (!reportID) {
        return () => {};
    }

    generation++;
    const forGeneration = generation;
    pendingReportID = reportID;

    startSafetyTimeout(reportID, forGeneration);

    return () => clearPending(forGeneration);
}

/** Call once the write attaches, restarting the safety timeout from there so it can't clear `pendingReportID` while that write is still in flight. */
function restartPendingSubmitWriteSafetyTimeout(reportID: string | undefined) {
    if (!reportID || pendingReportID !== reportID) {
        return;
    }
    startSafetyTimeout(reportID, generation);
}

/**
 * Returns a barrier that also calls `clearPendingWrite` when it settles or aborts. Use it so the pending-write signal
 * clears when the write goes out, not when the submit function returns: a zero-amount GPS submission returns first
 * and only writes after the lookup, and clearing early would flash the destination's empty state meanwhile.
 */
function clearPendingSubmitWriteWhenBarrierSettles(barrier: WriteReadyBarrier, clearPendingWrite: () => void): WriteReadyBarrier {
    return (abortSignal) => {
        // writeWhenReady's early-release paths abort without settling the barrier, so listen for that too.
        abortSignal.addEventListener('abort', clearPendingWrite);
        return Promise.resolve(barrier(abortSignal)).finally(clearPendingWrite);
    };
}

/** Whether a submit write is pending for this specific report, scoped so an unrelated submission can't affect it. */
function hasPendingSubmitWriteForReport(reportID: string | undefined): boolean {
    if (!reportID) {
        return false;
    }
    return pendingReportID === reportID;
}

/** Only for use in tests. Gated behind __DEV__ so it is a no-op in production. */
function resetForTesting() {
    if (!__DEV__) {
        return;
    }
    clearTimeout(safetyTimeoutID);
    safetyTimeoutID = undefined;
    pendingReportID = undefined;
    generation = 0;
}

export {markPendingSubmitWriteForReport, restartPendingSubmitWriteSafetyTimeout, hasPendingSubmitWriteForReport, clearPendingSubmitWriteWhenBarrierSettles, resetForTesting};
