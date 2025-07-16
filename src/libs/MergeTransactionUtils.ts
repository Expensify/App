import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import type {MergeTransaction, Transaction} from '@src/types/onyx';
import {getAmount, getBillable, getCategory, getDescription, getMerchant, getReimbursable, getTag} from './TransactionUtils';

// Define the specific merge fields we want to handle
const MERGE_FIELDS = ['amount', 'merchant', 'category', 'tag', 'description', 'reimbursable', 'billable'] as const;
type MergeFieldKey = TupleToUnion<typeof MERGE_FIELDS>;
type MergeValueType = string | number | boolean;

const MERGE_FIELDS_UTILS = {
    amount: {
        translationKey: 'iou.amount',
        getDataFn: getAmount,
    },
    merchant: {
        translationKey: 'common.merchant',
        getDataFn: getMerchant,
    },
    category: {
        translationKey: 'common.category',
        getDataFn: getCategory,
    },
    tag: {
        translationKey: 'common.tag',
        getDataFn: getTag,
    },
    description: {
        translationKey: 'common.description',
        getDataFn: getDescription,
    },
    reimbursable: {
        translationKey: 'common.reimbursable',
        getDataFn: getReimbursable,
    },
    billable: {
        translationKey: 'common.billable',
        getDataFn: getBillable,
    },
};

/**
 * Get the source transaction from a merge transaction
 * @param mergeTransaction - The merge transaction to get the source transaction from
 * @returns The source transaction or null if it doesn't exist
 */
const getSourceTransaction = (mergeTransaction: OnyxEntry<MergeTransaction>) => {
    if (!mergeTransaction?.sourceTransactionID) {
        return undefined;
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
 * Get the value of a specific merge field from a transaction
 * @param transaction - The transaction to extract the field value from
 * @param field - The merge field key to get the value for
 * @returns The value of the specified field from the transaction
 */
function getMergeFieldValue(transaction: OnyxEntry<Transaction>, field: MergeFieldKey) {
    if (!transaction) {
        return '';
    }
    return MERGE_FIELDS_UTILS[field].getDataFn(transaction);
}

/**
 * Get the translation key for a specific merge field
 * @param field - The merge field key to get the translation key for
 * @returns The translation key string for the specified field
 */
function getMergeFieldTransalationKey(field: MergeFieldKey) {
    return MERGE_FIELDS_UTILS[field].translationKey;
}

/**
 * Get mergable data if one is missing, and conflict fields that need to be resolved by the user
 * @param transactionID - The merge transaction id
 * @param targetTransaction - The target transaction
 * @param sourceTransaction - The source transaction
 * @returns mergeableData and conflictFields
 */
function getMergeableDataAndConflictFields(transactionID: string, targetTransaction: OnyxEntry<Transaction>, sourceTransaction: OnyxEntry<Transaction>) {
    const conflictFields: string[] = [];
    const mergeableData: Record<string, unknown> = {};

    MERGE_FIELDS.forEach((field) => {
        const targetValue = getMergeFieldValue(targetTransaction, field);
        const sourceValue = getMergeFieldValue(sourceTransaction, field);

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

export {getSourceTransaction, shouldNavigateToReceiptReview, getMergeableDataAndConflictFields, getMergeFieldValue, getMergeFieldTransalationKey};
export type {MergeFieldKey, MergeValueType};
