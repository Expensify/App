import {deepEqual} from 'fast-equals';
import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import SafeString from '@src/utils/SafeString';
import {convertToBackendAmount, convertToDisplayString} from './CurrencyUtils';
import Parser from './Parser';
import {getCommaSeparatedTagNameWithSanitizedColons} from './PolicyUtils';
import {getIOUActionForReportID} from './ReportActionsUtils';
import {getReportName} from './ReportNameUtils';
import {findSelfDMReportID, getReportOrDraftReport, getTransactionDetails, isIOUReport} from './ReportUtils';
import type {TransactionDetails} from './ReportUtils';
import StringUtils from './StringUtils';
import {
    calculateTaxAmount,
    getAmount,
    getAttendeesListDisplayString,
    getCurrency,
    getReimbursable,
    getTaxName,
    getWaypoints,
    isDistanceRequest,
    isExpenseSplit,
    isFetchingWaypointsFromServer,
    isFromCreditCardImport,
    isMerchantMissing,
    isPerDiemRequest,
    isScanning,
    isTransactionPendingDelete,
} from './TransactionUtils';

const RECEIPT_SOURCE_URL = 'https://www.expensify.com/receipts/';

// Define the specific merge fields we want to handle
const MERGE_FIELDS = ['amount', 'merchant', 'created', 'category', 'tag', 'description', 'taxValue', 'reimbursable', 'billable', 'attendees', 'reportID'] as const;
// Some fields are dependant on others. We need to automatically derive the correct field values depending on user selection.
const DERIVED_MERGE_FIELDS = [...MERGE_FIELDS, 'taxCode', 'taxAmount'] as const;
type MergeFieldKey = TupleToUnion<typeof MERGE_FIELDS>;
type MergeFieldOption = {
    transaction: Transaction;
    displayValue: string;
    isSelected: boolean;
};

type MergeFieldData = {
    field: MergeFieldKey;
    label: string;
    options: MergeFieldOption[];
};

/** Type for merge transaction values that can be null to clear existing values in Onyx */
type MergeTransactionUpdateValues = Partial<Record<keyof MergeTransaction, MergeTransaction[keyof MergeTransaction] | null>>;

const MERGE_FIELD_TRANSLATION_KEYS = {
    amount: 'iou.amount',
    merchant: 'common.merchant',
    category: 'common.category',
    tag: 'common.tag',
    description: 'common.description',
    reimbursable: 'common.reimbursable',
    billable: 'common.billable',
    created: 'common.date',
    attendees: 'iou.attendees',
    reportID: 'common.report',
    taxValue: 'iou.taxRate',
} as const;

function getMergeFieldErrorText(translate: LocaleContextProps['translate'], mergeField: MergeFieldData) {
    if (mergeField.field === 'attendees') {
        return translate('transactionMerge.detailsPage.pleaseSelectAttendees');
    }

    return translate('transactionMerge.detailsPage.pleaseSelectError', {field: mergeField.label.toLowerCase()});
}

/**
 * Fills the receipt.source for a transaction if it's missing
 * Workaround while wait BE to fix the receipt.source
 * @param transaction - The transaction to update the receipt source for
 * @returns The updated transaction with receipt.source filled if it was missing
 */
function fillMissingReceiptSource(transaction: Transaction) {
    // If receipt.source already exists, no need to modify
    if (!transaction.receipt || !!transaction.receipt.source || !transaction.receipt.filename) {
        return transaction;
    }

    return {
        ...transaction,
        receipt: {
            ...transaction.receipt,
            source: `${RECEIPT_SOURCE_URL}${transaction.receipt.filename}`,
        },
    };
}

const getTransactionFromMergeTransaction = (mergeTransaction: OnyxEntry<MergeTransaction>, transactionID: string) => {
    if (!mergeTransaction?.eligibleTransactions) {
        return undefined;
    }
    const transaction = mergeTransaction.eligibleTransactions.find((eligibleTransaction) => eligibleTransaction.transactionID === transactionID);
    return transaction ? fillMissingReceiptSource(transaction) : transaction;
};

