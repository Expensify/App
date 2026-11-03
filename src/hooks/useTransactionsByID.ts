import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

function useTransactionsByID(transactionIDs: string[] | undefined) {
    const transactionIDsKey = transactionIDs?.join('|') ?? '';
    const stableTransactionIDs = transactionIDsKey ? transactionIDsKey.split('|') : [];

    const transactionsSelector = (transactions: OnyxCollection<Transaction>) =>
        stableTransactionIDs.map((id) => transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter((transaction): transaction is Transaction => !!transaction);

    const [transactions = getEmptyArray<Transaction>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: transactionsSelector,
    });

    return [transactions];
}

export default useTransactionsByID;
