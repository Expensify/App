import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import type {MergeTransaction, Transaction} from '@src/types/onyx';
import {getAmount, getBillable, getCategory, getDescription, getMerchant, getReimbursable, getTag, isCardTransaction} from './TransactionUtils';

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
function getMergeFieldTranslationKey(field: MergeFieldKey) {
    return MERGE_FIELDS_UTILS[field].translationKey;
}

/**
 * Get mergeableData data if one is missing, and conflict fields that need to be resolved by the user
 * @param targetTransaction - The target transaction
 * @param sourceTransaction - The source transaction
 * @returns mergeableData and conflictFields
 */
function getMergeableDataAndConflictFields(targetTransaction: OnyxEntry<Transaction>, sourceTransaction: OnyxEntry<Transaction>) {
    const conflictFields: string[] = [];
    const mergeableData: Record<string, unknown> = {};

    MERGE_FIELDS.forEach((field) => {
        const targetValue = getMergeFieldValue(targetTransaction, field);
        const sourceValue = getMergeFieldValue(sourceTransaction, field);

        // Check if either value is truly "empty" (null, undefined, or empty string)
        // For boolean fields, false is a valid value, not an empty value
        const isTargetValueEmpty = targetValue === null || targetValue === undefined || targetValue === '';
        const isSourceValueEmpty = sourceValue === null || sourceValue === undefined || sourceValue === '';

        if (isTargetValueEmpty || isSourceValueEmpty || targetValue === sourceValue) {
            mergeableData[field] = isTargetValueEmpty ? sourceValue : targetValue;
        } else {
            conflictFields.push(field);
        }
    });

    return {mergeableData, conflictFields};
}

/**
 * Build the merged transaction data for display by combining target transaction with merge transaction updates
 * @param targetTransaction - The target transaction to merge into
 * @param mergeTransaction - The merge transaction containing the updates
 * @returns The merged transaction data or null if required data is missing
 */
function buildMergedTransactionData(targetTransaction: OnyxEntry<Transaction>, mergeTransaction: OnyxEntry<MergeTransaction>): Transaction | null {
    if (!targetTransaction || !mergeTransaction) {
        return null;
    }

    return {
        ...targetTransaction,
        amount: mergeTransaction.amount,
        modifiedAmount: mergeTransaction.amount,
        merchant: mergeTransaction.merchant,
        modifiedMerchant: mergeTransaction.merchant,
        category: mergeTransaction.category,
        tag: mergeTransaction.tag,
        comment: {
            ...targetTransaction.comment,
            comment: mergeTransaction.description,
        },
        reimbursable: mergeTransaction.reimbursable,
        billable: mergeTransaction.billable,
        receipt: mergeTransaction.receipt,
    };
}

/**
 * Determines the correct target and source transaction IDs for merging based on transaction types.
 *
 * Rules:
 * - If one transaction is a card transaction, it becomes the target (card transactions take priority)
 * - If both are cash transactions, the first parameter becomes the target
 * - Users can only merge two cash expenses or one cash/one card expense
 * - Users cannot merge two card expenses
 *
 * @param targetTransaction - The first transaction in the merge operation
 * @param sourceTransaction - The second transaction in the merge operation
 * @returns An object containing the determined targetTransactionID and sourceTransactionID
 */
function selectTargetAndSourceTransactionIDsForMerge(originalTargetTransaction: OnyxEntry<Transaction>, originalSourceTransaction: OnyxEntry<Transaction>) {
    if (isCardTransaction(originalSourceTransaction)) {
        return {targetTransactionID: originalSourceTransaction?.transactionID, sourceTransactionID: originalTargetTransaction?.transactionID};
    }

    return {targetTransactionID: originalTargetTransaction?.transactionID, sourceTransactionID: originalSourceTransaction?.transactionID};
}

export {
    getSourceTransaction,
    shouldNavigateToReceiptReview,
    getMergeableDataAndConflictFields,
    getMergeFieldValue,
    getMergeFieldTranslationKey,
    buildMergedTransactionData,
    selectTargetAndSourceTransactionIDsForMerge,
};

export type {MergeFieldKey, MergeValueType};