/**
 * Check if the user should navigate to the receipt review page
 * @param transactions - array of target and source transactions
 * @returns True if both transactions have a receipt
 */
function shouldNavigateToReceiptReview(transactions: Array<OnyxEntry<Transaction>>): boolean {
    // Distance request's amount/currency/receipt depend on merchant selection
    return transactions.every((transaction) => !isDistanceRequest(transaction) && transaction?.receipt?.receiptID);
}

// Check if whether merge value is truly "empty" (null, undefined, empty string, or empty array)
// For boolean fields, false is a valid value, not an empty value
function isEmptyMergeValue(value: unknown) {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * Get the value of a specific merge field from a transaction
 * @param transactionDetails - The transaction details to extract the field value from
 * @param transaction - The transaction to extract the field value from
 * @param field - The merge field key to get the value for
 * @returns The value of the specified field from the transaction
 */
function getMergeFieldValue(transactionDetails: TransactionDetails | undefined, transaction: OnyxEntry<Transaction>, field: MergeFieldKey) {
    if (!transactionDetails || !transaction) {
        return '';
    }

    if (field === 'description') {
        return transactionDetails.comment;
    }
    if (field === 'reimbursable') {
        return getReimbursable(transaction);
    }
    if (field === 'reportID') {
        return transaction.reportID;
    }
    if (field === 'merchant' && isMerchantMissing(transaction)) {
        return '';
    }
    if (field === 'taxValue') {
        return transaction.taxValue;
    }

    return transactionDetails[field];
}

/**
 * Get the translation key for a specific merge field
 * @param field - The merge field key to get the translation key for
 * @returns The translation key string for the specified field
 */
function getMergeFieldTranslationKey(field: MergeFieldKey) {
    return MERGE_FIELD_TRANSLATION_KEYS[field];
}

function getMergeFields(targetTransaction: OnyxEntry<Transaction>) {
    const excludeFields: MergeFieldKey[] = [];

    // Distance request's amount/currency/receipt depend on merchant selection
    if (isDistanceRequest(targetTransaction)) {
        excludeFields.push('amount');
    }

    return MERGE_FIELDS.filter((field) => !excludeFields.includes(field));
}

function getTransactionsAndReportsFromSearch(
    searchResults: SearchResults,
    transactionIDs: string[],
): {
    transactions: Transaction[];
    reports: Report[];
    policies: Policy[];
} {
    const transaction1 = searchResults.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`];
    const transaction2 = searchResults.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`];
    const policyID1 = searchResults.data[`${ONYXKEYS.COLLECTION.REPORT}${transaction1?.reportID}`]?.policyID;
    const policyID2 = searchResults.data[`${ONYXKEYS.COLLECTION.REPORT}${transaction2?.reportID}`]?.policyID;

    return {
        transactions: [transaction1, transaction2].filter((transaction) => !!transaction),
        reports: [searchResults.data[`${ONYXKEYS.COLLECTION.REPORT}${transaction1?.reportID}`], searchResults.data[`${ONYXKEYS.COLLECTION.REPORT}${transaction2?.reportID}`]].filter(
            (report) => !!report,
        ),
        policies: [searchResults.data[`${ONYXKEYS.COLLECTION.POLICY}${policyID1}`], searchResults.data[`${ONYXKEYS.COLLECTION.POLICY}${policyID2}`]].filter((policy) => !!policy),
    };
}

/**
 * Get mergeableData data if one is missing, and conflict fields that need to be resolved by the user
 * @param targetTransaction - The target transaction
 * @param sourceTransaction - The source transaction
 * @param localeCompare - The localize compare function
 * @param searchReports - The search reports to use for report name lookup
 * @param targetTransactionPolicy - The policy of the target transaction
 * @param sourceTransactionPolicy - The policy of the source transaction
 * @returns mergeableData and conflictFields
 */
