import {SAFETY_TIMEOUT_MS} from './API/writeWhenReady';
import Log from './Log';

/**
 * Tracks "a submit-expense write is on its way to report X" for the two report-side consumers that
 * need it: the loading-skeleton decision in `MoneyRequestReportUtils.shouldWaitForTransactions` and the
 * empty-state-animation suppression in `ReportActionItemCreated`.
 *
 * Those two live in unrelated module/component trees with no props path between them, so the signal
 * needs somewhere to live. It is deliberately not the write-scheduling registry it replaces: this only
 * answers a question, it never decides where a write goes, so stale state here cannot send a
 * submission down the wrong path the way a stale channel reservation could.
 *
 * Both reads are non-reactive point-in-time checks by design (see `ReportActionItemCreated`), so no
 * subscription mechanism is provided.
 */

/** The report a submit write is currently pending for, if any. Only one submission is ever in flight. */
let pendingReportID: string | undefined;

/** Bumped on every mark so a stale clear from a superseded submission cannot clear a newer one. */
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

/**
 * Mark a submit write as pending for `reportID`, and return the function that clears it. Calling the
 * returned function more than once, or after a later submission replaced this one, is a no-op.
 *
 * The signal also clears itself after `SAFETY_TIMEOUT_MS` - the same bound `writeWhenReady` uses to
 * guarantee the write goes out - so a caller that never gets to clear cannot leave a report stuck
 * showing a loading skeleton.
 */
function markPendingSubmitWriteForReport(reportID: string | undefined): () => void {
    if (!reportID) {
        return () => {};
    }

    generation++;
    const forGeneration = generation;
    pendingReportID = reportID;

    clearTimeout(safetyTimeoutID);
    safetyTimeoutID = setTimeout(() => {
        Log.warn('[pendingSubmitWrite] Pending write signal cleared by its safety timeout - the submission never released it', {reportID});
        clearPending(forGeneration);
    }, SAFETY_TIMEOUT_MS);

    return () => clearPending(forGeneration);
}

/**
 * Whether a submit write is pending for this specific report. Scoped by report so an unrelated
 * submission mid-dismiss does not make every empty money-request report look like it is loading.
 */
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

export {markPendingSubmitWriteForReport, hasPendingSubmitWriteForReport, resetForTesting};
