import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOnyx from './useOnyx';

function useTransactionsByID(transactionIDs: string[] | undefined) {
    const transactionIDsKey = transactionIDs?.join('|') ?? '';
    const stableTransactionIDs = useMemo(() => (transactionIDsKey ? transactionIDsKey.split('|') : []), [transactionIDsKey]);

    const transactionsSelector = useCallback(
        (transactions: OnyxCollection<Transaction>) =>
            stableTransactionIDs.map((id) => transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter((transaction): transaction is Transaction => !!transaction),
        [stableTransactionIDs],
    );

    const [transactions = getEmptyArray<Transaction>()] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector: transactionsSelector,
        },
        [transactionsSelector],
    );

    return [transactions];
}

export default useTransactionsByID;
