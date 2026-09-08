import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {isSplitExpenseFrozen} from '@libs/SplitExpenseUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/**
 * IDs of the splits that must stay fixed at their current amount: either their own report is already
 * approved/paid/done, or the current user otherwise can't perform the split action on them. Neither can
 * absorb any amount from a split added/removed/edited elsewhere in the same expense.
 */
function useFrozenSplitTransactionIDs(
    splitExpenses: SplitExpense[],
    allTransactions: OnyxCollection<Transaction>,
    allReports: OnyxCollection<Report>,
    fallbackReport: Report | undefined,
    searchResultsData: SearchResultDataType | undefined,
    originalTransaction: OnyxEntry<Transaction>,
    currentUserLogin: string,
    currentUserAccountID: number,
    allPolicies: OnyxCollection<Policy>,
    parentReport: OnyxEntry<Report>,
): Set<string> {
    const frozenIDs = new Set<string>();
    for (const item of splitExpenses) {
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}` as const;
        const itemTransaction = allTransactions?.[transactionKey] ?? searchResultsData?.[transactionKey];
        // Fall back to the split's own cached reportID first - fallbackReport is another split's report.
        const liveReportID = itemTransaction?.reportID ?? item.reportID;
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${liveReportID}` as const;
        const itemReport = allReports?.[reportKey] ?? searchResultsData?.[reportKey] ?? fallbackReport;
        const itemPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${itemReport?.policyID}`];
        const isEditable = !itemTransaction || isSplitAction(itemReport, [itemTransaction], originalTransaction, currentUserLogin, currentUserAccountID, itemPolicy, parentReport);
        if (isSplitExpenseFrozen(itemReport) || !isEditable) {
            frozenIDs.add(item.transactionID);
        }
    }
    return frozenIDs;
}

export default useFrozenSplitTransactionIDs;
