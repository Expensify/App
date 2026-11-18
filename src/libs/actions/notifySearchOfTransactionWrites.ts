/**
 * Tells Search which transactions just changed on the server, so it can refetch the values only the server computes
 * (footer totals, row actions, filter membership). Fed by successful user writes, Pusher and Airship updates, and
 * the catch-up requests that recover missed Pusher updates.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

let writeID = 0;

function getReportID(value: unknown) {
    if (typeof value !== 'object' || value === null || !('reportID' in value) || typeof value.reportID !== 'string') {
        return undefined;
    }
    return value.reportID;
}

function notifySearchOfTransactionWrites(updates: ReadonlyArray<{key: string; value?: unknown}> | undefined) {
    const nextWriteID = writeID + 1;
    const transactionIDs: Record<string, number> = {};
    const reportIDs: Record<string, number> = {};
    for (const update of updates ?? []) {
        if (!update.key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            continue;
        }
        transactionIDs[update.key.slice(ONYXKEYS.COLLECTION.TRANSACTION.length)] = nextWriteID;
        // A user write's rollback holds the report the transaction left, which loses an expense when it is moved.
        const reportID = getReportID(update.value);
        if (reportID) {
            reportIDs[reportID] = nextWriteID;
        }
    }
    if (Object.keys(transactionIDs).length === 0) {
        return;
    }

    writeID = nextWriteID;
    // Merged, not set, so a Search that renders only after several writes (frozen tab, batched updates) still sees each of them.
    Onyx.merge(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES, {writeID, transactionIDs, reportIDs});
}

export default notifySearchOfTransactionWrites;
