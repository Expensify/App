import {useEffect, useMemo, useRef} from 'react';
import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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
    pendingNewTransactionIDs?: Record<string, true | null>,
    reportID?: string,
    isFocused?: boolean,
) {
    // If we haven't loaded report yet we set previous transaction ids to undefined.
    const prevTransactions = usePrevious(hasOnceLoadedReportActions ? transactions : undefined);

    // We need to skip the first transactions change, to avoid highlighting transactions on the first load.
    const skipFirstTransactionsChange = useRef(!hasOnceLoadedReportActions);

    const newTransactions = useMemo(() => {
        if (transactions === undefined || prevTransactions === undefined || transactions.length <= prevTransactions.length) {
            // GUARD: pre-mount adds (e.g., Self DM → workspace). isFocused gates the rail so unfocused chat previews don't consume it prematurely.
            if (isFocused && reportID && !isEmptyObject(pendingNewTransactionIDs) && transactions?.length) {
                const pendingSet = new Set(Object.keys(pendingNewTransactionIDs));
                return transactions.filter(({transactionID}) => pendingSet.has(transactionID) && pendingNewTransactionIDs[transactionID]);
            }
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }
        if (skipFirstTransactionsChange.current) {
            skipFirstTransactionsChange.current = false;
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }
        // DIFF runs regardless of focus — useAnimatedHighlightStyle latches and waits for didScreenTransitionEnd, so unfocused consumers still queue the highlight.
        return transactions.filter((transaction) => !prevTransactions?.some((prevTransaction) => prevTransaction.transactionID === transaction.transactionID));

        // We don't need to recalculate on change of prevTransactions as it will make the value
        // disappear quickly which will break the scroll and highlight on slower devices like mobile app.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions, reportID, isFocused, pendingNewTransactionIDs]);

    useEffect(() => {
        if (!pendingNewTransactionIDs) {
            return;
        }
        const pendingSet = new Set(Object.keys(pendingNewTransactionIDs));
        const pendingTransactions = newTransactions.filter(({transactionID}) => pendingSet.has(transactionID) && pendingNewTransactionIDs[transactionID]);
        if (!pendingTransactions.length) {
            return;
        }

        // We deletePendingNewTransactionIDs after the scroll and highlight has occurred.
        setTimeout(() => {
            deletePendingNewTransactionIDs(
                reportID,
                pendingTransactions.map((transaction) => transaction.transactionID),
            );
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
    }, [pendingNewTransactionIDs, newTransactions, reportID]);

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
