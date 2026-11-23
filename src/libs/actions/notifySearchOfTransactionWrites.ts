/**
 * Tells Search which transactions just changed on the server, so it can refetch the values only the server computes
 * (footer totals, row actions, filter membership). Fed by successful user writes, Pusher and Airship updates, and
 * reconnects and the catch-up requests that recover missed Pusher updates.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

// Enough for a frozen Search to catch up on. One that fell further behind searches again without checking.
const MAX_KEPT_WRITES = 100;

let writeID = 0;
let transactionWriteIDs: Record<string, number> = {};
let reportWriteIDs: Record<string, number> = {};

function keepRecentWrites(writeIDs: Record<string, number>, oldestWriteID: number) {
    return Object.fromEntries(Object.entries(writeIDs).filter(([, id]) => id >= oldestWriteID));
}

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
    const addTransaction = (key: string, value: unknown) => {
        transactionIDs[key.slice(ONYXKEYS.COLLECTION.TRANSACTION.length)] = nextWriteID;
        // A user write's rollback holds the report the transaction left, which loses an expense when it is moved.
        const reportID = getReportID(value);
        if (reportID) {
            reportIDs[reportID] = nextWriteID;
        }
    };
    for (const update of updates ?? []) {
        if (!update.key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            continue;
        }
        // A collection update holds its members under their own keys.
        if (update.key === ONYXKEYS.COLLECTION.TRANSACTION) {
            for (const [key, value] of Object.entries(update.value ?? {})) {
                addTransaction(key, value);
            }
            continue;
        }
        addTransaction(update.key, update.value);
    }
    if (Object.keys(transactionIDs).length === 0) {
        return;
    }

    writeID = nextWriteID;
    const oldestWriteID = Math.max(1, writeID - MAX_KEPT_WRITES + 1);
    transactionWriteIDs = keepRecentWrites({...transactionWriteIDs, ...transactionIDs}, oldestWriteID);
    reportWriteIDs = keepRecentWrites({...reportWriteIDs, ...reportIDs}, oldestWriteID);
    // Every recent write stays in the value, so a Search that renders only after several of them (frozen tab, batched updates) still sees each one.
    Onyx.set(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES, {writeID, oldestWriteID, transactionIDs: transactionWriteIDs, reportIDs: reportWriteIDs});
}

export default notifySearchOfTransactionWrites;
