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

/**
 * Idempotent: skips the Onyx write when the IDs haven't changed.
 * This lets callers (e.g. useEffect in MoneyRequestReportTransactionList) fire
 * freely without worrying about referential equality of the input array.
 */
function setActiveTransactionIDs(ids: string[]) {
    if (lastSetIDs?.length === ids.length && lastSetIDs.every((id, i) => id === ids.at(i))) {
        return Promise.resolve();
    }
    lastSetIDs = ids;
    return Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, ids);
}

function clearActiveTransactionIDs() {
    lastSetIDs = null;
    return Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, null);
}

export {setActiveTransactionIDs, clearActiveTransactionIDs};
