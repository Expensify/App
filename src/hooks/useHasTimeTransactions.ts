import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasTimeTransactionsSelector} from '@src/selectors/Transaction';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useHasTimeTransactions(transactionIDs: string[]) {
    const selector = (transactions: OnyxCollection<Transaction>) => hasTimeTransactionsSelector(transactions, transactionIDs);

    const [hasTimeTransactions = false] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector,
            canBeMissing: true,
        },
        [selector],
    );

    return hasTimeTransactions;
}

export default useHasTimeTransactions;
