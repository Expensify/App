import {useEffect, useMemo, useRef} from 'react';
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
function useNewTransactions(hasOnceLoadedReportActions: boolean | undefined, transactions: Transaction[] | undefined, pendingNewTransactionIDs?: string[]) {
    // If we haven't loaded report yet we set previous transactions to undefined.
    const prevTransactions = usePrevious(hasOnceLoadedReportActions ? transactions : undefined);

    // We need to skip the first transactions change, to avoid highlighting transactions on the first load.
    const skipFirstTransactionsChange = useRef(!hasOnceLoadedReportActions);

    // Track whether we've already consumed the pending new transaction IDs to avoid re-highlighting.
    const hasConsumedPendingIDs = useRef(false);

    const newTransactions = useMemo(() => {
        if (transactions === undefined || prevTransactions === undefined || transactions.length <= prevTransactions.length) {
            // When a transaction is submitted from another report (e.g., Self DM → workspace), it is
            // already in the transactions list by the time this component mounts on Web. The delta
            // detection above cannot detect it because prevTransactions starts as undefined and then
            // becomes equal to transactions. Use pendingNewTransactionIDs from report metadata to
            // identify these transactions on first load.
            if (pendingNewTransactionIDs?.length && transactions?.length && !hasConsumedPendingIDs.current) {
                hasConsumedPendingIDs.current = true;
                const pendingSet = new Set(pendingNewTransactionIDs);
                return transactions.filter((transaction) => pendingSet.has(transaction.transactionID));
            }
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }
        if (skipFirstTransactionsChange.current) {
            skipFirstTransactionsChange.current = false;
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }
        return transactions.filter((transaction) => !prevTransactions?.some((prevTransaction) => prevTransaction.transactionID === transaction.transactionID));
    }, [transactions, prevTransactions, pendingNewTransactionIDs]);

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
