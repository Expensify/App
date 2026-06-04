import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * When a single transaction report is displayed in RHP it may need extra context in case user navigated to it from MoneyRequestReportView or Reports
 * This context is the list of "sibling" transactions ids.
 * These "siblings" are transactions connected to the same parent Report that the original transaction.
 *
 * We save this value in onyx, so that we can correctly display navigation UI in transaction thread RHP.
 */

let lastSetIDs: string[] | null = null;
let lastSetSnapshotHash: number | null = null;

/**
 * Idempotent: skips the Onyx write when the IDs (and snapshot hash) haven't changed.
 * This lets callers (e.g. useEffect in MoneyRequestReportTransactionList) fire
 * freely without worrying about referential equality of the input array.
 *
 * When the navigation list originates from a search, pass the search snapshot hash so the
 * transaction RHP carousel can fall back to snapshot data for transactions that aren't in the
 * live collection yet (e.g. an approver opening an expense from the Spend page).
 */
function setActiveTransactionIDs(ids: string[], snapshotHash?: number) {
    const nextSnapshotHash = snapshotHash ?? null;
    const areIDsUnchanged = lastSetIDs?.length === ids.length && lastSetIDs.every((id, i) => id === ids.at(i));
    if (areIDsUnchanged && lastSetSnapshotHash === nextSnapshotHash) {
        return Promise.resolve();
    }
    lastSetIDs = ids;
    lastSetSnapshotHash = nextSnapshotHash;
    return Promise.all([Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, ids), Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH, nextSnapshotHash)]);
}

function clearActiveTransactionIDs() {
    lastSetIDs = null;
    lastSetSnapshotHash = null;
    return Promise.all([Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, null), Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH, null)]);
}

export {setActiveTransactionIDs, clearActiveTransactionIDs};
