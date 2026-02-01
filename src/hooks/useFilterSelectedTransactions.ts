import {useEffect, useMemo} from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import type {Transaction} from '@src/types/onyx';

/**
 * Hook that filters selected transaction IDs to only include transactions that exist in the provided list.
 * This is useful when transactions are deleted and we need to clean up the selection state.
 *
 * @param transactions - The current list of transactions
 */
function useFilterSelectedTransactions(transactions: Transaction[]) {
    const {selectedTransactionIDs, setSelectedTransactions} = useSearchContext();

    const transactionIDs = useMemo(() => transactions.map((transaction) => transaction.transactionID), [transactions]);
    const filteredSelectedTransactionIDs = useMemo(() => selectedTransactionIDs.filter((id) => transactionIDs.includes(id)), [selectedTransactionIDs, transactionIDs]);
    useEffect(() => {
        if (filteredSelectedTransactionIDs.length === selectedTransactionIDs.length) {
            return;
        }
        setSelectedTransactions(filteredSelectedTransactionIDs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredSelectedTransactionIDs]);
}


export default useFilterSelectedTransactions;
