import {useEffect, useMemo, useRef} from 'react';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import usePrevious from './usePrevious';

/**
 * This hook returns new transactions that have been added since the last transactions update.
 * This hook should be used only in the context of highlighting the new transactions on the Report table view.
 */
function useNewTransactions(hasOnceLoadedReportActions: boolean | undefined, transactions: Transaction[] | undefined) {
    // If we haven't loaded report yet we set previous transactions to undefined.
    const prevTransactions = usePrevious(hasOnceLoadedReportActions ? transactions : undefined);

    // We need to skip the first transactions change, to avoid highlighting transactions on the first load.
    const skipFirstTransactionsChange = useRef(!hasOnceLoadedReportActions);

    const newTransactions = useMemo(() => {
        if (transactions === undefined || prevTransactions === undefined || transactions.length <= prevTransactions.length) {
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }
        if (skipFirstTransactionsChange.current) {
            skipFirstTransactionsChange.current = false;
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }
        return transactions.filter((transaction) => !prevTransactions?.some((prevTransaction) => prevTransaction.transactionID === transaction.transactionID));
        // Depending only on transactions is enough because prevTransactions is a helper object.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions]);

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
