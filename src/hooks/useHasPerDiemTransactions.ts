import type {OnyxCollection} from 'react-native-onyx';
import {isPerDiemRequest} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

const hasPerDiemTransactionsSelector = (transactions: OnyxCollection<Transaction>, transactionIDs: string[]) => {
    return transactionIDs.some((transactionID) => {
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        return transaction && isPerDiemRequest(transaction);
    });
};

function useHasPerDiemTransactions(transactionIDs: string[]) {
    const [hasPerDiemTransactions] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector: (transactions) => hasPerDiemTransactionsSelector(transactions, transactionIDs),
            canBeMissing: true,
        },
        [hasPerDiemTransactionsSelector],
    );

    return hasPerDiemTransactions ?? false;
}

export default useHasPerDiemTransactions;
