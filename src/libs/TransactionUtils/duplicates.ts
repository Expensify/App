/**
 * Helpers for reviewing and merging duplicate expenses: comparing duplicate fields, checking whether duplicates can be merged,
 * building the merge request params, and removing a transaction from duplicate-transaction violations.
 * Extracted from TransactionUtils/index.ts to keep that file smaller.
 */
import type {MergeDuplicatesParams} from '@libs/API/parameters';
import Log from '@libs/Log';
import {getTaxByID, isMultiLevelTags as isMultiLevelTagsPolicyUtils, resolveCurrentTaxCode} from '@libs/PolicyUtils';
import {getReportOrDraftReport, isOpenReport, isProcessingReport} from '@libs/ReportUtils';

import type {UpdateMoneyRequestDataKeys} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report, ReviewDuplicates, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Comment} from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {SafeString} from 'expensify-common';
import {deepEqual} from 'fast-equals';
import Onyx from 'react-native-onyx';

// This cycle import is safe because this file was extracted from TransactionUtils/index.ts, which re-exports it.
// The functions imported here are pure helpers that aren't called at initialization time.
// eslint-disable-next-line import/no-cycle
import {getAmount, getCurrency, getDescription, getFormattedCreated, getMerchant, isManagedCardTransaction} from './index';

type FieldsToCompare = Record<string, Array<keyof Transaction>>;
type FieldsToChange = {
    category?: Array<string | undefined>;
    merchant?: Array<string | undefined>;
    tag?: Array<string | undefined>;
    description?: Array<Comment | undefined>;
    taxCode?: Array<string | undefined>;
    billable?: Array<boolean | undefined>;
    reimbursable?: Array<boolean | undefined>;
};

/**
 * Extracts a set of valid duplicate transaction IDs associated with a given transaction,
 * excluding:
 * - the transaction itself
 * - duplicate IDs that appear more than once
 * - duplicates referencing missing or invalid transactions
 * - settled or approved transactions
 *
 * @param transactionID - The ID of the transaction being validated.
 * @param transactionCollection - A collection of all transactions and their duplicates.
 * @param currentTransactionViolations - The list of violations associated with this transaction.
 * @returns A set of valid duplicate transaction IDs.
 */
