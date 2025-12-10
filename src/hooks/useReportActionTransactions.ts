import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getLinkedTransactionID, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

const moneyRequestActionsSelector = (actions: OnyxEntry<ReportActions>): ReportAction[] => Object.values(actions ?? {}).filter(isMoneyRequestAction);

/**
 * Hook to get transactions linked to money request actions for a specific report.
 * Uses selectors to fetch only the related transactions from Onyx.
 */

function useReportActionTransactions(reportID: string | undefined): OnyxCollection<Transaction> {
    const [moneyRequestActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canBeMissing: true,
        selector: moneyRequestActionsSelector,
    });

    // Build a set of transaction IDs from money request actions
    const transactionIDSet = (() => {
        if (!moneyRequestActions) {
            return new Set<string>();
        }

        const transactionIDs = new Set<string>();
        for (const reportAction of moneyRequestActions) {
            const transactionID = getLinkedTransactionID(reportAction);
            if (transactionID) {
                transactionIDs.add(transactionID);
            }
        }

        return transactionIDs;
    })();

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
