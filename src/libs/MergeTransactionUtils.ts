import type {OnyxEntry} from 'react-native-onyx';
import type {MergeTransaction, Transaction} from '@src/types/onyx';

/**
 * Get the source transaction from a merge transaction
 * @param mergeTransaction - The merge transaction to get the source transaction from
 * @returns The source transaction or null if it doesn't exist
 */
const getSourceTransaction = (mergeTransaction: OnyxEntry<MergeTransaction>) => {
    if (!mergeTransaction?.sourceTransactionID) {
        return null;
    }

    return mergeTransaction.eligibleTransactions?.find((transaction) => transaction.transactionID === mergeTransaction.sourceTransactionID);
};

/**
 * Check if the user should navigate to the receipt review page
 * @param transactions - array of target and source transactions
 * @returns True if both transactions have a receipt
 */
function shouldNavigateToReceiptReview(transactions: Array<OnyxEntry<Transaction>>): boolean {
    return transactions.every((transaction) => transaction?.receipt?.receiptID);
}

export {getSourceTransaction, shouldNavigateToReceiptReview};
