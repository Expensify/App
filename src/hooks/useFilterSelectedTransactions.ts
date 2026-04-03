import {useEffect, useMemo} from 'react';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {Transaction} from '@src/types/onyx';

/**
 * Hook that filters selected transaction IDs to only include transactions that exist in the provided list.
 * This is useful when transactions are deleted and we need to clean up the selection state.
 *
 * @param transactions - The current list of transactions
 * @param reportID - The report that owns the current transaction list
 */
function useFilterSelectedTransactions(transactions: Transaction[], reportID?: string) {
    const {selectedTransactionIDs, currentSelectedTransactionReportID} = useSearchStateContext();
    const {setSelectedTransactions} = useSearchActionsContext();

    const transactionIDs = useMemo(() => transactions.map((transaction) => transaction.transactionID), [transactions]);
    const filteredSelectedTransactionIDs = useMemo(() => selectedTransactionIDs.filter((id) => transactionIDs.includes(id)), [selectedTransactionIDs, transactionIDs]);
    useEffect(() => {
        if (filteredSelectedTransactionIDs.length === selectedTransactionIDs.length) {
            return;
        }

        if (reportID && currentSelectedTransactionReportID && currentSelectedTransactionReportID !== reportID) {
            return;
        }

        setSelectedTransactions(filteredSelectedTransactionIDs);
    }, [currentSelectedTransactionReportID, filteredSelectedTransactionIDs, reportID, selectedTransactionIDs.length, setSelectedTransactions]);
}

export default useFilterSelectedTransactions;
