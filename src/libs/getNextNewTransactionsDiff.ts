/** The list diff behind useNewTransactions, as a pure step from one render's state to the next. */
const EMPTY_TRANSACTION_IDS: readonly string[] = [];

type NewTransactionsDiff = {
    /** A different report restarts the diff. */
    reportID: string | undefined;

    /** `undefined` until the report's full list arrives. */
    sourceIDs: readonly string[] | undefined;

    /** Emptied when their highlight window ends. */
    addedIDs: readonly string[];

    /** Whether the initial load is over, so later growth counts as adds. A loaded report starts settled, and any other settles on its first growth or once it loads without growing. */
    hasSettledAfterInitialLoad: boolean;
};

type NewTransactionsDiffInput = {
    /** Must be the list's own report: a split and a different report both replace the whole list, and only this tells them apart. */
    transactionsReportID: string | undefined;

    /** `undefined` while the report hasn't loaded or its full list hasn't arrived. */
    trackedTransactionIDs: readonly string[] | undefined;

    hasOnceLoadedReportActions: boolean;
};

function getInitialNewTransactionsDiff(reportID: string | undefined, hasOnceLoadedReportActions: boolean): NewTransactionsDiff {
    return {reportID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS, hasSettledAfterInitialLoad: hasOnceLoadedReportActions};
}

/** Returns `previous` itself when nothing changed, so the caller stores a new diff only when there is one. */
function getNextNewTransactionsDiff(previous: NewTransactionsDiff, {transactionsReportID, trackedTransactionIDs, hasOnceLoadedReportActions}: NewTransactionsDiffInput): NewTransactionsDiff {
    if (transactionsReportID !== previous.reportID) {
        // Only the new report's own list can set its baseline.
        return getInitialNewTransactionsDiff(transactionsReportID, hasOnceLoadedReportActions);
    }

    // An unloaded report cannot have settled, even if the loaded flag lags a report switch.
    const hasSettledAfterInitialLoad = previous.hasSettledAfterInitialLoad && hasOnceLoadedReportActions;
    const baselineSourceIDs = previous.sourceIDs;
    const baselineIDs = new Set(baselineSourceIDs);
    // A reorder is not an add.
    const hasSameTransactionIDs =
        trackedTransactionIDs !== undefined &&
        baselineSourceIDs !== undefined &&
        trackedTransactionIDs.length === baselineSourceIDs.length &&
        trackedTransactionIDs.every((transactionID) => baselineIDs.has(transactionID));
    if ((trackedTransactionIDs === undefined && baselineSourceIDs === undefined) || hasSameTransactionIDs) {
        return hasSettledAfterInitialLoad === previous.hasSettledAfterInitialLoad ? previous : {...previous, hasSettledAfterInitialLoad};
    }

    if (baselineSourceIDs !== undefined && trackedTransactionIDs !== undefined && trackedTransactionIDs.length > baselineSourceIDs.length) {
        if (!hasSettledAfterInitialLoad) {
            return {reportID: transactionsReportID, sourceIDs: trackedTransactionIDs, addedIDs: EMPTY_TRANSACTION_IDS, hasSettledAfterInitialLoad: hasOnceLoadedReportActions};
        }
        // Every missing row is an add, even all of them: that is what a split looks like.
        const addedIDs = trackedTransactionIDs.filter((transactionID) => !baselineIDs.has(transactionID));
        return {reportID: transactionsReportID, sourceIDs: trackedTransactionIDs, addedIDs, hasSettledAfterInitialLoad};
    }

    // The same array, so a reorder or removal doesn't restart the highlight window.
    const addedIDs = previous.addedIDs.length && trackedTransactionIDs !== undefined ? previous.addedIDs : EMPTY_TRANSACTION_IDS;
    return {reportID: transactionsReportID, sourceIDs: trackedTransactionIDs, addedIDs, hasSettledAfterInitialLoad};
}

export default getNextNewTransactionsDiff;
export {EMPTY_TRANSACTION_IDS, getInitialNewTransactionsDiff};
export type {NewTransactionsDiff};
