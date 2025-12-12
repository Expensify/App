import {getMoneyRequestActionsSelector} from '@selectors/ReportAction';
import type {OnyxCollection} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getLinkedTransactionID} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Hook to get transactions linked to money request actions for a specific report.
 * Uses selectors to fetch only the related transactions from Onyx.
 */

function useReportActionTransactions(reportID: string | undefined): OnyxCollection<Transaction> {
    const [moneyRequestActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {
        canBeMissing: true,
        selector: getMoneyRequestActionsSelector,
    });

    // Build a set of transaction IDs from money request actions
    const transactionIDSet = new Set<string>();
    for (const reportAction of moneyRequestActions ?? []) {
        const transactionID = getLinkedTransactionID(reportAction);
        if (transactionID) {
            transactionIDSet.add(transactionID);
        }
    }

    const transactionsSelector = (allTransactions: OnyxCollection<Transaction>) => {
        const filtered: OnyxCollection<Transaction> = {};
        for (const transactionID of transactionIDSet) {
            const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
            if (allTransactions?.[key]) {
                filtered[key] = allTransactions[key];
            }
        }
        return filtered;
    };

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: transactionsSelector,
        canBeMissing: false,
    });

    return transactions;
}

export default useReportActionTransactions;