function getMergeableDataAndConflictFields(
    targetTransaction: OnyxEntry<Transaction>,
    sourceTransaction: OnyxEntry<Transaction>,
    localeCompare: LocaleContextProps['localeCompare'],
    searchReports: Array<OnyxEntry<Report>> = [],
    targetTransactionPolicy?: OnyxEntry<Policy>,
    sourceTransactionPolicy?: OnyxEntry<Policy>,
) {
    const conflictFields: string[] = [];
    const mergeableData: Record<string, unknown> = {};

    const targetTransactionDetails = getTransactionDetails(targetTransaction);
    const sourceTransactionDetails = getTransactionDetails(sourceTransaction);

    for (const field of getMergeFields(targetTransaction)) {
        const targetValue = getMergeFieldValue(targetTransactionDetails, targetTransaction, field);
        const sourceValue = getMergeFieldValue(sourceTransactionDetails, sourceTransaction, field);

        const isTargetValueEmpty = isEmptyMergeValue(targetValue);
        const isSourceValueEmpty = isEmptyMergeValue(sourceValue);

        if (field === 'amount') {
            // If target transaction is a card or split expense, always preserve the target transaction's amount and currency
            // Card takes precedence over split expense
            // See https://github.com/Expensify/App/issues/68189#issuecomment-3167156907
            const isTargetExpenseSplit = isExpenseSplit(targetTransaction);
            if (isFromCreditCardImport(targetTransaction) || isTargetExpenseSplit) {
                mergeableData[field] = targetValue;
                mergeableData.currency = getCurrency(targetTransaction);
                if (isTargetExpenseSplit) {
                    mergeableData.originalTransactionID = targetTransaction?.comment?.originalTransactionID;
                }
                continue;
            }

            // When one of the selected expenses has a $0 amount, we should automatically select the non-zero amount.
            if (targetValue === 0 || sourceValue === 0) {
                mergeableData[field] = sourceValue === 0 ? targetValue : sourceValue;
                mergeableData.currency = sourceValue === 0 ? getCurrency(targetTransaction) : getCurrency(sourceTransaction);
                continue;
            }

            // Check for currency differences when values equal
            if (targetValue === sourceValue && getCurrency(targetTransaction) !== getCurrency(sourceTransaction)) {
                conflictFields.push(field);
                continue;
            }

            // When the values are the same and the currencies are the same, we should merge the values
            if (targetValue === sourceValue && getCurrency(targetTransaction) === getCurrency(sourceTransaction)) {
                mergeableData[field] = targetValue;
                mergeableData.currency = getCurrency(targetTransaction);
                continue;
            }
        }

        // We allow user to select unreported report
        if (field === 'reportID') {
            if (targetValue === sourceValue) {
                const updatedValues = getMergeFieldUpdatedValues({transaction: targetTransaction, field, fieldValue: SafeString(targetValue), searchReports});
                Object.assign(mergeableData, updatedValues);
            } else {
                conflictFields.push(field);
            }
            continue;
        }

        // Use the reimbursable flag coming from card transactions automatically
        // See https://github.com/Expensify/App/issues/69598
        if (field === 'reimbursable' && isFromCreditCardImport(targetTransaction)) {
            mergeableData[field] = targetValue;
            continue;
        }

        if (field === 'attendees') {
            const targetAttendeeLogins = ((targetValue as Attendee[] | undefined)?.map((attendee) => attendee.login ?? attendee.email) ?? []).sort(localeCompare);
            const sourceAttendeeLogins = ((sourceValue as Attendee[] | undefined)?.map((attendee) => attendee.login ?? attendee.email) ?? []).sort(localeCompare);

            if (isTargetValueEmpty || isSourceValueEmpty || deepEqual(targetAttendeeLogins, sourceAttendeeLogins)) {
                mergeableData[field] = isTargetValueEmpty ? sourceValue : targetValue;
            } else {
                conflictFields.push(field);
            }
            continue;
        }

        if (isTargetValueEmpty || isSourceValueEmpty || targetValue === sourceValue) {
            if (field === 'taxValue' && isTargetValueEmpty) {
                continue;
            }
            const selectedTransaction = isTargetValueEmpty ? sourceTransaction : targetTransaction;
            const selectedFieldValue = isTargetValueEmpty ? sourceValue : targetValue;
            const selectedPolicy = isTargetValueEmpty ? sourceTransactionPolicy : targetTransactionPolicy;
            const updatedValues = getMergeFieldUpdatedValues({
                transaction: selectedTransaction,
                field,
                fieldValue: selectedFieldValue as MergeTransaction[typeof field],
                mergeTransaction: mergeableData as MergeTransaction,
                searchReports,
                policy: selectedPolicy,
            });
            Object.assign(mergeableData, updatedValues);
        } else {
            conflictFields.push(field);
        }
    }
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
    if (transaction?.transactionThreadReportID) {
        return transaction.transactionThreadReportID;
    }
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
            customUnit: mergeTransaction.customUnit,
            waypoints: mergeTransaction.waypoints,
            attendees: mergeTransaction.attendees,
        },
        reimbursable: mergeTransaction.reimbursable,
        billable: mergeTransaction.billable,
        receipt: mergeTransaction.receipt,
        created: mergeTransaction.created,
        modifiedCreated: mergeTransaction.created,
        reportID: mergeTransaction.reportID,
        reportName: mergeTransaction.reportName,
        routes: mergeTransaction.routes,
        taxValue: mergeTransaction.taxValue,
        taxAmount: mergeTransaction.taxAmount,
        taxCode: mergeTransaction.taxCode,
        taxName: mergeTransaction.taxName,
    };
}

