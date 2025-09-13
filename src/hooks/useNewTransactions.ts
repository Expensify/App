import {useMemo} from 'react';
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

    const newTransactions = useMemo(() => {
        if (transactions === undefined || prevTransactions === undefined || transactions.length <= prevTransactions.length) {
            return CONST.EMPTY_ARRAY as unknown as Transaction[];
        }

        return transactions.filter((transaction) => !prevTransactions?.some((prevTransaction) => prevTransaction.transactionID === transaction.transactionID));
        // Depending only on transactions is enough because prevTransactions is a helper object.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions]);

    return newTransactions;
}

export default useNewTransactions;
