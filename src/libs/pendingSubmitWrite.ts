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

type PendingSubmitWrite = {
    /** Passed to the submit function. Clears the signal once the write attaches to it and it settles or aborts. */
    barrier: WriteReadyBarrier;

    /**
     * Call right after the submit function returns. If no write attached and none is still coming, clears the signal
     * now (validation bailed, or the app was minimized and the write skipped the barrier). If one is still coming,
     * e.g. after a GPS lookup, only extends the safety timeout so it cannot expire mid-lookup.
     */
    settleAfterSubmit: (isWriteStillComing: boolean) => void;
};

/**
 * Marks `reportID` pending and ties the clear to `baseBarrier`, so the signal drops when the write goes out rather
 * than when the submit function returns. A zero-amount GPS submission returns first and only writes after the lookup;
 * clearing on return would flash the destination's empty state meanwhile.
 */
function trackPendingSubmitWriteForReport(reportID: string | undefined, baseBarrier: WriteReadyBarrier): PendingSubmitWrite {
    const clearPendingWrite = markPendingSubmitWriteForReport(reportID);
    let hasWriteAttached = false;

    const barrier: WriteReadyBarrier = (abortSignal) => {
        hasWriteAttached = true;
        restartPendingSubmitWriteSafetyTimeout(reportID);
        // writeWhenReady's early-release paths abort without settling the barrier, so listen for that too.
        abortSignal.addEventListener('abort', clearPendingWrite);
        return Promise.resolve(baseBarrier(abortSignal)).finally(clearPendingWrite);
    };

    const settleAfterSubmit = (isWriteStillComing: boolean) => {
        if (hasWriteAttached) {
            return;
        }
        if (isWriteStillComing) {
            restartPendingSubmitWriteSafetyTimeout(reportID);
            return;
        }
        clearPendingWrite();
    };

    return {barrier, settleAfterSubmit};
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

export {markPendingSubmitWriteForReport, trackPendingSubmitWriteForReport, restartPendingSubmitWriteSafetyTimeout, hasPendingSubmitWriteForReport, resetForTesting};
export type {PendingSubmitWrite};
