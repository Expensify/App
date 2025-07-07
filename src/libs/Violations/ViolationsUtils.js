"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var reject_1 = require("lodash/reject");
var react_native_onyx_1 = require("react-native-onyx");
var CurrencyUtils = require("@libs/CurrencyUtils");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var TransactionUtils = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Calculates tag out of policy and missing tag violations for the given transaction
 */
function getTagViolationsForSingleLevelTags(updatedTransaction, transactionViolations, policyRequiresTags, policyTagList) {
    var _a, _b, _c, _d;
    var policyTagKeys = Object.keys(policyTagList);
    var policyTagListName = (_a = policyTagKeys.at(0)) !== null && _a !== void 0 ? _a : '';
    var policyTags = (_b = policyTagList[policyTagListName]) === null || _b === void 0 ? void 0 : _b.tags;
    var hasTagOutOfPolicyViolation = transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY; });
    var hasMissingTagViolation = transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.MISSING_TAG; });
    var isTagInPolicy = policyTags ? !!((_d = policyTags[(_c = updatedTransaction.tag) !== null && _c !== void 0 ? _c : '']) === null || _d === void 0 ? void 0 : _d.enabled) : false;
    var newTransactionViolations = __spreadArray([], transactionViolations, true);
    // Add 'tagOutOfPolicy' violation if tag is not in policy
    if (!hasTagOutOfPolicyViolation && updatedTransaction.tag && !isTagInPolicy) {
        newTransactionViolations.push({ name: CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY, type: CONST_1.default.VIOLATION_TYPES.VIOLATION });
    }
    // Remove 'tagOutOfPolicy' violation if tag is in policy
    if (hasTagOutOfPolicyViolation && updatedTransaction.tag && isTagInPolicy) {
        newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY });
    }
    // Remove 'missingTag' violation if tag is valid according to policy
    if (hasMissingTagViolation && isTagInPolicy) {
        newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: CONST_1.default.VIOLATIONS.MISSING_TAG });
    }
    // Add 'missingTag violation' if tag is required and not set
    if (!hasMissingTagViolation && !updatedTransaction.tag && policyRequiresTags) {
        newTransactionViolations.push({ name: CONST_1.default.VIOLATIONS.MISSING_TAG, type: CONST_1.default.VIOLATION_TYPES.VIOLATION });
    }
    return newTransactionViolations;
}
/**
 * Calculates missing tag violations for policies with dependent tags
 */
function getTagViolationsForDependentTags(policyTagList, transactionViolations, tagName) {
    var tagViolations = __spreadArray([], transactionViolations, true);
    if (!tagName) {
        Object.values(policyTagList).forEach(function (tagList) {
            return tagViolations.push({
                name: CONST_1.default.VIOLATIONS.MISSING_TAG,
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                data: { tagName: tagList.name },
            });
        });
    }
    else {
        var tags = TransactionUtils.getTagArrayFromName(tagName);
        if (Object.keys(policyTagList).length !== tags.length || tags.includes('')) {
            tagViolations.push({
                name: CONST_1.default.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED,
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                data: {},
            });
        }
    }
    return tagViolations;
}
/**
 * Calculates missing tag violations for policies with independent tags
 */
