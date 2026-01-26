import type {OnyxCollection} from 'react-native-onyx';
import {isTimeRequest} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

const hasTimeTransactionsSelector = (transactions: OnyxCollection<Transaction>, transactionIDs: string[]) => {
    return transactionIDs.some((transactionID) => {
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        return transaction && isTimeRequest(transaction);
    });
};

function useHasPerDiemTransactions(transactionIDs: string[]) {
    const selector = (transactions: OnyxCollection<Transaction>) => hasTimeTransactionsSelector(transactions, transactionIDs);

    const [hasPerDiemTransactions] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector,
            canBeMissing: true,
        },
        [selector],
    );

    return hasPerDiemTransactions ?? false;
}

export default useHasPerDiemTransactions;
