import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * When a single transaction report is displayed in RHP it may need extra context in case user navigated to it from MoneyRequestReportView or Reports
 * This context is the list of "sibling" transaction report ids.
 * These "siblings" are child report IDs of every transaction connected to the same parent Report that the original transaction is connected.
 *
 * We save this value in onyx, so that we can correctly display navigation UI in transaction thread RHP.
 */

function setActiveTransactionThreadIDs(ids: string[]) {
    return Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, ids);
}

function clearActiveTransactionThreadIDs() {
    return Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, null);
}

export {setActiveTransactionThreadIDs, clearActiveTransactionThreadIDs};