function getTagViolationForIndependentTags(policyTagList, transactionViolations, transaction) {
    var _a, _b;
    var policyTagKeys = (0, PolicyUtils_1.getSortedTagKeys)(policyTagList);
    var selectedTags = TransactionUtils.getTagArrayFromName((_a = transaction === null || transaction === void 0 ? void 0 : transaction.tag) !== null && _a !== void 0 ? _a : '');
    var newTransactionViolations = __spreadArray([], transactionViolations, true);
    newTransactionViolations = newTransactionViolations.filter(function (violation) { return violation.name !== CONST_1.default.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED && violation.name !== CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY; });
    // We first get the errorIndexes for someTagLevelsRequired. If it's not empty, we push SOME_TAG_LEVELS_REQUIRED in Onyx.
    // Otherwise, we put TAG_OUT_OF_POLICY in Onyx (when applicable)
    var errorIndexes = [];
    for (var i = 0; i < policyTagKeys.length; i++) {
        var isTagRequired = (_b = policyTagList[policyTagKeys[i]].required) !== null && _b !== void 0 ? _b : true;
        var isTagSelected = !!selectedTags.at(i);
        if (isTagRequired && (!isTagSelected || (selectedTags.length === 1 && selectedTags.at(0) === ''))) {
            errorIndexes.push(i);
        }
    }
    if (errorIndexes.length !== 0) {
        newTransactionViolations.push({
            name: CONST_1.default.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED,
            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
            data: {
                errorIndexes: errorIndexes,
            },
        });
    }
    else {
        var hasInvalidTag = false;
        var _loop_1 = function (i) {
            var selectedTag = selectedTags.at(i);
            var tags = policyTagList[policyTagKeys[i]].tags;
            var isTagInPolicy = Object.values(tags).some(function (tag) { return tag.name === selectedTag && !!tag.enabled; });
            if (!isTagInPolicy && selectedTag) {
                newTransactionViolations.push({
                    name: CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY,
                    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                    data: {
                        tagName: policyTagKeys.at(i),
                    },
                });
                hasInvalidTag = true;
                return "break";
            }
        };
        for (var i = 0; i < policyTagKeys.length; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "break")
                break;
        }
        if (!hasInvalidTag) {
            newTransactionViolations = (0, reject_1.default)(newTransactionViolations, {
                name: CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY,
            });
        }
    }
    return newTransactionViolations;
}
/**
 * Calculates tag violations for a transaction on a policy with multi level tags
 */
function getTagViolationsForMultiLevelTags(updatedTransaction, transactionViolations, policyTagList, hasDependentTags) {
    var _a;
    var tagViolations = [
        CONST_1.default.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED,
        CONST_1.default.VIOLATIONS.TAG_OUT_OF_POLICY,
        CONST_1.default.VIOLATIONS.MISSING_TAG,
        CONST_1.default.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED,
    ];
    var filteredTransactionViolations = transactionViolations.filter(function (violation) { return !tagViolations.includes(violation.name); });
    if (hasDependentTags) {
        return getTagViolationsForDependentTags(policyTagList, filteredTransactionViolations, (_a = updatedTransaction.tag) !== null && _a !== void 0 ? _a : '');
    }
    return getTagViolationForIndependentTags(policyTagList, filteredTransactionViolations, updatedTransaction);
}
/**
 * Extracts unique error messages from errors and actions
 */
