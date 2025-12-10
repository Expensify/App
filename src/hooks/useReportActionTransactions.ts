import {useCallback, useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

const moneyRequestActionsSelector = (actions: OnyxEntry<ReportActions>): ReportAction[] => Object.values(actions ?? {}).filter(ReportActionsUtils.isMoneyRequestAction);

/**
 * Hook to get transactions linked to money request actions for a specific report.
 * Uses selectors to fetch only the related transactions from Onyx.
 */

function useReportActionTransactions(reportID: string | undefined): OnyxCollection<Transaction> {
    const [moneyRequestActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canBeMissing: true,
        selector: moneyRequestActionsSelector,
    });

    // Extract only money request actions from the report action map.
    const transactionIDSet = useMemo(() => {
        if (!moneyRequestActions) {
            return new Set<string>();
        }

        const transactionIDs = new Set<string>();
        moneyRequestActions.forEach((reportAction) => {
            const transactionID = ReportActionsUtils.getLinkedTransactionID(reportAction);
            if (transactionID) {
                transactionIDs.add(transactionID);
            }
        });

        return transactionIDs;
    }, [moneyRequestActions]);

    const transactionsSelector = useCallback(
        (allTransactions: OnyxCollection<Transaction>) => {
            const filtered: OnyxCollection<Transaction> = {};
            transactionIDSet.forEach((transactionID) => {
                const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
                if (allTransactions?.[key]) {
                    filtered[key] = allTransactions[key];
                }
            });
            return filtered;
        },
        [transactionIDSet],
    );

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: transactionsSelector,
        canBeMissing: false,
    });

    return transactions;
}

export default useReportActionTransactions;
