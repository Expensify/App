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

/**
 * Get mergable data if one is missing, and conflict fields that need to be resolved by the user
 * @param transactionID - The merge transaction id
 * @param targetTransaction - The target transaction
 * @param sourceTransaction - The source transaction
 * @param fields - Array of field definitions {key, label}
 * @returns mergeableData and conflictFields
 */
function getMergeableDataAndConflictFields(transactionID: string, targetTransaction: Transaction, sourceTransaction: Transaction, fields: Array<keyof MergeTransaction>) {
    const conflictFields: string[] = [];
    const mergeableData: Record<string, unknown> = {};

    fields.forEach((field) => {
        const targetValue = targetTransaction[field as keyof Transaction];
        const sourceValue = sourceTransaction[field as keyof Transaction];

        if (!targetValue || !sourceValue || targetValue === sourceValue) {
            // We use the logical OR (||) here instead of ?? because some fields can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            mergeableData[field] = targetValue || sourceValue;
        } else {
            conflictFields.push(field);
        }
    });

    return {mergeableData, conflictFields};
}

export {getSourceTransaction, shouldNavigateToReceiptReview, getMergeableDataAndConflictFields};
