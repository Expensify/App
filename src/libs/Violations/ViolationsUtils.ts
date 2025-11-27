import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import reject from 'lodash/reject';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {getDecodedCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {isReceiptError} from '@libs/ErrorUtils';
import Parser from '@libs/Parser';
import {getDistanceRateCustomUnitRate, getPerDiemRateCustomUnitRate, getSortedTagKeys, isDefaultTagName, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {isCurrentUserSubmitter} from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import {isViolationDismissed, shouldShowViolation} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report, ReportAction, Transaction, TransactionViolation, ViolationName} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {ReceiptError, ReceiptErrors} from '@src/types/onyx/Transaction';

/**
 * Calculates tag out of policy and missing tag violations for the given transaction
 */
function getTagViolationsForSingleLevelTags(
    updatedTransaction: Transaction,
    transactionViolations: TransactionViolation[],
    policyRequiresTags: boolean,
    policyTagList: PolicyTagLists,
): TransactionViolation[] {
    const policyTagKeys = Object.keys(policyTagList);
    const policyTagListName = policyTagKeys.at(0) ?? '';
    const policyTags = policyTagList[policyTagListName]?.tags;
    const hasTagOutOfPolicyViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.TAG_OUT_OF_POLICY);
    const hasMissingTagViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.MISSING_TAG);
    const isTagInPolicy = policyTags ? !!policyTags[updatedTransaction.tag ?? '']?.enabled : false;
    let newTransactionViolations = [...transactionViolations];

    // Add 'tagOutOfPolicy' violation if tag is not in policy
    if (!hasTagOutOfPolicyViolation && updatedTransaction.tag && !isTagInPolicy) {
        const tagName = policyTagList[policyTagListName]?.name;
        const tagNameToShow = isDefaultTagName(tagName) ? undefined : tagName;
        newTransactionViolations.push({name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY, type: CONST.VIOLATION_TYPES.VIOLATION, data: {tagName: tagNameToShow}});
    }

    // Remove 'tagOutOfPolicy' violation if tag is in policy
    if (hasTagOutOfPolicyViolation && updatedTransaction.tag && isTagInPolicy) {
        newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY});
    }

    // Remove 'missingTag' violation if tag is valid according to policy
    if (hasMissingTagViolation && isTagInPolicy) {
        newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.MISSING_TAG});
    }

    // Add 'missingTag violation' if tag is required and not set
    if (!hasMissingTagViolation && !updatedTransaction.tag && policyRequiresTags) {
        const tagName = policyTagList[policyTagListName]?.name;
        const tagNameToShow = isDefaultTagName(tagName) ? undefined : tagName;
        newTransactionViolations.push({name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.VIOLATION, data: {tagName: tagNameToShow}});
    }
    return newTransactionViolations;
}

/**
 * Calculates missing tag violations for policies with dependent tags
 */
function getTagViolationsForDependentTags(policyTagList: PolicyTagLists, transactionViolations: TransactionViolation[], tagName: string) {
    const tagViolations = [...transactionViolations];

    if (!tagName) {
        for (const tagList of Object.values(policyTagList)) {
            tagViolations.push({
                name: CONST.VIOLATIONS.MISSING_TAG,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                data: {tagName: tagList.name},
            });
        }
    } else {
        const tags = TransactionUtils.getTagArrayFromName(tagName);
        if (Object.keys(policyTagList).length !== tags.length || tags.includes('')) {
            tagViolations.push({
                name: CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                data: {},
            });
        }
    }

    return tagViolations;
}

/**
 * Calculates missing tag violations for policies with independent tags
 */