/**
 * Determines whether two transactions can be merged together.
 */
function areTransactionsEligibleForMerge(transaction1: OnyxEntry<Transaction>, transaction2: OnyxEntry<Transaction>) {
    // Both transactions are required
    if (!transaction1 || !transaction2) {
        return false;
    }

    // Do not allow merging transactions that are pending delete
    if (isTransactionPendingDelete(transaction1) || isTransactionPendingDelete(transaction2)) {
        return false;
    }

    if (isScanning(transaction1) || isScanning(transaction2)) {
        return false;
    }

    if (isFetchingWaypointsFromServer(transaction1) || isFetchingWaypointsFromServer(transaction2)) {
        return false;
    }

    // Do not allow merging two card transactions
    if (isFromCreditCardImport(transaction1) && isFromCreditCardImport(transaction2)) {
        return false;
    }

    // Do not allow merging two split expenses
    if (isExpenseSplit(transaction1) && isExpenseSplit(transaction2)) {
        return false;
    }

    // Do not allow merging two $0 transactions
    if (getAmount(transaction1, false, false) === 0 && getAmount(transaction2, false, false) === 0) {
        return false;
    }

    // Do not allow merging a per diem and a card transaction
    if ((isPerDiemRequest(transaction1) && isFromCreditCardImport(transaction2)) || (isPerDiemRequest(transaction2) && isFromCreditCardImport(transaction1))) {
        return false;
    }

    if (isIOUReport(transaction1?.reportID) || isIOUReport(transaction2?.reportID)) {
        return false;
    }

    if (isDistanceRequest(transaction1) !== isDistanceRequest(transaction2)) {
        return false;
    }

    return true;
}

/**
 * Determines the correct target and source transactions for merging based on transaction types.
 *
 * Rules:
 * - The target transaction (transaction to keep) is selected based on the following priority: card transaction > split expense > cash transaction
 * - Users cannot merge two card expenses
 * - Users cannot merge two split expenses
 * - Users can merge any other combinations
 *
 * @param targetTransaction - The transaction where the merge action is started from
 * @param sourceTransaction - The selected transaction to be merged with the target transaction
 * @param targetTransactionPolicy - The policy of the target transaction
 * @param sourceTransactionPolicy - The policy of the source transaction
 * @returns An object containing the determined targetTransaction and sourceTransaction, targetTransactionPolicy and sourceTransactionPolicy
 */
