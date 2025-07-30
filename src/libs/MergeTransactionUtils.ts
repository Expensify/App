import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import CONST from '@src/CONST';
import type {MergeTransaction, Transaction} from '@src/types/onyx';
import {getIOUActionForReportID} from './ReportActionsUtils';
import {findSelfDMReportID} from './ReportUtils';
import {getAmount, getBillable, getCategory, getCurrency, getDescription, getMerchant, getReimbursable, getTag, isCardTransaction} from './TransactionUtils';

const RECEIPT_SOURCE_URL = 'https://www.expensify.com/receipts/';

// Define the specific merge fields we want to handle
const MERGE_FIELDS = ['amount', 'currency', 'merchant', 'category', 'tag', 'description', 'reimbursable', 'billable'] as const;
type MergeFieldKey = TupleToUnion<typeof MERGE_FIELDS>;
type MergeValueType = string | number | boolean;
type MergeValue = {
    value: MergeValueType;
    currency?: string;
};

const MERGE_FIELDS_UTILS = {
    amount: {
        translationKey: 'iou.amount',
        getDataFn: (transaction: Transaction, isFromExpenseReport: boolean) => getAmount(transaction, isFromExpenseReport),
    },
    currency: {
        translationKey: 'iou.currency',
        getDataFn: getCurrency,
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
 * Fills the receipt.source for a transaction if it's missing
 * Workaround while wait BE to fix the receipt.source
 * @param transaction - The transaction to update the receipt source for
 * @returns The updated transaction with receipt.source filled if it was missing
 */
function fillMissingReceiptSource(transaction: Transaction) {
    // If receipt.source already exists, no need to modify
    if (!transaction.receipt || !!transaction.receipt?.source || !transaction.filename) {
        return transaction;
    }

    return {
        ...transaction,
        receipt: {
            ...transaction.receipt,
            source: `${RECEIPT_SOURCE_URL}${transaction.filename}`,
        },
    };
}

/**
 * Get the source transaction from a merge transaction
 * @param mergeTransaction - The merge transaction to get the source transaction from
 * @returns The source transaction or null if it doesn't exist
 */
const getSourceTransaction = (mergeTransaction: OnyxEntry<MergeTransaction>) => {
    if (!mergeTransaction?.sourceTransactionID) {
        return undefined;
    }

    const sourceTransaction = mergeTransaction.eligibleTransactions?.find((transaction) => transaction.transactionID === mergeTransaction.sourceTransactionID);
    return sourceTransaction ? fillMissingReceiptSource(sourceTransaction) : sourceTransaction;
};

/**
 * Check if the user should navigate to the receipt review page
 * @param transactions - array of target and source transactions
 * @returns True if both transactions have a receipt
 */
function shouldNavigateToReceiptReview(transactions: Array<OnyxEntry<Transaction>>): boolean {
    return transactions.every((transaction) => transaction?.receipt?.receiptID);
}

// Check if either value is truly "empty" (null, undefined, or empty string)
// For boolean fields, false is a valid value, not an empty value
function isEmptyMergeValue(value: unknown) {
    return value === null || value === undefined || value === '';
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

    // Handle amount field separately as it requires the second parameter
    if (field === 'amount') {
        const isUnreportedExpense = !transaction?.reportID || transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        return MERGE_FIELDS_UTILS[field].getDataFn(transaction, !isUnreportedExpense);
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
        // Currency field is handled by the amount field
        if (field === 'currency') {
            return;
        }

        const targetValue = getMergeFieldValue(targetTransaction, field);
        const sourceValue = getMergeFieldValue(sourceTransaction, field);

        const isTargetValueEmpty = isEmptyMergeValue(targetValue);
        const isSourceValueEmpty = isEmptyMergeValue(sourceValue);

        if (isTargetValueEmpty || isSourceValueEmpty || targetValue === sourceValue) {
            if (field === 'amount' && getMergeFieldValue(targetTransaction, 'currency') !== getMergeFieldValue(sourceTransaction, 'currency')) {
                conflictFields.push('amount');
            } else {
                mergeableData[field] = isTargetValueEmpty ? sourceValue : targetValue;
            }
        } else {
            conflictFields.push(field);
        }
    });

    return {mergeableData, conflictFields};
}

/**
 * Get the report ID for an expense, if it's unreported, we'll return the self DM report ID
 */
function getReportIDForExpense(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return undefined;
    }

    const isUnreportedExpense = !transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    if (isUnreportedExpense) {
        return findSelfDMReportID();
    }

    return transaction.reportID;
}

/**
 * Get the report ID for the transaction thread of a transaction
 * @param transaction - The transaction to get the report ID for
 * @returns The report ID for the transaction thread
 */
function getTransactionThreadReportID(transaction: OnyxEntry<Transaction>) {
    const iouActionOfTargetTransaction = getIOUActionForReportID(getReportIDForExpense(transaction), transaction?.transactionID);
    return iouActionOfTargetTransaction?.childReportID;
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
        modifiedCurrency: mergeTransaction.currency,
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
        filename: mergeTransaction.receipt?.source?.split('/').pop(),
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
    isEmptyMergeValue,
    fillMissingReceiptSource,
    getTransactionThreadReportID,
};

export type {MergeFieldKey, MergeValueType, MergeValue};