function getTagViolationForIndependentTags(policyTagList: PolicyTagLists, transactionViolations: TransactionViolation[], transaction: Transaction) {
    const policyTagKeys = getSortedTagKeys(policyTagList);
    const selectedTags = TransactionUtils.getTagArrayFromName(transaction?.tag ?? '');
    let newTransactionViolations = [...transactionViolations];

    newTransactionViolations = newTransactionViolations.filter(
        (violation) => violation.name !== CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED && violation.name !== CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
    );

    // We first get the errorIndexes for someTagLevelsRequired. If it's not empty, we push SOME_TAG_LEVELS_REQUIRED in Onyx.
    // Otherwise, we put TAG_OUT_OF_POLICY in Onyx (when applicable)
    const errorIndexes = [];
    for (let i = 0; i < policyTagKeys.length; i++) {
        const isTagRequired = policyTagList[policyTagKeys[i]].required ?? true;
        const isTagSelected = !!selectedTags.at(i);
        if (isTagRequired && (!isTagSelected || (selectedTags.length === 1 && selectedTags.at(0) === ''))) {
            errorIndexes.push(i);
        }
    }
    if (errorIndexes.length !== 0) {
        newTransactionViolations.push({
            name: CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            data: {
                errorIndexes,
            },
        });
    } else {
        let hasInvalidTag = false;
        for (let i = 0; i < policyTagKeys.length; i++) {
            const selectedTag = selectedTags.at(i);
            const tags = policyTagList[policyTagKeys[i]].tags;
            const isTagInPolicy = Object.values(tags).some((tag) => tag.name === selectedTag && !!tag.enabled);
            if (!isTagInPolicy && selectedTag) {
                newTransactionViolations.push({
                    name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        tagName: policyTagKeys.at(i),
                    },
                });
                hasInvalidTag = true;
                break;
            }
        }
        if (!hasInvalidTag) {
            newTransactionViolations = reject(newTransactionViolations, {
                name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
            });
        }
    }
    return newTransactionViolations;
}

/**
 * Calculates tag violations for a transaction on a policy with multi level tags
 */
function getTagViolationsForMultiLevelTags(
    updatedTransaction: Transaction,
    transactionViolations: TransactionViolation[],
    policyTagList: PolicyTagLists,
    hasDependentTags: boolean,
): TransactionViolation[] {
    const tagViolations = [
        CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED,
        CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
        CONST.VIOLATIONS.MISSING_TAG,
        CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED,
    ] as ViolationName[];
    const filteredTransactionViolations = transactionViolations.filter((violation) => !tagViolations.includes(violation.name));

    if (hasDependentTags) {
        return getTagViolationsForDependentTags(policyTagList, filteredTransactionViolations, updatedTransaction.tag ?? '');
    }

    return getTagViolationForIndependentTags(policyTagList, filteredTransactionViolations, updatedTransaction);
}

/**
 * Returns a period-separated string of violation messages for missing tag levels in a multi-level tag, based on error indexes.
 */
function getTagViolationMessagesForMultiLevelTags(tagName: string | undefined, errorIndexes: number[], tags: PolicyTagLists, translate: LocaleContextProps['translate']): string {
    if (isEmpty(errorIndexes) || isEmpty(tags)) {
        return translate('violations.someTagLevelsRequired', {tagName});
    }
    const tagsWithIndexes = keyBy(Object.values(tags), 'orderWeight');
    return errorIndexes.map((i) => translate('violations.someTagLevelsRequired', {tagName: tagsWithIndexes[i]?.name})).join('. ');
}

/**
 * Extracts unique error messages from errors and actions
 */
function extractErrorMessages(errors: Errors | ReceiptErrors, errorActions: ReportAction[], translate: LocaleContextProps['translate']): string[] {
    const uniqueMessages = new Set<string>();

    // Combine transaction and action errors
    let allErrors: Record<string, string | Errors | ReceiptError | null | undefined> = {...errors};
    for (const action of errorActions) {
        if (!action.errors) {
            continue;
        }
        allErrors = {...allErrors, ...action.errors};
    }

    // Extract error messages
    for (const errorValue of Object.values(allErrors)) {
        if (!errorValue) {
            continue;
        }
        if (typeof errorValue === 'string') {
            uniqueMessages.add(errorValue);
        } else if (isReceiptError(errorValue)) {
            uniqueMessages.add(translate('iou.error.receiptFailureMessageShort'));
        } else {
            for (const nestedErrorValue of Object.values(errorValue)) {
                if (!nestedErrorValue) {
                    continue;
                }
                uniqueMessages.add(nestedErrorValue);
            }
        }
    }

    return Array.from(uniqueMessages);
}

