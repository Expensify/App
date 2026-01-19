import {useMemo} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useTransactionsByID(transactionIDs: string[] | undefined) {
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        canBeMissing: true,
    });

    const transactions = useMemo(() => {
        if (!transactionIDs || transactionIDs.length === 0 || !allTransactions) {
            return [];
        }
        return transactionIDs.map((id) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter(Boolean) as Transaction[];
    }, [transactionIDs, allTransactions]);

    return [transactions];
}

export default useTransactionsByID;
