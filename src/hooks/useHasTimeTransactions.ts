import type {OnyxCollection} from 'react-native-onyx';
import {isTimeRequest} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

const hasTimeTransactionsSelector = (transactions: OnyxCollection<Transaction>, transactionIDs: string[]) =>
    transactionIDs.some((transactionID) => {
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        return transaction && isTimeRequest(transaction);
    });

function useHasTimeTransactions(transactionIDs: string[]) {
    const selector = (transactions: OnyxCollection<Transaction>) => hasTimeTransactionsSelector(transactions, transactionIDs);

    const [hasTimeTransactions] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector,
            canBeMissing: true,
        },
        [selector],
    );

    return hasTimeTransactions ?? false;
}

export default useHasTimeTransactions;
