import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * When a single transaction report is displayed in RHP it may need extra context in case user navigated to it from MoneyRequestReportView or Reports
 * This context is the list of "sibling" transactions ids.
 * These "siblings" are transactions connected to the same parent Report that the original transaction.
 *
 * We save this value in onyx, so that we can correctly display navigation UI in transaction thread RHP.
 */

function setActiveTransactionIDs(ids: string[]) {
    return Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, ids);
}

function clearActiveTransactionIDs() {
    return Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, null);
}

export {setActiveTransactionIDs, clearActiveTransactionIDs};