function extractErrorMessages(errors, errorActions, translate) {
    var uniqueMessages = new Set();
    // Combine transaction and action errors
    var allErrors = __assign({}, errors);
    errorActions.forEach(function (action) {
        if (!action.errors) {
            return;
        }
        allErrors = __assign(__assign({}, allErrors), action.errors);
    });
    // Extract error messages
    Object.values(allErrors).forEach(function (errorValue) {
        if (!errorValue) {
            return;
        }
        if (typeof errorValue === 'string') {
            uniqueMessages.add(errorValue);
        }
        else if ((0, ErrorUtils_1.isReceiptError)(errorValue)) {
            uniqueMessages.add(translate('iou.error.receiptFailureMessageShort'));
        }
        else {
            Object.values(errorValue).forEach(function (nestedErrorValue) {
                if (!nestedErrorValue) {
                    return;
                }
                uniqueMessages.add(nestedErrorValue);
            });
        }
    });
    return Array.from(uniqueMessages);
}
var ViolationsUtils = {
    /**
     * Checks a transaction for policy violations and returns an object with Onyx method, key and updated transaction
     * violations.
     */
    getViolationsOnyxData: function (updatedTransaction, transactionViolations, policy, policyTagList, policyCategories, hasDependentTags, isInvoiceTransaction) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (TransactionUtils.isPartial(updatedTransaction)) {
            return {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(updatedTransaction.transactionID),
                value: transactionViolations,
            };
        }
        var newTransactionViolations = __spreadArray([], transactionViolations, true);
        // Calculate client-side category violations
        var policyRequiresCategories = !!policy.requiresCategory;
        if (policyRequiresCategories) {
            var hasCategoryOutOfPolicyViolation = transactionViolations.some(function (violation) { return violation.name === 'categoryOutOfPolicy'; });
            var hasMissingCategoryViolation = transactionViolations.some(function (violation) { return violation.name === 'missingCategory'; });
            var categoryKey = updatedTransaction.category;
            var isCategoryInPolicy = categoryKey ? (_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryKey]) === null || _a === void 0 ? void 0 : _a.enabled : false;
            // Add 'categoryOutOfPolicy' violation if category is not in policy
            if (!hasCategoryOutOfPolicyViolation && categoryKey && !isCategoryInPolicy) {
                newTransactionViolations.push({ name: 'categoryOutOfPolicy', type: CONST_1.default.VIOLATION_TYPES.VIOLATION });
            }
            // Remove 'categoryOutOfPolicy' violation if category is in policy
            if (hasCategoryOutOfPolicyViolation && updatedTransaction.category && isCategoryInPolicy) {
                newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: 'categoryOutOfPolicy' });
            }
            // Remove 'missingCategory' violation if category is valid according to policy
            if (hasMissingCategoryViolation && isCategoryInPolicy) {
                newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: 'missingCategory' });
            }
            // Add 'missingCategory' violation if category is required and not set
            if (!hasMissingCategoryViolation && policyRequiresCategories && !categoryKey) {
                newTransactionViolations.push({ name: 'missingCategory', type: CONST_1.default.VIOLATION_TYPES.VIOLATION, showInReview: true });
            }
        }
        // Calculate client-side tag violations
        var policyRequiresTags = !!policy.requiresTag;
        if (policyRequiresTags) {
            newTransactionViolations =
                Object.keys(policyTagList).length === 1
                    ? getTagViolationsForSingleLevelTags(updatedTransaction, newTransactionViolations, policyRequiresTags, policyTagList)
                    : getTagViolationsForMultiLevelTags(updatedTransaction, newTransactionViolations, policyTagList, hasDependentTags);
        }
        if (((_c = (_b = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.comment) === null || _b === void 0 ? void 0 : _b.customUnit) === null || _c === void 0 ? void 0 : _c.customUnitRateID) && !!(0, PolicyUtils_1.getDistanceRateCustomUnitRate)(policy, (_e = (_d = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit) === null || _e === void 0 ? void 0 : _e.customUnitRateID)) {
            newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: CONST_1.default.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY });
        }
        var isControlPolicy = policy.type === CONST_1.default.POLICY.TYPE.CORPORATE;
        var inputDate = new Date((_f = updatedTransaction.modifiedCreated) !== null && _f !== void 0 ? _f : updatedTransaction.created);
        var shouldDisplayFutureDateViolation = !isInvoiceTransaction && DateUtils_1.default.isFutureDay(inputDate) && isControlPolicy;
        var hasReceiptRequiredViolation = transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.RECEIPT_REQUIRED && violation.data; });
        var hasCategoryReceiptRequiredViolation = transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.RECEIPT_REQUIRED && !violation.data; });
        var hasOverLimitViolation = transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.OVER_LIMIT; });
        var hasCategoryOverLimitViolation = transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.OVER_CATEGORY_LIMIT; });
        var hasMissingCommentViolation = transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.MISSING_COMMENT; });
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var amount = updatedTransaction.modifiedAmount || updatedTransaction.amount;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var currency = updatedTransaction.modifiedCurrency || updatedTransaction.currency;
        var canCalculateAmountViolations = policy.outputCurrency === currency;
        var categoryName = updatedTransaction.category;
        var categoryMaxAmountNoReceipt = (_g = policyCategories[categoryName !== null && categoryName !== void 0 ? categoryName : '']) === null || _g === void 0 ? void 0 : _g.maxAmountNoReceipt;
        var maxAmountNoReceipt = policy.maxExpenseAmountNoReceipt;
        // The category maxExpenseAmountNoReceipt and maxExpenseAmount settings override the respective policy settings.
        var shouldShowReceiptRequiredViolation = canCalculateAmountViolations &&
            !isInvoiceTransaction &&
            typeof categoryMaxAmountNoReceipt !== 'number' &&
            typeof maxAmountNoReceipt === 'number' &&
            Math.abs(amount) > maxAmountNoReceipt &&
            !TransactionUtils.hasReceipt(updatedTransaction) &&
            isControlPolicy;
        var shouldShowCategoryReceiptRequiredViolation = canCalculateAmountViolations &&
            !isInvoiceTransaction &&
            typeof categoryMaxAmountNoReceipt === 'number' &&
            Math.abs(amount) > categoryMaxAmountNoReceipt &&
            !TransactionUtils.hasReceipt(updatedTransaction) &&
            isControlPolicy;
        var overLimitAmount = policy.maxExpenseAmount;
        var categoryOverLimit = (_h = policyCategories[categoryName !== null && categoryName !== void 0 ? categoryName : '']) === null || _h === void 0 ? void 0 : _h.maxExpenseAmount;
        var shouldShowOverLimitViolation = canCalculateAmountViolations &&
            !isInvoiceTransaction &&
            typeof categoryOverLimit !== 'number' &&
            typeof overLimitAmount === 'number' &&
            Math.abs(amount) > overLimitAmount &&
            isControlPolicy;
        var shouldCategoryShowOverLimitViolation = canCalculateAmountViolations && !isInvoiceTransaction && typeof categoryOverLimit === 'number' && Math.abs(amount) > categoryOverLimit && isControlPolicy;
        var shouldShowMissingComment = !isInvoiceTransaction && ((_j = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName !== null && categoryName !== void 0 ? categoryName : '']) === null || _j === void 0 ? void 0 : _j.areCommentsRequired) && !((_k = updatedTransaction.comment) === null || _k === void 0 ? void 0 : _k.comment) && isControlPolicy;
        var hasFutureDateViolation = transactionViolations.some(function (violation) { return violation.name === 'futureDate'; });
        // Add 'futureDate' violation if transaction date is in the future and policy type is corporate
        if (!hasFutureDateViolation && shouldDisplayFutureDateViolation) {
            newTransactionViolations.push({ name: CONST_1.default.VIOLATIONS.FUTURE_DATE, type: CONST_1.default.VIOLATION_TYPES.VIOLATION, showInReview: true });
        }
        // Remove 'futureDate' violation if transaction date is not in the future
        if (hasFutureDateViolation && !shouldDisplayFutureDateViolation) {
            newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: CONST_1.default.VIOLATIONS.FUTURE_DATE });
        }
        if (canCalculateAmountViolations &&
            ((hasReceiptRequiredViolation && !shouldShowReceiptRequiredViolation) || (hasCategoryReceiptRequiredViolation && !shouldShowCategoryReceiptRequiredViolation))) {
            newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: CONST_1.default.VIOLATIONS.RECEIPT_REQUIRED });
        }
        if (canCalculateAmountViolations &&
            ((!hasReceiptRequiredViolation && !!shouldShowReceiptRequiredViolation) || (!hasCategoryReceiptRequiredViolation && shouldShowCategoryReceiptRequiredViolation))) {
            newTransactionViolations.push({
                name: CONST_1.default.VIOLATIONS.RECEIPT_REQUIRED,
                data: shouldShowCategoryReceiptRequiredViolation || !policy.maxExpenseAmountNoReceipt
                    ? undefined
                    : {
                        formattedLimit: CurrencyUtils.convertAmountToDisplayString(policy.maxExpenseAmountNoReceipt, policy.outputCurrency),
                    },
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            });
        }
        if (canCalculateAmountViolations && hasOverLimitViolation && !shouldShowOverLimitViolation) {
            newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: CONST_1.default.VIOLATIONS.OVER_LIMIT });
        }
        if (canCalculateAmountViolations && hasCategoryOverLimitViolation && !shouldCategoryShowOverLimitViolation) {
            newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: CONST_1.default.VIOLATIONS.OVER_CATEGORY_LIMIT });
        }
        if (canCalculateAmountViolations && ((!hasOverLimitViolation && !!shouldShowOverLimitViolation) || (!hasCategoryOverLimitViolation && shouldCategoryShowOverLimitViolation))) {
            newTransactionViolations.push({
                name: shouldCategoryShowOverLimitViolation ? CONST_1.default.VIOLATIONS.OVER_CATEGORY_LIMIT : CONST_1.default.VIOLATIONS.OVER_LIMIT,
                data: {
                    formattedLimit: CurrencyUtils.convertAmountToDisplayString(shouldCategoryShowOverLimitViolation ? categoryOverLimit : policy.maxExpenseAmount, policy.outputCurrency),
                },
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            });
        }
        if (!hasMissingCommentViolation && shouldShowMissingComment) {
            newTransactionViolations.push({
                name: CONST_1.default.VIOLATIONS.MISSING_COMMENT,
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            });
        }
        if (hasMissingCommentViolation && !shouldShowMissingComment) {
            newTransactionViolations = (0, reject_1.default)(newTransactionViolations, { name: CONST_1.default.VIOLATIONS.MISSING_COMMENT });
        }
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(updatedTransaction.transactionID),
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
    getViolationTranslation: function (violation, translate, canEdit) {
        var _a, _b, _c, _d;
        if (canEdit === void 0) { canEdit = true; }
        var _e = (_a = violation.data) !== null && _a !== void 0 ? _a : {}, _f = _e.brokenBankConnection, brokenBankConnection = _f === void 0 ? false : _f, _g = _e.isAdmin, isAdmin = _g === void 0 ? false : _g, email = _e.email, _h = _e.isTransactionOlderThan7Days, isTransactionOlderThan7Days = _h === void 0 ? false : _h, member = _e.member, category = _e.category, _j = _e.rejectedBy, rejectedBy = _j === void 0 ? '' : _j, _k = _e.rejectReason, rejectReason = _k === void 0 ? '' : _k, _l = _e.formattedLimit, formattedLimit = _l === void 0 ? '' : _l, _m = _e.surcharge, surcharge = _m === void 0 ? 0 : _m, _o = _e.invoiceMarkup, invoiceMarkup = _o === void 0 ? 0 : _o, _p = _e.maxAge, maxAge = _p === void 0 ? 0 : _p, tagName = _e.tagName, taxName = _e.taxName, type = _e.type, rterType = _e.rterType, _q = _e.message, message = _q === void 0 ? '' : _q;
        switch (violation.name) {
            case 'allTagLevelsRequired':
                return translate('violations.allTagLevelsRequired');
            case 'autoReportedRejectedExpense':
                return translate('violations.autoReportedRejectedExpense', {
                    rejectedBy: rejectedBy,
                    rejectReason: rejectReason,
                });
            case 'billableExpense':
                return translate('violations.billableExpense');
            case 'cashExpenseWithNoReceipt':
                return translate('violations.cashExpenseWithNoReceipt', { formattedLimit: formattedLimit });
            case 'categoryOutOfPolicy':
                return translate('violations.categoryOutOfPolicy');
            case 'conversionSurcharge':
                return translate('violations.conversionSurcharge', { surcharge: surcharge });
            case 'customUnitOutOfPolicy':
                return translate('violations.customUnitOutOfPolicy');
            case 'duplicatedTransaction':
                return translate('violations.duplicatedTransaction');
            case 'fieldRequired':
                return translate('violations.fieldRequired');
            case 'futureDate':
                return translate('violations.futureDate');
            case 'invoiceMarkup':
                return translate('violations.invoiceMarkup', { invoiceMarkup: invoiceMarkup });
            case 'maxAge':
                return translate('violations.maxAge', { maxAge: maxAge });
            case 'missingCategory':
                return translate('violations.missingCategory');
            case 'missingComment':
                return translate('violations.missingComment');
            case 'missingTag':
                return translate('violations.missingTag', { tagName: tagName });
            case 'modifiedAmount':
                return translate('violations.modifiedAmount', { type: type, displayPercentVariance: (_b = violation.data) === null || _b === void 0 ? void 0 : _b.displayPercentVariance });
            case 'modifiedDate':
                return translate('violations.modifiedDate');
            case 'nonExpensiworksExpense':
                return translate('violations.nonExpensiworksExpense');
            case 'overAutoApprovalLimit':
                return translate('violations.overAutoApprovalLimit', { formattedLimit: formattedLimit });
            case 'overCategoryLimit':
                return translate('violations.overCategoryLimit', { formattedLimit: formattedLimit });
            case 'overLimit':
                return translate('violations.overLimit', { formattedLimit: formattedLimit });
            case 'overLimitAttendee':
                return translate('violations.overLimitAttendee', { formattedLimit: formattedLimit });
            case 'perDayLimit':
                return translate('violations.perDayLimit', { formattedLimit: formattedLimit });
            case 'receiptNotSmartScanned':
                return translate('violations.receiptNotSmartScanned');
            case 'receiptRequired':
                return translate('violations.receiptRequired', { formattedLimit: formattedLimit, category: category });
            case 'customRules':
                return translate('violations.customRules', { message: message });
            case 'rter':
                return translate('violations.rter', {
                    brokenBankConnection: brokenBankConnection,
                    isAdmin: isAdmin,
                    email: email,
                    isTransactionOlderThan7Days: isTransactionOlderThan7Days,
                    member: member,
                    rterType: rterType,
                });
            case 'smartscanFailed':
                return translate('violations.smartscanFailed', { canEdit: canEdit });
            case 'someTagLevelsRequired':
                return translate('violations.someTagLevelsRequired', { tagName: tagName });
            case 'tagOutOfPolicy':
                return translate('violations.tagOutOfPolicy', { tagName: tagName });
            case 'taxAmountChanged':
                return translate('violations.taxAmountChanged');
            case 'taxOutOfPolicy':
                return translate('violations.taxOutOfPolicy', { taxName: taxName });
            case 'taxRateChanged':
                return translate('violations.taxRateChanged');
            case 'taxRequired':
                return translate('violations.taxRequired');
            case 'hold':
                return translate('violations.hold');
            case CONST_1.default.VIOLATIONS.PROHIBITED_EXPENSE:
                return translate('violations.prohibitedExpense', {
                    prohibitedExpenseType: (_d = (_c = violation.data) === null || _c === void 0 ? void 0 : _c.prohibitedExpenseRule) !== null && _d !== void 0 ? _d : '',
                });
            case CONST_1.default.VIOLATIONS.RECEIPT_GENERATED_WITH_AI:
                return translate('violations.receiptGeneratedWithAI');
            default:
                // The interpreter should never get here because the switch cases should be exhaustive.
                // If typescript is showing an error on the assertion below it means the switch statement is out of
                // sync with the `ViolationNames` type, and one or the other needs to be updated.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                return violation.name;
        }
    },
    // We have to use regex, because Violation limit is given in a inconvenient form: "$2,000.00"
    getViolationAmountLimit: function (violation) {
        var _a, _b;
        return Number((_b = (_a = violation.data) === null || _a === void 0 ? void 0 : _a.formattedLimit) === null || _b === void 0 ? void 0 : _b.replace(CONST_1.default.VIOLATION_LIMIT_REGEX, ''));
    },
    getRBRMessages: function (transaction, transactionViolations, translate, missingFieldError, transactionThreadActions) {
        var _a, _b;
        var errorMessages = extractErrorMessages((_a = transaction === null || transaction === void 0 ? void 0 : transaction.errors) !== null && _a !== void 0 ? _a : {}, (_b = transactionThreadActions === null || transactionThreadActions === void 0 ? void 0 : transactionThreadActions.filter(function (e) { return !!e.errors; })) !== null && _b !== void 0 ? _b : [], translate);
        return __spreadArray(__spreadArray(__spreadArray([], errorMessages, true), (missingFieldError ? ["".concat(missingFieldError, ".")] : []), true), transactionViolations.map(function (violation) {
            var message = ViolationsUtils.getViolationTranslation(violation, translate);
            if (!message) {
                return;
            }
            return message.endsWith('.') ? message : "".concat(message, ".");
        }), true).filter(Boolean)
            .join(' ');
    },
};
exports.default = ViolationsUtils;
