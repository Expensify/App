import {useEffect, useMemo, useRef} from 'react';
import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import usePrevious from './usePrevious';

// Stable empty result so a "nothing new" return keeps a constant reference (no consumer re-render).
const EMPTY_TRANSACTIONS: Transaction[] = [];

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
        if (isFocused === false) {
            return EMPTY_TRANSACTIONS;
        }

        // Rail-flagged adds survive the remount the diff can't see. Built only when focused; truthy-only so an all-cleared tombstone rail falls through to the diff.
        const railSet = new Set<string>();
        let railTransactions: Transaction[] = EMPTY_TRANSACTIONS;
        if (isFocused && reportID && transactions?.length && pendingNewTransactionIDs) {
            for (const id of Object.keys(pendingNewTransactionIDs)) {
                if (pendingNewTransactionIDs[id]) {
                    railSet.add(id);
                }
            }
            if (railSet.size) {
                railTransactions = transactions.filter(({transactionID}) => railSet.has(transactionID));
            }
        }

        // Diff-detected adds: render-to-render growth the rail never flagged (e.g. a Pusher add).
        let diffTransactions: Transaction[] = [];
        if (transactions !== undefined && prevTransactions !== undefined && transactions.length > prevTransactions.length) {
            if (skipFirstTransactionsChange.current) {
                skipFirstTransactionsChange.current = false;
            } else {
                diffTransactions = transactions.filter((transaction) => !prevTransactions?.some((prevTransaction) => prevTransaction.transactionID === transaction.transactionID));
            }
        }

        // Union, rail first so newTransactions[0] (the scroll target) stays stable across a later add.
        if (!railTransactions.length) {
            return diffTransactions.length ? diffTransactions : EMPTY_TRANSACTIONS;
        }
        const extraDiff = diffTransactions.filter(({transactionID}) => !railSet.has(transactionID));
        return extraDiff.length ? [...railTransactions, ...extraDiff] : railTransactions;

        // We don't need to recalculate on change of prevTransactions as it will make the value
        // disappear quickly which will break the scroll and highlight on slower devices like mobile app.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions, reportID, isFocused, pendingNewTransactionIDs]);

    useEffect(() => {
        // Only the focused consumer clears the rail — else an unfocused diff could clear the flag before the focused view of the same key consumes it.
        if (isFocused === false || !pendingNewTransactionIDs) {
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
    }, [isFocused, pendingNewTransactionIDs, newTransactions, reportID]);

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
