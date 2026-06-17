import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * When a single transaction report is displayed in RHP it may need extra context in case user navigated to it from MoneyRequestReportView or Reports
 * This context is the list of "sibling" transactions ids.
 * These "siblings" are transactions connected to the same parent Report that the original transaction.
 *
 * We save this value in onyx, so that we can correctly display navigation UI in transaction thread RHP.
 *
 * Optionally a map of transactionID -> thread reportID can be provided. It is used by snapshot-backed flows
 * (e.g. the Home "Recently added" section) where the sibling transactions are not guaranteed to live in the
 * main Onyx collections, so the prev/next navigation can't re-derive the thread report from them. When the
 * map is provided, navigation uses it directly instead.
 */

let lastSetIDs: string[] | null = null;
let lastSetThreadReportIDs: Record<string, string> | null = null;

function areThreadReportIDsEqual(a: Record<string, string> | null, b: Record<string, string> | null) {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    const aKeys = Object.keys(a);
    if (aKeys.length !== Object.keys(b).length) {
        return false;
    }
    return aKeys.every((key) => a[key] === b[key]);
}

/**
 * Idempotent: skips the Onyx write when the IDs and the thread reportID map haven't changed.
 * This lets callers (e.g. useEffect in MoneyRequestReportTransactionList) fire
 * freely without worrying about referential equality of the input array.
 */
function setActiveTransactionIDs(ids: string[], threadReportIDsByTransactionID?: Record<string, string>) {
    const nextThreadReportIDs = threadReportIDsByTransactionID ?? null;
    const sameIDs = lastSetIDs?.length === ids.length && lastSetIDs.every((id, i) => id === ids.at(i));
    if (sameIDs && areThreadReportIDsEqual(lastSetThreadReportIDs, nextThreadReportIDs)) {
        return Promise.resolve();
    }
    lastSetIDs = ids;
    lastSetThreadReportIDs = nextThreadReportIDs;
    return Promise.all([Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, ids), Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS, nextThreadReportIDs)]);
}

function clearActiveTransactionIDs() {
    lastSetIDs = null;
    lastSetThreadReportIDs = null;
    return Promise.all([Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, null), Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS, null)]);
}

export {setActiveTransactionIDs, clearActiveTransactionIDs};
