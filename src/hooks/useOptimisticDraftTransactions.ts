import type {OnyxEntry} from 'react-native-onyx';
import type {Transaction} from '@src/types/onyx';
import useTransactionDraftValues from './useTransactionDraftValues';

/**
 * A hook that retrieves all optimistic draft transactions,
 * ensuring there is always a draft transaction available to display.
 *
 * If the draft transaction in Onyx data does not exist
 * or contains only a single transaction, it will fallback to the provided transaction.
 * Otherwise, it will use the draft transactions from Onyx data.
 */
const useOptimisticDraftTransactions = (transaction: OnyxEntry<Transaction>) => {
    const optimisticTransactions = useTransactionDraftValues();

    const allTransactions = optimisticTransactions && optimisticTransactions.length > 1 ? optimisticTransactions : [transaction];
    const transactions = allTransactions.filter((value): value is Transaction => !!value);

    const optimisticDraftTransactions = [transactions, optimisticTransactions];

    return optimisticDraftTransactions as [Transaction[], Array<OnyxEntry<Transaction>> | undefined];
};

export default useOptimisticDraftTransactions;