const ViolationsUtils = {
    /**
     * Checks a transaction for policy violations and returns an object with Onyx method, key and updated transaction
     * violations.
     */
    getViolationsOnyxData(
        updatedTransaction: Transaction,
        transactionViolations: TransactionViolation[],
        policy: Policy,
        policyTagList: PolicyTagLists,
        policyCategories: PolicyCategories,
        hasDependentTags: boolean,
        isInvoiceTransaction: boolean,
        isSelfDM?: boolean,
        iouReport?: OnyxEntry<Report> | null,
        isFromExpenseReport?: boolean,
    ): OnyxUpdate {
        const isScanning = TransactionUtils.isScanning(updatedTransaction);
        const isScanRequest = TransactionUtils.isScanRequest(updatedTransaction);
        const isPartialTransaction = TransactionUtils.isPartial(updatedTransaction);
        if (isPartialTransaction && isScanning) {
            return {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${updatedTransaction.transactionID}`,
                value: transactionViolations,
            };
        }

        let newTransactionViolations = [...transactionViolations];

        // Remove AUTO_REPORTED_REJECTED_EXPENSE violation when the submitter edits the expense
        if (iouReport && isFromExpenseReport && isCurrentUserSubmitter(iouReport)) {
            const hasRejectedExpenseViolation = newTransactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
            if (hasRejectedExpenseViolation) {
                newTransactionViolations = newTransactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
            }
        }

        const shouldShowSmartScanFailedError = isScanRequest && updatedTransaction.receipt?.state === CONST.IOU.RECEIPT_STATE.SCAN_FAILED;
        const hasSmartScanFailedError = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.SMARTSCAN_FAILED);
        if (shouldShowSmartScanFailedError && !hasSmartScanFailedError) {
            return {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${updatedTransaction.transactionID}`,
                value: [{name: CONST.VIOLATIONS.SMARTSCAN_FAILED, type: CONST.VIOLATION_TYPES.WARNING, showInReview: true}],
            };
        }
        if (!shouldShowSmartScanFailedError && hasSmartScanFailedError) {
            newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.SMARTSCAN_FAILED});
        }

        // Calculate client-side category violations
        const policyRequiresCategories = !!policy.requiresCategory;
        if (policyRequiresCategories) {
            const hasCategoryOutOfPolicyViolation = transactionViolations.some((violation) => violation.name === 'categoryOutOfPolicy');
            const hasMissingCategoryViolation = transactionViolations.some((violation) => violation.name === 'missingCategory');
            const categoryKey = updatedTransaction.category;
            const isCategoryInPolicy = categoryKey ? policyCategories?.[categoryKey]?.enabled : false;

            // Add 'categoryOutOfPolicy' violation if category is not in policy
            if (!hasCategoryOutOfPolicyViolation && !isCategoryMissing(categoryKey) && !isCategoryInPolicy) {
                newTransactionViolations.push({name: 'categoryOutOfPolicy', type: CONST.VIOLATION_TYPES.VIOLATION});
            }

            // Remove 'categoryOutOfPolicy' violation if category is in policy
            if (hasCategoryOutOfPolicyViolation && updatedTransaction.category && isCategoryInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'categoryOutOfPolicy'});
            }

            // Remove 'missingCategory' violation if category is valid according to policy
            if (hasMissingCategoryViolation && (isCategoryInPolicy || isSelfDM)) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'missingCategory'});
            }

            // Add 'missingCategory' violation if category is required and not set
            if (!hasMissingCategoryViolation && policyRequiresCategories && !categoryKey && !isSelfDM) {
                newTransactionViolations.push({name: 'missingCategory', type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true});
            }
        }

        // Calculate client-side tag violations
        const policyRequiresTags = !!policy.requiresTag && !isSelfDM;
        if (policyRequiresTags) {
            newTransactionViolations =
                Object.keys(policyTagList).length === 1
                    ? getTagViolationsForSingleLevelTags(updatedTransaction, newTransactionViolations, policyRequiresTags, policyTagList)
                    : getTagViolationsForMultiLevelTags(updatedTransaction, newTransactionViolations, policyTagList, hasDependentTags);
        }

        const customUnitRateID = updatedTransaction?.comment?.customUnit?.customUnitRateID;
        if (customUnitRateID && customUnitRateID.length > 0 && !isSelfDM) {
            const isPerDiem = TransactionUtils.isPerDiemRequest(updatedTransaction);
            const customRate = isPerDiem ? getPerDiemRateCustomUnitRate(policy, customUnitRateID) : getDistanceRateCustomUnitRate(policy, customUnitRateID);
            if (customRate) {
                newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY});
            } else {
                newTransactionViolations.push({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    showInReview: true,
                });
            }
        }

        const isControlPolicy = policy.type === CONST.POLICY.TYPE.CORPORATE;
        const inputDate = new Date(updatedTransaction.modifiedCreated ?? updatedTransaction.created);
        const shouldDisplayFutureDateViolation = !isInvoiceTransaction && DateUtils.isFutureDay(inputDate) && isControlPolicy;
        const hasReceiptRequiredViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.RECEIPT_REQUIRED && violation.data);
        const hasCategoryReceiptRequiredViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.RECEIPT_REQUIRED && !violation.data);
        const hasOverLimitViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.OVER_LIMIT);
        // TODO: Uncomment when the OVER_TRIP_LIMIT violation is implemented
        // const hasOverTripLimitViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.OVER_TRIP_LIMIT);
        const hasCategoryOverLimitViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.OVER_CATEGORY_LIMIT);
        const hasMissingCommentViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.MISSING_COMMENT);
        const hasTaxOutOfPolicyViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.TAX_OUT_OF_POLICY);
        const isDistanceRequest = TransactionUtils.isDistanceRequest(updatedTransaction);
        const isPerDiemRequest = TransactionUtils.isPerDiemRequest(updatedTransaction);
        const isPolicyTrackTaxEnabled = isTaxTrackingEnabled(true, policy, isDistanceRequest, isPerDiemRequest);
        const isTaxInPolicy = Object.keys(policy.taxRates?.taxes ?? {}).some((key) => key === updatedTransaction.taxCode);

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const amount = updatedTransaction.modifiedAmount || updatedTransaction.amount;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const currency = updatedTransaction.modifiedCurrency || updatedTransaction.currency;
        const canCalculateAmountViolations = policy.outputCurrency === currency;

        const categoryName = updatedTransaction.category;
        const categoryMaxAmountNoReceipt = policyCategories[categoryName ?? '']?.maxAmountNoReceipt;
        const maxAmountNoReceipt = policy.maxExpenseAmountNoReceipt;
        // Amount is stored with opposite sign (negative for expenses), so we negate it to get the actual expense amount
        const expenseAmount = -amount;

        // The category maxExpenseAmountNoReceipt and maxExpenseAmount settings override the respective policy settings.
        const shouldShowReceiptRequiredViolation =
            canCalculateAmountViolations &&
            !isInvoiceTransaction &&
            typeof categoryMaxAmountNoReceipt !== 'number' &&
            typeof maxAmountNoReceipt === 'number' &&
            expenseAmount > maxAmountNoReceipt &&
            !TransactionUtils.hasReceipt(updatedTransaction) &&
            isControlPolicy;
        const shouldShowCategoryReceiptRequiredViolation =
            canCalculateAmountViolations &&
            !isInvoiceTransaction &&
            typeof categoryMaxAmountNoReceipt === 'number' &&
            expenseAmount > categoryMaxAmountNoReceipt &&
            !TransactionUtils.hasReceipt(updatedTransaction) &&
            isControlPolicy;

        const overLimitAmount = policy.maxExpenseAmount;
        const categoryOverLimit = policyCategories[categoryName ?? '']?.maxExpenseAmount;
        const shouldShowOverLimitViolation =
            canCalculateAmountViolations &&
            !isInvoiceTransaction &&
            typeof categoryOverLimit !== 'number' &&
            typeof overLimitAmount === 'number' &&
            expenseAmount > overLimitAmount &&
            isControlPolicy;
        const shouldCategoryShowOverLimitViolation =
            canCalculateAmountViolations && !isInvoiceTransaction && typeof categoryOverLimit === 'number' && expenseAmount > categoryOverLimit && isControlPolicy;
        const shouldShowMissingComment = !isInvoiceTransaction && policyCategories?.[categoryName ?? '']?.areCommentsRequired && !updatedTransaction.comment?.comment && isControlPolicy;
        const hasFutureDateViolation = transactionViolations.some((violation) => violation.name === 'futureDate');
        // Add 'futureDate' violation if transaction date is in the future and policy type is corporate
        if (!hasFutureDateViolation && shouldDisplayFutureDateViolation) {
            newTransactionViolations.push({name: CONST.VIOLATIONS.FUTURE_DATE, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true});
        }

        // Remove 'futureDate' violation if transaction date is not in the future
        if (hasFutureDateViolation && !shouldDisplayFutureDateViolation) {
            newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.FUTURE_DATE});
        }

        if (
            canCalculateAmountViolations &&
            ((hasReceiptRequiredViolation && !shouldShowReceiptRequiredViolation) || (hasCategoryReceiptRequiredViolation && !shouldShowCategoryReceiptRequiredViolation))
        ) {
            newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.RECEIPT_REQUIRED});
        }

        if (
            canCalculateAmountViolations &&
            ((!hasReceiptRequiredViolation && !!shouldShowReceiptRequiredViolation) || (!hasCategoryReceiptRequiredViolation && shouldShowCategoryReceiptRequiredViolation))
        ) {
            newTransactionViolations.push({
                name: CONST.VIOLATIONS.RECEIPT_REQUIRED,
                data:
                    shouldShowCategoryReceiptRequiredViolation || !policy.maxExpenseAmountNoReceipt
                        ? undefined
                        : {
                              formattedLimit: CurrencyUtils.convertToDisplayString(policy.maxExpenseAmountNoReceipt, policy.outputCurrency, true),
                          },
                type: CONST.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            });
        }

        if (canCalculateAmountViolations && hasOverLimitViolation && !shouldShowOverLimitViolation) {
            newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.OVER_LIMIT});
        }

        if (canCalculateAmountViolations && hasCategoryOverLimitViolation && !shouldCategoryShowOverLimitViolation) {
            newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.OVER_CATEGORY_LIMIT});
        }

        if (canCalculateAmountViolations && ((!hasOverLimitViolation && !!shouldShowOverLimitViolation) || (!hasCategoryOverLimitViolation && shouldCategoryShowOverLimitViolation))) {
            newTransactionViolations.push({
                name: shouldCategoryShowOverLimitViolation ? CONST.VIOLATIONS.OVER_CATEGORY_LIMIT : CONST.VIOLATIONS.OVER_LIMIT,
                data: {
                    formattedLimit: CurrencyUtils.convertAmountToDisplayString(shouldCategoryShowOverLimitViolation ? categoryOverLimit : policy.maxExpenseAmount, policy.outputCurrency),
                },
                type: CONST.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            });
        }

        // TODO: Uncomment when the OVER_TRIP_LIMIT violation is implemented
        // if (canCalculateAmountViolations && !hasOverTripLimitViolation && Math.abs(updatedTransaction.amount) < Math.abs(amount) && TransactionUtils.hasReservationList(updatedTransaction)) {
        //     newTransactionViolations.push({
        //         name: CONST.VIOLATIONS.OVER_TRIP_LIMIT,
        //         data: {
        //             formattedLimit: CurrencyUtils.convertAmountToDisplayString(updatedTransaction.amount, updatedTransaction.currency),
        //         },
        //         type: CONST.VIOLATION_TYPES.VIOLATION,
        //         showInReview: true,
        //     });
        // }

        // if (canCalculateAmountViolations && hasOverTripLimitViolation && Math.abs(updatedTransaction.amount) >= Math.abs(amount) && TransactionUtils.hasReservationList(updatedTransaction)) {
        //     newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.OVER_TRIP_LIMIT});
        // }

        if (!hasMissingCommentViolation && shouldShowMissingComment) {
            newTransactionViolations.push({
                name: CONST.VIOLATIONS.MISSING_COMMENT,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            });
        }

        if (hasMissingCommentViolation && !shouldShowMissingComment) {
            newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.MISSING_COMMENT});
        }

        if (isPolicyTrackTaxEnabled && !hasTaxOutOfPolicyViolation && !isTaxInPolicy) {
            newTransactionViolations.push({name: CONST.VIOLATIONS.TAX_OUT_OF_POLICY, type: CONST.VIOLATION_TYPES.VIOLATION});
        }

        if (isPolicyTrackTaxEnabled && hasTaxOutOfPolicyViolation && isTaxInPolicy) {
            newTransactionViolations = reject(newTransactionViolations, {name: CONST.VIOLATIONS.TAX_OUT_OF_POLICY});
        }
        return {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${updatedTransaction.transactionID}`,
            value: newTransactionViolations,
        };
    },

    /**
     * Gets the translated message for each violation type.
     *
     * Necessary because `translate` throws a type error if you attempt to pass it a template strings, when the
     * possible values could be either translation keys that resolve to  strings or translation keys that resolve to
     * functions.
     */
    getViolationTranslation(violation: TransactionViolation, translate: LocaleContextProps['translate'], canEdit = true, tags?: PolicyTagLists, companyCardPageURL?: string): string {
        const {
            brokenBankConnection = false,
            isAdmin = false,
            isTransactionOlderThan7Days = false,
            member,
            category,
            formattedLimit = '',
            surcharge = 0,
            invoiceMarkup = 0,
            maxAge = 0,
            tagName,
            taxName,
            type,
            rterType,
            message = '',
            errorIndexes = [],
        } = violation.data ?? {};

        switch (violation.name) {
            case 'allTagLevelsRequired':
                return translate('violations.allTagLevelsRequired');
            case 'autoReportedRejectedExpense':
                return translate('violations.autoReportedRejectedExpense');
            case 'billableExpense':
                return translate('violations.billableExpense');
            case 'cashExpenseWithNoReceipt':
                return translate('violations.cashExpenseWithNoReceipt', {formattedLimit});
            case 'categoryOutOfPolicy':
                return translate('violations.categoryOutOfPolicy');
            case 'conversionSurcharge':
                return translate('violations.conversionSurcharge', {surcharge});
            case 'customUnitOutOfPolicy':
                return translate('violations.customUnitOutOfPolicy');
            case 'duplicatedTransaction':
                return translate('violations.duplicatedTransaction');
            case 'fieldRequired':
                return translate('violations.fieldRequired');
            case 'futureDate':
                return translate('violations.futureDate');
            case 'invoiceMarkup':
                return translate('violations.invoiceMarkup', {invoiceMarkup});
            case 'maxAge':
                return translate('violations.maxAge', {maxAge});
            case 'missingCategory':
                return translate('violations.missingCategory');
            case 'missingComment':
                return translate('violations.missingComment');
            case 'missingTag':
                return translate('violations.missingTag', {tagName});
            case 'modifiedAmount':
                return translate('violations.modifiedAmount', {type, displayPercentVariance: violation.data?.displayPercentVariance});
            case 'modifiedDate':
                return translate('violations.modifiedDate');
            case 'nonExpensiworksExpense':
                return translate('violations.nonExpensiworksExpense');
            case 'overAutoApprovalLimit':
                return translate('violations.overAutoApprovalLimit', {formattedLimit});
            case 'overCategoryLimit':
                return translate('violations.overCategoryLimit', {formattedLimit});
            case 'overLimit':
                return translate('violations.overLimit', {formattedLimit});
            case 'overTripLimit':
                return translate('violations.overTripLimit', {formattedLimit});
            case 'overLimitAttendee':
                return translate('violations.overLimitAttendee', {formattedLimit});
            case 'perDayLimit':
                return translate('violations.perDayLimit', {formattedLimit});
            case 'receiptNotSmartScanned':
                return translate('violations.receiptNotSmartScanned');
            case 'receiptRequired':
                return translate('violations.receiptRequired', {formattedLimit, category: getDecodedCategoryName(category ?? '')});
            case 'customRules':
                return translate('violations.customRules', {message});
            case 'rter':
                return translate('violations.rter', {
                    brokenBankConnection,
                    isAdmin,
                    isTransactionOlderThan7Days,
                    member,
                    rterType,
                    companyCardPageURL,
                });
            case 'smartscanFailed':
                return translate('violations.smartscanFailed', {canEdit});
            case 'someTagLevelsRequired':
                return getTagViolationMessagesForMultiLevelTags(tagName, errorIndexes, tags ?? {}, translate);
            case 'tagOutOfPolicy':
                return translate('violations.tagOutOfPolicy', {tagName});
            case 'taxAmountChanged':
                return translate('violations.taxAmountChanged');
            case 'taxOutOfPolicy':
                return translate('violations.taxOutOfPolicy', {taxName});
            case 'taxRateChanged':
                return translate('violations.taxRateChanged');
            case 'taxRequired':
                return translate('violations.taxRequired');
            case 'hold':
                return translate('violations.hold');
            case CONST.VIOLATIONS.PROHIBITED_EXPENSE:
                return translate('violations.prohibitedExpense', {
                    prohibitedExpenseTypes: violation.data?.prohibitedExpenseRule ?? [],
                });
            case CONST.VIOLATIONS.RECEIPT_GENERATED_WITH_AI:
                return translate('violations.receiptGeneratedWithAI');
            default:
                // The interpreter should never get here because the switch cases should be exhaustive.
                // If typescript is showing an error on the assertion below it means the switch statement is out of
                // sync with the `ViolationNames` type, and one or the other needs to be updated.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                return violation.name as never;
        }
    },

    // We have to use regex, because Violation limit is given in a inconvenient form: "$2,000.00"
    getViolationAmountLimit(violation: TransactionViolation): number {
        return Number(violation.data?.formattedLimit?.replace(CONST.VIOLATION_LIMIT_REGEX, ''));
    },

    getRBRMessages(
        transaction: Transaction,
        transactionViolations: TransactionViolation[],
        translate: LocaleContextProps['translate'],
        missingFieldError?: string,
        transactionThreadActions?: ReportAction[],
        tags?: PolicyTagLists,
        companyCardPageURL?: string,
    ): string {
        const errorMessages = extractErrorMessages(transaction?.errors ?? {}, transactionThreadActions?.filter((e) => !!e.errors) ?? [], translate);

        return [
            ...errorMessages,
            ...(missingFieldError ? [`${missingFieldError}.`] : []),
            // Some violations end with a period already so lets make sure the connected messages have only single period between them
            // and end with a single dot.
            ...transactionViolations.map((violation) => {
                const message = ViolationsUtils.getViolationTranslation(violation, translate, true, tags, companyCardPageURL);
                if (!message) {
                    return;
                }
                const textMessage = Parser.htmlToText(message);
                return textMessage.endsWith('.') ? message : `${message}.`;
            }),
        ]
            .filter(Boolean)
            .join(' ');
    },

    /**
     * Checks if any transactions in the report have violations that should be visible to the current user.
     * Filters violations based on user role (submitter, admin, policy member) and report state.
     * Also filters out dismissed violations.
     */
    hasVisibleViolationsForUser(
        report: OnyxEntry<Report>,
        violations: OnyxCollection<TransactionViolation[]>,
        currentUserEmail: string,
        policy: OnyxEntry<Policy>,
        transactions: Transaction[],
    ): boolean {
        if (!report || !violations || !transactions) {
            return false;
        }

        // Check if any transaction has at least one violation visible to the current user
        return transactions.some((transaction) => {
            const transactionViolations = violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
            if (!transactionViolations) {
                return false;
            }

            // Check if any violation is not dismissed and should be shown based on user role and violation type
            return transactionViolations.some((violation: TransactionViolation) => {
                return !isViolationDismissed(transaction, violation, currentUserEmail, report, policy) && shouldShowViolation(report, policy, violation.name, currentUserEmail);
            });
        });
    },
};

export default ViolationsUtils;
