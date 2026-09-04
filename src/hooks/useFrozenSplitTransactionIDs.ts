import {isSplitExpenseFrozen} from '@libs/SplitExpenseUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

/**
 * IDs of the splits whose own report is already approved/paid/done - their amount must stay fixed and
 * can't absorb any amount from a split added/removed/edited elsewhere in the same expense.
 */
function useFrozenSplitTransactionIDs(
    splitExpenses: SplitExpense[],
    allTransactions: OnyxCollection<Transaction>,
    allReports: OnyxCollection<Report>,
    fallbackReport: Report | undefined,
    searchResultsData?: SearchResultDataType,
): Set<string> {
    const frozenIDs = new Set<string>();
    for (const item of splitExpenses) {
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}` as const;
        const itemTransaction = allTransactions?.[transactionKey] ?? searchResultsData?.[transactionKey];
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${itemTransaction?.reportID}` as const;
        const itemReport = allReports?.[reportKey] ?? searchResultsData?.[reportKey] ?? fallbackReport;
        if (isSplitExpenseFrozen(itemReport)) {
            frozenIDs.add(item.transactionID);
        }
    }
    return frozenIDs;
}

export default useFrozenSplitTransactionIDs;