function selectTargetAndSourceTransactionsForMerge(
    targetTransaction: OnyxEntry<Transaction>,
    sourceTransaction: OnyxEntry<Transaction>,
    targetTransactionPolicy?: Policy,
    sourceTransactionPolicy?: Policy,
) {
    // If target transaction is a card or split expense, always preserve the target transaction
    // Card takes precedence over split expense
    if (isFromCreditCardImport(sourceTransaction) || (isExpenseSplit(sourceTransaction) && !isFromCreditCardImport(targetTransaction))) {
        return {
            targetTransaction: sourceTransaction,
            sourceTransaction: targetTransaction,
            targetTransactionPolicy: sourceTransactionPolicy,
            sourceTransactionPolicy: targetTransactionPolicy,
        };
    }

    return {targetTransaction, sourceTransaction, targetTransactionPolicy, sourceTransactionPolicy};
}

/**
 * Get display value for merge transaction field
 * @param field - The merge field key to get display value for
 * @param transaction - The transaction to get the field value from
 * @param policy - The policy that the transaction belongs to
 * @param translate - The translation function
 * @returns The formatted display string for the field value
 */
function getDisplayValue(field: MergeFieldKey, transaction: Transaction, policy: Policy | undefined, translate: LocaleContextProps['translate'], reports?: Array<OnyxEntry<Report>>): string {
    const fieldValue = getMergeFieldValue(getTransactionDetails(transaction), transaction, field);

    if (isEmptyMergeValue(fieldValue) || fieldValue === undefined) {
        return '';
    }
    if (typeof fieldValue === 'boolean') {
        return fieldValue ? translate('common.yes') : translate('common.no');
    }
    if (field === 'amount') {
        return convertToDisplayString(Number(fieldValue), getCurrency(transaction));
    }
    if (field === 'description') {
        return StringUtils.lineBreaksToSpaces(Parser.htmlToText(SafeString(fieldValue)));
    }
    if (field === 'tag') {
        return getCommaSeparatedTagNameWithSanitizedColons(SafeString(fieldValue));
    }
    if (field === 'reportID') {
        if (fieldValue === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return translate('common.none');
        }

        if (transaction?.reportName === '') {
            return translate('common.none');
        }

        return transaction?.reportName ?? getReportName(getReportOrDraftReport(SafeString(fieldValue), reports));
    }
    if (field === 'attendees') {
        return Array.isArray(fieldValue) ? getAttendeesListDisplayString(fieldValue) : '';
    }

    if (field === 'taxValue') {
        return getTaxName(policy, transaction) ?? transaction.taxValue ?? '';
    }

    return SafeString(fieldValue);
}
/**
 * Build merge fields data array from conflict fields for UI display
 * @param conflictFields - Array of field keys that have conflicts
 * @param targetTransaction - The target transaction
 * @param sourceTransaction - The source transaction
 * @param mergeTransaction - The current merge transaction state
 * @param translate - The translation function
 * @returns Array of merge field data for UI rendering
 */
function buildMergeFieldsData(
    conflictFields: MergeFieldKey[],
    targetTransaction: Transaction | undefined,
    sourceTransaction: Transaction | undefined,
    mergeTransaction: MergeTransaction | null | undefined,
    targetTransactionPolicy: Policy | undefined,
    sourceTransactionPolicy: Policy | undefined,
    translate: LocaleContextProps['translate'],
    reports: Array<OnyxEntry<Report>> = [],
): MergeFieldData[] {
    if (!targetTransaction || !sourceTransaction) {
        return [];
    }

    return conflictFields.map((field) => {
        const label = translate(getMergeFieldTranslationKey(field) as TranslationPaths);
        const selectedTransactionId = mergeTransaction?.selectedTransactionByField?.[field];

        // Create options for this field
        const options: MergeFieldOption[] = [
            {
                transaction: targetTransaction,
                displayValue: getDisplayValue(field, targetTransaction, targetTransactionPolicy, translate, reports),
                isSelected: selectedTransactionId === targetTransaction.transactionID,
            },
            {
                transaction: sourceTransaction,
                displayValue: getDisplayValue(field, sourceTransaction, sourceTransactionPolicy, translate, reports),
                isSelected: selectedTransactionId === sourceTransaction.transactionID,
            },
        ];

        return {
            field,
            label,
            options,
        };
    });
}
type GetMergeFieldUpdatedValuesParams<K extends MergeFieldKey> = {
    transaction: OnyxEntry<Transaction>;
    field: K;
    fieldValue: MergeTransaction[K];
    mergeTransaction?: OnyxEntry<MergeTransaction>;
    searchReports?: Array<OnyxEntry<Report>>;
    policy?: OnyxEntry<Policy>;
};

