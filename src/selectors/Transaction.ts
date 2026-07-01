import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type TransactionType from '@src/types/onyx/Transaction';

/** Resolves the original (container) transaction ID that a split child points to. */
const originalTransactionIDSelector = (transaction: OnyxEntry<TransactionType>): string | undefined => transaction?.comment?.originalTransactionID;

const transactionsByReportIDSelector = (transactions: OnyxCollection<TransactionType>): Record<string, TransactionType[]> => {
    const result: Record<string, TransactionType[]> = {};
    if (!transactions) {
        return result;
    }
    for (const transaction of Object.values(transactions)) {
        if (!transaction?.reportID) {
            continue;
        }
        (result[transaction.reportID] ??= []).push(transaction);
    }
    return result;
};
export {transactionsByReportIDSelector, originalTransactionIDSelector};
