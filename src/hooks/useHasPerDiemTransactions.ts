import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasPerDiemTransactionsSelector} from '@src/selectors/Transaction';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useHasPerDiemTransactions(transactionIDs: string[]) {
    const selector = useCallback((transactions: OnyxCollection<Transaction>) => hasPerDiemTransactionsSelector(transactions, transactionIDs), [transactionIDs]);

    const [hasPerDiemTransactions = false] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector,
            canBeMissing: true,
        },
        [selector],
    );

    return hasPerDiemTransactions;
}

export default useHasPerDiemTransactions;