function getValidDuplicateTransactionIDs(transactionID: string, transactionCollection: OnyxCollection<Transaction>, currentTransactionViolations: TransactionViolation[]): Set<string> {
    const result = new Set<string>();
    const seen = new Set<string>();
    let foundDuplicateViolation = false;

    if (!transactionCollection) {
        return result;
    }

    for (const violation of currentTransactionViolations) {
        if (violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION) {
            continue;
        }

        // Skip further violations
        if (foundDuplicateViolation) {
            Log.warn(`Multiple duplicate violations found for transaction. Only one expected.`, {transactionID});
            break;
        }

        foundDuplicateViolation = true;
        const duplicatesIDs = violation.data?.duplicates ?? [];

        const validTransactions: Transaction[] = [];

        for (const duplicateID of duplicatesIDs) {
            // Skip self-reference
            if (duplicateID === transactionID || seen.has(duplicateID)) {
                continue;
            }
            seen.add(duplicateID);

            const transaction = transactionCollection?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicateID}`];
            if (!transaction?.transactionID) {
                Log.warn(`Transaction does not exist or is invalid. Found in transaction.`, {duplicateID, transactionID});
                continue;
            }

            validTransactions.push(transaction);
        }

        // Filter out transactions assumed that they have be reviewed by removing settled and approved transactions
        const filtered = removeSettledAndApprovedTransactions(validTransactions);

        for (const transaction of filtered) {
            result.add(transaction.transactionID);
        }
    }

    return result;
}

/**
 * Adds onyx updates to the passed onyxData to update the DUPLICATED_TRANSACTION violation data
 * by removing the passed transactionID from any violation that referenced it.
 * @param onyxData - An object to store optimistic and failure updates.
 * @param transactionID - The ID of the transaction being deleted or updated.
 * @param transactions - A collection of all transactions and their duplicates.
 * @param transactionViolations - The collection of the transaction violations including the duplicates violations.
 *
 */
function removeTransactionFromDuplicateTransactionViolation(
    onyxData: OnyxData<UpdateMoneyRequestDataKeys>,
    transactionID: string,
    transactions: OnyxCollection<Transaction>,
    transactionViolations: OnyxCollection<TransactionViolations>,
) {
    if (!transactionID || !transactions || !transactionViolations) {
        return;
    }
    const violations = transactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];

    if (!violations) {
        return;
    }

    const duplicateIDs = getValidDuplicateTransactionIDs(transactionID, transactions, violations);

    for (const duplicateID of duplicateIDs) {
        const duplicateViolations = transactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`];

        if (!duplicateViolations) {
            continue;
        }

        const duplicateTransactionViolations = duplicateViolations.filter((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);

        if (duplicateTransactionViolations.length === 0) {
            continue;
        }

        if (duplicateTransactionViolations.length > 1) {
            Log.warn(`There are  duplicate transaction violations for transactionID. This should not happen.`, {duplicateTransactionViolations, duplicateID});
            continue;
        }

        const duplicateTransactionViolation = duplicateTransactionViolations.at(0);
        if (!duplicateTransactionViolation?.data?.duplicates) {
            continue;
        }

        // If the transactionID is not in the duplicates list, we don't need to update the violation
        const duplicateTransactionIDs = duplicateTransactionViolation.data.duplicates.filter((duplicateTransactionID) => duplicateTransactionID !== transactionID);
        if (duplicateTransactionIDs.length === duplicateTransactionViolation.data.duplicates.length) {
            continue;
        }

        const optimisticViolations = duplicateViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION);

        if (duplicateTransactionIDs.length > 0) {
            optimisticViolations.push({
                ...duplicateTransactionViolation,
                data: {
                    ...duplicateTransactionViolation.data,
                    duplicates: duplicateTransactionIDs,
                },
            });
        }

        const cleanedValue = optimisticViolations.length > 0 ? optimisticViolations : null;

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`,
            value: cleanedValue,
        });

        // Re-apply the cleaned violations on success so that stale data from a
        // queued command (e.g. OpenReport resolving between optimistic apply and
        // the server response) doesn't re-introduce one-sided duplicate violations.
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`,
            value: cleanedValue,
        });

        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`,
            value: duplicateViolations,
        });
    }
}

/**
 * Whether a report is still editable for a duplicate merge, i.e. one that Auth's MergeTransactions command would
 * accept. A report is mergeable when it is open, awaiting first-level approval, or unresolved (unreported expenses
 * stay editable in Auth). Anything approved, closed (Submit & Close), or reimbursed is rejected server-side.
 */
function isReportMergeableForDuplicates(report: OnyxEntry<Report>): boolean {
    return !report || isOpenReport(report) || isProcessingReport(report);
}

/**
 * Keeps only transactions that Auth's MergeTransactions command would accept, so filtering here prevents sending a
 * merge request that would fail server-side.
 */
function removeSettledAndApprovedTransactions(transactions: Array<OnyxEntry<Transaction>>): Transaction[] {
    return transactions.filter((transaction) => !!transaction && isReportMergeableForDuplicates(getReportOrDraftReport(transaction.reportID))) as Transaction[];
}

/**
 * Whether a duplicate merge can be submitted. Auth's MergeTransactions rejects the merge when the kept expense's
 * report is no longer editable or when there are no duplicates left to merge, so callers should block the request
 * in those cases.
 */
function canMergeDuplicates(keptReport: OnyxEntry<Report>, transactionIDList: string[]): boolean {
    return isReportMergeableForDuplicates(keptReport) && transactionIDList.length > 0;
}

/**
 * This function compares fields of duplicate transactions and determines which fields should be kept and which should be changed.
 *
 * @returns An object with two properties: 'keep' and 'change'.
 * 'keep' is an object where each key is a field name and the value is the value of that field in the transaction that should be kept.
 * 'change' is an object where each key is a field name and the value is an array of different values of that field in the duplicate transactions.
 *
 * The function works as follows:
 * 1. It fetches the transaction violations for the given transaction ID.
 * 2. It finds the duplicate transactions.
 * 3. It creates two empty objects, 'keep' and 'change'.
 * 4. It defines the fields to compare in the transactions.
 * 5. It iterates over the fields to compare. For each field:
 *    - If the field is 'description', it checks if all comments are equal, exist, or are empty. If so, it keeps the first transaction's comment. Otherwise, it finds the different values and adds them to 'change'.
 *    - For other fields, it checks if all fields are equal. If so, it keeps the first transaction's field value. Otherwise, it finds the different values and adds them to 'change'.
 * 6. It returns the 'keep' and 'change' objects.
 */

function compareDuplicateTransactionFields(
    policyTags: PolicyTagLists,
    reviewingTransaction: OnyxEntry<Transaction>,
    duplicates: Array<OnyxEntry<Transaction>> | undefined,
    report: OnyxEntry<Report>,
    selectedTransactionID: string | undefined,
    policy: OnyxEntry<Policy>,
    policyCategories: OnyxEntry<PolicyCategories>,
): {keep: Partial<ReviewDuplicates>; change: FieldsToChange} {
    const reportID = report?.reportID;
    const reviewingTransactionID = reviewingTransaction?.transactionID;
    if (!reviewingTransactionID || !reportID) {
        return {change: {}, keep: {}};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keep: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const change: Record<string, any[]> = {};
    if (!reviewingTransactionID || !reportID) {
        return {keep, change};
    }
    const transactions = removeSettledAndApprovedTransactions([reviewingTransaction, ...(duplicates ?? [])]);

    const fieldsToCompare: FieldsToCompare = {
        merchant: ['modifiedMerchant', 'merchant'],
        category: ['category'],
        tag: ['tag'],
        description: ['comment'],
        taxCode: ['taxCode'],
        billable: ['billable'],
        reimbursable: ['reimbursable'],
    };

    // Helper function thats create an array of different values for a given key in the transactions
    function getDifferentValues(items: Array<OnyxEntry<Transaction>>, keys: Array<keyof Transaction>) {
        return [
            ...new Set(
                items
                    .map((item) => {
                        // Prioritize modifiedMerchant over merchant
                        if (keys.includes('modifiedMerchant' as keyof Transaction) && keys.includes('merchant' as keyof Transaction)) {
                            return getMerchant(item);
                        }
                        return keys.map((key) => item?.[key]);
                    })
                    .flat(),
            ),
        ];
    }

    // Helper function to check if all comments are equal
    function areAllCommentsEqual(items: Array<OnyxEntry<Transaction>>, firstTransaction: OnyxEntry<Transaction>) {
        return items.every((item) => deepEqual(getDescription(item), getDescription(firstTransaction)));
    }

    // Helper function to check if all fields are equal for a given key
    function areAllFieldsEqual(items: Array<OnyxEntry<Transaction>>, keyExtractor: (item: OnyxEntry<Transaction>) => string) {
        const firstTransaction = transactions.at(0);
        return items.every((item) => keyExtractor(item) === keyExtractor(firstTransaction));
    }

    // Helper function to process changes
    function processChanges(fieldName: string, items: Array<OnyxEntry<Transaction>>, keys: Array<keyof Transaction>) {
        const differentValues = getDifferentValues(items, keys);
        if (differentValues.length > 0) {
            change[fieldName] = differentValues;
        }
    }

    // The comment object needs to be stored only when selecting a specific transaction to keep.
    // It contains details such as 'customUnit' and 'waypoints,' which remain unchanged during the review steps
    // but are essential for displaying complete information on the confirmation page.
    if (selectedTransactionID) {
        const selectedTransaction = transactions.find((t) => t?.transactionID === selectedTransactionID);
        keep.comment = selectedTransaction?.comment ?? {};
    }

    for (const fieldName in fieldsToCompare) {
        if (Object.prototype.hasOwnProperty.call(fieldsToCompare, fieldName)) {
            const keys = fieldsToCompare[fieldName];
            const firstTransaction = transactions.at(0);
            const isFirstTransactionCommentEmptyObject = typeof firstTransaction?.comment === 'object' && firstTransaction?.comment?.comment === '';

            const areAllFieldsEqualForKey = areAllFieldsEqual(transactions, (item) => keys.map((key) => SafeString(item?.[key])).join('|'));
            if (fieldName === 'description') {
                const allCommentsAreEqual = areAllCommentsEqual(transactions, firstTransaction);
                const allCommentsAreEmpty = isFirstTransactionCommentEmptyObject && transactions.every((item) => getDescription(item) === '');
                if (allCommentsAreEqual || allCommentsAreEmpty) {
                    keep[fieldName] = firstTransaction?.comment?.comment ?? firstTransaction?.comment;
                } else {
                    processChanges(fieldName, transactions, keys);
                }
            } else if (fieldName === 'merchant') {
                if (areAllFieldsEqual(transactions, getMerchant)) {
                    keep[fieldName] = getMerchant(firstTransaction);
                } else {
                    processChanges(fieldName, transactions, keys);
                }
            } else if (fieldName === 'taxCode') {
                const differentValues = [
                    ...new Set(
                        getDifferentValues(transactions, keys).map((taxID) => {
                            if (typeof taxID !== 'string') {
                                return taxID;
                            }
                            return resolveCurrentTaxCode(policy, taxID);
                        }),
                    ),
                ];
                const validTaxes = differentValues?.filter((taxID) => {
                    if (typeof taxID !== 'string') {
                        return false;
                    }
                    const tax = getTaxByID(policy, taxID);
                    return tax?.name && !tax.isDisabled && tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                });
                const areAllTaxCodesEqual = areAllFieldsEqual(transactions, (item) => resolveCurrentTaxCode(policy, item?.taxCode ?? ''));

                if (!areAllTaxCodesEqual && validTaxes.length > 1) {
                    change[fieldName] = validTaxes;
                } else {
                    const taxCodeToKeep = firstTransaction?.taxCode;
                    keep[fieldName] = taxCodeToKeep ? resolveCurrentTaxCode(policy, taxCodeToKeep) : taxCodeToKeep;
                }
            } else if (fieldName === 'category') {
                const differentValues = getDifferentValues(transactions, keys);
                const availableCategories = Object.values(policyCategories ?? {})
                    .filter((category) => differentValues.includes(category.name) && category.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                    .map((e) => e.name);

                if (!areAllFieldsEqualForKey && policy?.areCategoriesEnabled && (availableCategories.length > 1 || (availableCategories.length === 1 && differentValues.includes('')))) {
                    change[fieldName] = [...availableCategories, ...(differentValues.includes('') ? [''] : [])];
                } else {
                    keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                }
            } else if (fieldName === 'tag') {
                const isMultiLevelTags = isMultiLevelTagsPolicyUtils(policyTags);
                if (isMultiLevelTags) {
                    if (areAllFieldsEqualForKey || !policy?.areTagsEnabled) {
                        keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                    } else {
                        processChanges(fieldName, transactions, keys);
                    }
                } else {
                    const differentValues = getDifferentValues(transactions, keys);
                    const policyTagsObj = Object.values(Object.values(policyTags).at(0)?.tags ?? {});
                    const availableTags = policyTagsObj
                        .filter((tag) => differentValues.includes(tag.name) && tag.enabled && tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                        .map((e) => e.name);
                    if (!areAllFieldsEqualForKey && policy?.areTagsEnabled && (availableTags.length > 1 || (availableTags.length === 1 && differentValues.includes('')))) {
                        change[fieldName] = [...availableTags, ...(differentValues.includes('') ? [''] : [])];
                    } else {
                        keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                    }
                }
            } else if (fieldName === 'reimbursable') {
                // Managed card transactions are always non-reimbursable. The resolved reimbursable value is applied to
                // the transaction that is kept, so we only force it to false — and hide the reimbursable review step —
                // when that kept transaction is itself a managed card. We gate on the selected (kept) transaction rather
                // than the reviewing transaction: the Review* pages recompute this from the thread's transaction (which
                // may be the cash expense) while the kept transaction is the managed card, so gating on the reviewing
                // transaction would re-add the reimbursable step on back navigation. Gating on any duplicate in the set
                // would instead wrongly convert a kept cash expense to non-reimbursable.
                const selectedTransaction = transactions.find((transactionItem) => transactionItem?.transactionID === selectedTransactionID) ?? firstTransaction;
                if (isManagedCardTransaction(selectedTransaction)) {
                    keep[fieldName] = false;
                } else if (areAllFieldsEqualForKey) {
                    keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                } else {
                    processChanges(fieldName, transactions, keys);
                }
            } else if (areAllFieldsEqualForKey) {
                keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
            } else {
                processChanges(fieldName, transactions, keys);
            }
        }
    }

    return {keep, change};
}

function buildNewTransactionAfterReviewingDuplicates(reviewDuplicateTransaction: OnyxEntry<ReviewDuplicates>, duplicatedTransaction: OnyxEntry<Transaction>): Partial<Transaction> {
    const {duplicates, taxAmount, ...restReviewDuplicateTransaction} = reviewDuplicateTransaction ?? {};
    const hasUpdatedTaxCode = reviewDuplicateTransaction?.taxCode !== undefined && reviewDuplicateTransaction?.taxCode !== duplicatedTransaction?.taxCode;

    return {
        ...duplicatedTransaction,
        ...restReviewDuplicateTransaction,
        modifiedMerchant: reviewDuplicateTransaction?.merchant,
        merchant: reviewDuplicateTransaction?.merchant,
        comment: {...reviewDuplicateTransaction?.comment, comment: reviewDuplicateTransaction?.description},
        // If the taxCode changes, apply the reviewed tax amount and clear stale taxName/taxValue so MoneyRequestView derives them fresh from the policy.
        ...(hasUpdatedTaxCode && {taxAmount, taxName: undefined, taxValue: undefined}),
    };
}

function buildMergeDuplicatesParams(
    reviewDuplicates: OnyxEntry<ReviewDuplicates>,
    duplicatedTransactions: Array<OnyxEntry<Transaction>>,
    originalTransaction: Partial<Transaction>,
): MergeDuplicatesParams {
    return {
        amount: -getAmount(originalTransaction as OnyxEntry<Transaction>, true),
        reportID: originalTransaction?.reportID,
        receiptID: originalTransaction?.receipt?.receiptID ?? CONST.DEFAULT_NUMBER_ID,
        currency: getCurrency(originalTransaction as OnyxEntry<Transaction>),
        created: getFormattedCreated(originalTransaction as OnyxEntry<Transaction>),
        transactionID: reviewDuplicates?.transactionID,
        transactionIDList: removeSettledAndApprovedTransactions(duplicatedTransactions ?? []).map((transaction) => transaction.transactionID),
        billable: reviewDuplicates?.billable ?? false,
        reimbursable: reviewDuplicates?.reimbursable ?? false,
        category: reviewDuplicates?.category ?? '',
        tag: reviewDuplicates?.tag ?? '',
        merchant: reviewDuplicates?.merchant ?? '',
        comment: reviewDuplicates?.description ?? '',
    };
}

export {
    buildMergeDuplicatesParams,
    buildNewTransactionAfterReviewingDuplicates,
    canMergeDuplicates,
    compareDuplicateTransactionFields,
    removeSettledAndApprovedTransactions,
    removeTransactionFromDuplicateTransactionViolation,
};
