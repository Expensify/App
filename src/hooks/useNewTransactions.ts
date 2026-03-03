import {useEffect, useMemo, useRef} from 'react';
import {clearPendingNewTransactionIDs} from '@libs/actions/IOU';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import usePrevious from './usePrevious';

/**
 * This hook returns new transactions that have been added since the last transactions update.
 * This hook should be used only in the context of highlighting the new transactions on the Report table view.
 *
 * When `pendingNewTransactionIDs` is provided, those transactions will be treated as new even on the
 * first load. This handles the case where a transaction was created before the component mounts
 * (e.g., submitting a tracked expense from Self DM to a workspace on Web).
 */
function useNewTransactions(
    hasOnceLoadedReportActions: boolean | undefined,
    transactions: Transaction[] | undefined,
    pendingNewTransactionIDs?: Record<string, string | null>,
    reportID?: string,
    isFocused = false,
) {
    // If we haven't loaded report yet we set previous transactions to undefined.
    const prevTransactions = usePrevious(hasOnceLoadedReportActions ? transactions : undefined);

    // We need to skip the first transactions change, to avoid highlighting transactions on the first load.
    const skipFirstTransactionsChange = useRef(!hasOnceLoadedReportActions);

    const newTransactions = useMemo(() => {
        if (transactions === undefined || prevTransactions === undefined || transactions.length <= prevTransactions.length) {
            // When a transaction is submitted from another report (e.g., Self DM → workspace), it is
            // already in the transactions list by the time this component mounts. The delta
            // detection above cannot detect it because prevTransactions starts as undefined and then
            // becomes equal to transactions. So we use pendingNewTransactionIDs from report metadata to
            // identify these transactions on first load.
            if (isFocused && reportID && pendingNewTransactionIDs && transactions?.length) {
                const pendingSet = new Set(Object.values(pendingNewTransactionIDs));
                // Clearing pending transactions immediately sometimes hinders the scroll and highlighting, hence the delay.
                setTimeout(() => {
                    clearPendingNewTransactionIDs(reportID);
                }, CONST.SCREEN_TRANSITION_END_TIMEOUT);
                return transactions.filter((transaction) => pendingSet.has(transaction.transactionID));
            }
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }
        if (skipFirstTransactionsChange.current) {
            skipFirstTransactionsChange.current = false;
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }
        return transactions.filter((transaction) => !prevTransactions?.some((prevTransaction) => prevTransaction.transactionID === transaction.transactionID));
    }, [transactions, prevTransactions, pendingNewTransactionIDs, reportID, isFocused]);

    // In case when we have loaded the report, but there were no transactions in it, then we need to explicitly set skipFirstTransactionsChange to false, as it will be not set in the useMemo above.
    useEffect(() => {
        if (!hasOnceLoadedReportActions) {
            return;
        }
        // This is needed to ensure that set we skipFirstTransactionsChange to false only after the Onyx merge is done.
        new Promise<void>((resolve) => {
            resolve();
        }).then(() => {
            requestAnimationFrame(() => {
                skipFirstTransactionsChange.current = false;
            });
        });
    }, [hasOnceLoadedReportActions]);

    return newTransactions;
}

export default useNewTransactions;