/**
 * Build updated values for merge transaction field selection
 * Handles special cases like currency for amount field, report name, tax value and additional fields for distance requests
 */
function getMergeFieldUpdatedValues<K extends MergeFieldKey>({
    transaction,
    field,
    fieldValue,
    mergeTransaction,
    searchReports,
    policy,
}: GetMergeFieldUpdatedValuesParams<K>): MergeTransactionUpdateValues {
    const updatedValues: MergeTransactionUpdateValues = {
        [field]: fieldValue,
    };

    if (field === 'amount') {
        updatedValues.currency = getCurrency(transaction);
        if (mergeTransaction?.taxValue && transaction?.amount) {
            updatedValues.taxAmount = convertToBackendAmount(calculateTaxAmount(mergeTransaction?.taxValue, transaction.amount, getCurrency(transaction)));
        }
    }

    if (field === 'reportID') {
        const reportName = transaction?.reportName?.length ? transaction?.reportName : getReportName(getReportOrDraftReport(getReportIDForExpense(transaction), searchReports));
        updatedValues.reportName = reportName.length ? reportName : null;
    }

    if (field === 'merchant' && isDistanceRequest(transaction)) {
        const transactionDetails = getTransactionDetails(transaction);
        updatedValues.amount = getMergeFieldValue(transactionDetails, transaction, 'amount') as number;
        updatedValues.currency = getCurrency(transaction);
        updatedValues.customUnit = transaction?.comment?.customUnit;
        updatedValues.iouRequestType = transaction?.iouRequestType;
        // For manual distance requests, set waypoints/routes and receipt to null to clear any existing values
        updatedValues.receipt = transaction?.receipt ?? null;
        updatedValues.waypoints = getWaypoints(transaction) ?? null;
        updatedValues.routes = transaction?.routes ?? null;
    }

    if (field === 'taxValue') {
        updatedValues.taxCode = transaction?.taxCode;
        updatedValues.taxName = getTaxName(policy, transaction) ?? transaction?.taxValue ?? '';
        if (mergeTransaction?.amount) {
            updatedValues.taxAmount = convertToBackendAmount(calculateTaxAmount(transaction?.taxValue, mergeTransaction.amount, mergeTransaction.currency));
        }
    }

    return updatedValues;
}

function getRateFromMerchant(merchant: string | undefined): string {
    if (!merchant) {
        return '';
    }

    return merchant.split(CONST.DISTANCE_MERCHANT_SEPARATOR).at(-1)?.trim() ?? '';
}

export {
    getTransactionFromMergeTransaction,
    shouldNavigateToReceiptReview,
    getMergeableDataAndConflictFields,
    getMergeFieldValue,
    getMergeFieldTranslationKey,
    buildMergedTransactionData,
    selectTargetAndSourceTransactionsForMerge,
    isEmptyMergeValue,
    fillMissingReceiptSource,
    getTransactionThreadReportID,
    getDisplayValue,
    buildMergeFieldsData,
    getReportIDForExpense,
    getMergeFieldUpdatedValues,
    getMergeFieldErrorText,
    areTransactionsEligibleForMerge,
    DERIVED_MERGE_FIELDS,
    getRateFromMerchant,
    getTransactionsAndReportsFromSearch,
    MERGE_FIELDS,
};

export type {MergeFieldKey, MergeFieldData, MergeTransactionUpdateValues};
