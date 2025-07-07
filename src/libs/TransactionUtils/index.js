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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.getOriginalTransactionWithSplitInfo = exports.getDistanceInMeters = void 0;
exports.buildOptimisticTransaction = buildOptimisticTransaction;
exports.calculateTaxAmount = calculateTaxAmount;
exports.getWorkspaceTaxesSettingsName = getWorkspaceTaxesSettingsName;
exports.getDefaultTaxCode = getDefaultTaxCode;
exports.transformedTaxRates = transformedTaxRates;
exports.getTaxValue = getTaxValue;
exports.getTaxName = getTaxName;
exports.getEnabledTaxRateCount = getEnabledTaxRateCount;
exports.getUpdatedTransaction = getUpdatedTransaction;
exports.getDescription = getDescription;
exports.getRequestType = getRequestType;
exports.getExpenseType = getExpenseType;
exports.isManualRequest = isManualRequest;
exports.isScanRequest = isScanRequest;
exports.getAmount = getAmount;
exports.getAttendees = getAttendees;
exports.getTaxAmount = getTaxAmount;
exports.getTaxCode = getTaxCode;
exports.getCurrency = getCurrency;
exports.getCardID = getCardID;
exports.getOriginalCurrency = getOriginalCurrency;
exports.getOriginalAmount = getOriginalAmount;
exports.getFormattedAttendees = getFormattedAttendees;
exports.getMerchant = getMerchant;
exports.hasAnyTransactionWithoutRTERViolation = hasAnyTransactionWithoutRTERViolation;
exports.getMerchantOrDescription = getMerchantOrDescription;
exports.getMCCGroup = getMCCGroup;
exports.getCreated = getCreated;
exports.getFormattedCreated = getFormattedCreated;
exports.getCategory = getCategory;
exports.getBillable = getBillable;
exports.getTag = getTag;
exports.getTagArrayFromName = getTagArrayFromName;
exports.getTagForDisplay = getTagForDisplay;
exports.getTransactionViolations = getTransactionViolations;
exports.hasReceipt = hasReceipt;
exports.hasEReceipt = hasEReceipt;
exports.hasRoute = hasRoute;
exports.isReceiptBeingScanned = isReceiptBeingScanned;
exports.didReceiptScanSucceed = didReceiptScanSucceed;
exports.getValidWaypoints = getValidWaypoints;
exports.isDistanceRequest = isDistanceRequest;
exports.isFetchingWaypointsFromServer = isFetchingWaypointsFromServer;
exports.isExpensifyCardTransaction = isExpensifyCardTransaction;
exports.isCardTransaction = isCardTransaction;
exports.isDuplicate = isDuplicate;
exports.isPending = isPending;
exports.isPosted = isPosted;
exports.isOnHold = isOnHold;
exports.isOnHoldByTransactionID = isOnHoldByTransactionID;
exports.getWaypoints = getWaypoints;
exports.isAmountMissing = isAmountMissing;
exports.isMerchantMissing = isMerchantMissing;
exports.isPartialMerchant = isPartialMerchant;
exports.isPartial = isPartial;
exports.isCreatedMissing = isCreatedMissing;
exports.areRequiredFieldsEmpty = areRequiredFieldsEmpty;
exports.hasMissingSmartscanFields = hasMissingSmartscanFields;
exports.hasPendingRTERViolation = hasPendingRTERViolation;
exports.allHavePendingRTERViolation = allHavePendingRTERViolation;
exports.hasPendingUI = hasPendingUI;
exports.getWaypointIndex = getWaypointIndex;
exports.waypointHasValidAddress = waypointHasValidAddress;
exports.getRecentTransactions = getRecentTransactions;
exports.hasReservationList = hasReservationList;
exports.hasViolation = hasViolation;
exports.hasDuplicateTransactions = hasDuplicateTransactions;
exports.hasBrokenConnectionViolation = hasBrokenConnectionViolation;
exports.shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolation;
exports.shouldShowBrokenConnectionViolationForMultipleTransactions = shouldShowBrokenConnectionViolationForMultipleTransactions;
exports.hasNoticeTypeViolation = hasNoticeTypeViolation;
exports.hasWarningTypeViolation = hasWarningTypeViolation;
exports.isCustomUnitRateIDForP2P = isCustomUnitRateIDForP2P;
exports.getRateID = getRateID;
exports.compareDuplicateTransactionFields = compareDuplicateTransactionFields;
exports.getTransactionID = getTransactionID;
exports.buildNewTransactionAfterReviewingDuplicates = buildNewTransactionAfterReviewingDuplicates;
exports.buildMergeDuplicatesParams = buildMergeDuplicatesParams;
exports.getReimbursable = getReimbursable;
exports.isPayAtEndExpense = isPayAtEndExpense;
exports.removeSettledAndApprovedTransactions = removeSettledAndApprovedTransactions;
exports.getCardName = getCardName;
exports.hasReceiptSource = hasReceiptSource;
exports.shouldShowAttendees = shouldShowAttendees;
exports.getAllSortedTransactions = getAllSortedTransactions;
exports.getFormattedPostedDate = getFormattedPostedDate;
exports.getCategoryTaxCodeAndAmount = getCategoryTaxCodeAndAmount;
exports.isPerDiemRequest = isPerDiemRequest;
exports.isViolationDismissed = isViolationDismissed;
exports.isBrokenConnectionViolation = isBrokenConnectionViolation;
exports.shouldShowRTERViolationMessage = shouldShowRTERViolationMessage;
exports.isPartialTransaction = isPartialTransaction;
exports.isPendingCardOrScanningTransaction = isPendingCardOrScanningTransaction;
exports.isScanning = isScanning;
exports.getTransactionOrDraftTransaction = getTransactionOrDraftTransaction;
exports.checkIfShouldShowMarkAsCashButton = checkIfShouldShowMarkAsCashButton;
exports.getTransactionPendingAction = getTransactionPendingAction;
exports.isTransactionPendingDelete = isTransactionPendingDelete;
exports.createUnreportedExpenseSections = createUnreportedExpenseSections;
var date_fns_1 = require("date-fns");
var fast_equals_1 = require("fast-equals");
var cloneDeep_1 = require("lodash/cloneDeep");
var has_1 = require("lodash/has");
var set_1 = require("lodash/set");
var react_native_onyx_1 = require("react-native-onyx");
var Category_1 = require("@libs/actions/Policy/Category");
var Tag_1 = require("@libs/actions/Policy/Tag");
var CategoryUtils_1 = require("@libs/CategoryUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DateUtils_1 = require("@libs/DateUtils");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var LocaleDigitUtils_1 = require("@libs/LocaleDigitUtils");
var Localize_1 = require("@libs/Localize");
var NumberUtils_1 = require("@libs/NumberUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var getDistanceInMeters_1 = require("./getDistanceInMeters");
exports.getDistanceInMeters = getDistanceInMeters_1.default;
var allTransactions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            return;
        }
        allTransactions = Object.fromEntries(Object.entries(value).filter(function (_a) {
            var transaction = _a[1];
            return !!transaction;
        }));
    },
});
var allTransactionDrafts = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allTransactionDrafts = value !== null && value !== void 0 ? value : {};
    },
});
var allReports = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var allTransactionViolations = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) { return (allTransactionViolations = value); },
});
var currentUserEmail = '';
var currentUserAccountID = -1;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (val) {
        var _a, _b;
        currentUserEmail = (_a = val === null || val === void 0 ? void 0 : val.email) !== null && _a !== void 0 ? _a : '';
        currentUserAccountID = (_b = val === null || val === void 0 ? void 0 : val.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    },
});
function isDistanceRequest(transaction) {
    var _a, _b, _c;
    // This is used during the expense creation flow before the transaction has been saved to the server
    if ((0, has_1.default)(transaction, 'iouRequestType')) {
        return (transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType) === CONST_1.default.IOU.REQUEST_TYPE.DISTANCE;
    }
    // This is the case for transaction objects once they have been saved to the server
    var type = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.type;
    var customUnitName = (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.customUnit) === null || _c === void 0 ? void 0 : _c.name;
    return type === CONST_1.default.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST_1.default.CUSTOM_UNITS.NAME_DISTANCE;
}
function isScanRequest(transaction) {
    var _a;
    // This is used during the expense creation flow before the transaction has been saved to the server
    if ((0, has_1.default)(transaction, 'iouRequestType')) {
        return (transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType) === CONST_1.default.IOU.REQUEST_TYPE.SCAN;
    }
    return !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.source) && (transaction === null || transaction === void 0 ? void 0 : transaction.amount) === 0;
}
function isPerDiemRequest(transaction) {
    var _a, _b, _c;
    // This is used during the expense creation flow before the transaction has been saved to the server
    if ((0, has_1.default)(transaction, 'iouRequestType')) {
        return (transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType) === CONST_1.default.IOU.REQUEST_TYPE.PER_DIEM;
    }
    // This is the case for transaction objects once they have been saved to the server
    var type = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.type;
    var customUnitName = (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.customUnit) === null || _c === void 0 ? void 0 : _c.name;
    return type === CONST_1.default.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST_1.default.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL;
}
function getRequestType(transaction) {
    if (isDistanceRequest(transaction)) {
        return CONST_1.default.IOU.REQUEST_TYPE.DISTANCE;
    }
    if (isScanRequest(transaction)) {
        return CONST_1.default.IOU.REQUEST_TYPE.SCAN;
    }
    if (isPerDiemRequest(transaction)) {
        return CONST_1.default.IOU.REQUEST_TYPE.PER_DIEM;
    }
    return CONST_1.default.IOU.REQUEST_TYPE.MANUAL;
}
/**
 * Determines the expense type of a given transaction.
 */
function getExpenseType(transaction) {
    if (!transaction) {
        return undefined;
    }
    if (isExpensifyCardTransaction(transaction)) {
        if (isPending(transaction)) {
            return CONST_1.default.IOU.EXPENSE_TYPE.PENDING_EXPENSIFY_CARD;
        }
        return CONST_1.default.IOU.EXPENSE_TYPE.EXPENSIFY_CARD;
    }
    return getRequestType(transaction);
}
function isManualRequest(transaction) {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if ((0, has_1.default)(transaction, 'iouRequestType')) {
        return transaction.iouRequestType === CONST_1.default.IOU.REQUEST_TYPE.MANUAL;
    }
    return getRequestType(transaction) === CONST_1.default.IOU.REQUEST_TYPE.MANUAL;
}
function isPartialTransaction(transaction) {
    var merchant = getMerchant(transaction);
    if (!merchant || isPartialMerchant(merchant)) {
        return true;
    }
    if (isAmountMissing(transaction) && isScanRequest(transaction)) {
        return true;
    }
    return false;
}
function isPendingCardOrScanningTransaction(transaction) {
    return (isExpensifyCardTransaction(transaction) && isPending(transaction)) || isPartialTransaction(transaction) || (isScanRequest(transaction) && isScanning(transaction));
}
/**
 * Optimistically generate a transaction.
 *
 * @param amount – in cents
 * @param [existingTransactionID] When creating a distance expense, an empty transaction has already been created with a transactionID. In that case, the transaction here needs to have
 * it's transactionID match what was already generated.
 */
function buildOptimisticTransaction(params) {
    var _a, _b;
    var _c = params.originalTransactionID, originalTransactionID = _c === void 0 ? '' : _c, existingTransactionID = params.existingTransactionID, existingTransaction = params.existingTransaction, policy = params.policy, transactionParams = params.transactionParams;
    var amount = transactionParams.amount, currency = transactionParams.currency, reportID = transactionParams.reportID, _d = transactionParams.comment, comment = _d === void 0 ? '' : _d, _e = transactionParams.attendees, attendees = _e === void 0 ? [] : _e, _f = transactionParams.created, created = _f === void 0 ? '' : _f, _g = transactionParams.merchant, merchant = _g === void 0 ? '' : _g, receipt = transactionParams.receipt, _h = transactionParams.category, category = _h === void 0 ? '' : _h, _j = transactionParams.tag, tag = _j === void 0 ? '' : _j, _k = transactionParams.taxCode, taxCode = _k === void 0 ? '' : _k, _l = transactionParams.taxAmount, taxAmount = _l === void 0 ? 0 : _l, _m = transactionParams.billable, billable = _m === void 0 ? false : _m, pendingFields = transactionParams.pendingFields, _o = transactionParams.reimbursable, reimbursable = _o === void 0 ? true : _o, _p = transactionParams.source, source = _p === void 0 ? '' : _p, _q = transactionParams.filename, filename = _q === void 0 ? '' : _q, customUnit = transactionParams.customUnit, splitExpenses = transactionParams.splitExpenses, participants = transactionParams.participants;
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    var transactionID = existingTransactionID !== null && existingTransactionID !== void 0 ? existingTransactionID : (0, NumberUtils_1.rand64)();
    var commentJSON = { comment: comment, attendees: attendees };
    if (source) {
        commentJSON.source = source;
    }
    if (originalTransactionID) {
        commentJSON.originalTransactionID = originalTransactionID;
    }
    if (splitExpenses) {
        commentJSON.splitExpenses = splitExpenses;
    }
    var isDistanceTransaction = !!(pendingFields === null || pendingFields === void 0 ? void 0 : pendingFields.waypoints);
    if (isDistanceTransaction) {
        // Set the distance unit, which comes from the policy distance unit or the P2P rate data
        (0, set_1.default)(commentJSON, 'customUnit.distanceUnit', DistanceRequestUtils_1.default.getUpdatedDistanceUnit({ transaction: existingTransaction, policy: policy }));
    }
    var isPerDiemTransaction = !!(pendingFields === null || pendingFields === void 0 ? void 0 : pendingFields.subRates);
    if (isPerDiemTransaction) {
        // Set the custom unit, which comes from the policy per diem rate data
        (0, set_1.default)(commentJSON, 'customUnit', customUnit);
    }
    return __assign(__assign({}, (!(0, EmptyObject_1.isEmptyObject)(pendingFields) ? { pendingFields: pendingFields } : {})), { transactionID: transactionID, amount: amount, currency: currency, reportID: reportID, comment: commentJSON, merchant: merchant || CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, created: created || DateUtils_1.default.getDBTime(), pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, receipt: (receipt === null || receipt === void 0 ? void 0 : receipt.source) ? { source: receipt.source, state: (_a = receipt.state) !== null && _a !== void 0 ? _a : CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY, isTestDriveReceipt: receipt.isTestDriveReceipt } : {}, filename: ((receipt === null || receipt === void 0 ? void 0 : receipt.source) ? ((_b = receipt === null || receipt === void 0 ? void 0 : receipt.name) !== null && _b !== void 0 ? _b : filename) : filename).toString(), category: category, tag: tag, taxCode: taxCode, taxAmount: taxAmount, billable: billable, reimbursable: reimbursable, inserted: DateUtils_1.default.getDBTime(), participants: participants });
}
/**
 * Check if the transaction has an Ereceipt
 */
function hasEReceipt(transaction) {
    return !!(transaction === null || transaction === void 0 ? void 0 : transaction.hasEReceipt);
}
function hasReceipt(transaction) {
    var _a;
    return !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.state) || hasEReceipt(transaction);
}
/** Check if the receipt has the source file */
function hasReceiptSource(transaction) {
    var _a;
    return !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.source);
}
function isMerchantMissing(transaction) {
    if ((transaction === null || transaction === void 0 ? void 0 : transaction.modifiedMerchant) && transaction.modifiedMerchant !== '') {
        return transaction.modifiedMerchant === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    }
    var isMerchantEmpty = (transaction === null || transaction === void 0 ? void 0 : transaction.merchant) === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || (transaction === null || transaction === void 0 ? void 0 : transaction.merchant) === '';
    return isMerchantEmpty;
}
/**
 * Determine if we should show the attendee selector for a given expense on a give policy.
 */
function shouldShowAttendees(iouType, policy) {
    var _a;
    if ((iouType !== CONST_1.default.IOU.TYPE.SUBMIT && iouType !== CONST_1.default.IOU.TYPE.CREATE) || !(policy === null || policy === void 0 ? void 0 : policy.id) || (policy === null || policy === void 0 ? void 0 : policy.type) !== CONST_1.default.POLICY.TYPE.CORPORATE) {
        return false;
    }
    // For backwards compatibility with Expensify Classic, we assume that Attendee Tracking is enabled by default on
    // Control policies if the policy does not contain the attribute
    return (_a = policy === null || policy === void 0 ? void 0 : policy.isAttendeeTrackingEnabled) !== null && _a !== void 0 ? _a : true;
}
/**
 * Check if the merchant is partial i.e. `(none)`
 */
function isPartialMerchant(merchant) {
    return merchant === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
}
function isAmountMissing(transaction) {
    return (transaction === null || transaction === void 0 ? void 0 : transaction.amount) === 0 && (!transaction.modifiedAmount || transaction.modifiedAmount === 0);
}
function isPartial(transaction) {
    return isPartialMerchant(getMerchant(transaction)) && isAmountMissing(transaction);
}
function isCreatedMissing(transaction) {
    if (!transaction) {
        return true;
    }
    return (transaction === null || transaction === void 0 ? void 0 : transaction.created) === '' && (!transaction.created || transaction.modifiedCreated === '');
}
function areRequiredFieldsEmpty(transaction) {
    var _a, _b;
    var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)];
    var isFromExpenseReport = (parentReport === null || parentReport === void 0 ? void 0 : parentReport.type) === CONST_1.default.REPORT.TYPE.EXPENSE;
    var isSplitPolicyExpenseChat = !!((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.splits) === null || _b === void 0 ? void 0 : _b.some(function (participant) { var _a; return (_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(participant.chatReportID)]) === null || _a === void 0 ? void 0 : _a.isOwnPolicyExpenseChat; }));
    var isMerchantRequired = isFromExpenseReport || isSplitPolicyExpenseChat;
    return (isMerchantRequired && isMerchantMissing(transaction)) || isAmountMissing(transaction) || isCreatedMissing(transaction);
}
/**
 * Given the edit made to the expense, return an updated transaction object.
 */
function getUpdatedTransaction(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var transaction = _a.transaction, transactionChanges = _a.transactionChanges, isFromExpenseReport = _a.isFromExpenseReport, _o = _a.shouldUpdateReceiptState, shouldUpdateReceiptState = _o === void 0 ? true : _o, _p = _a.policy, policy = _p === void 0 ? undefined : _p;
    // Only changing the first level fields so no need for deep clone now
    var updatedTransaction = (0, cloneDeep_1.default)(transaction);
    var shouldStopSmartscan = false;
    // The comment property does not have its modifiedComment counterpart
    if (Object.hasOwn(transactionChanges, 'comment')) {
        updatedTransaction.comment = __assign(__assign({}, updatedTransaction.comment), { comment: transactionChanges.comment });
    }
    if (Object.hasOwn(transactionChanges, 'created')) {
        updatedTransaction.modifiedCreated = transactionChanges.created;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'amount') && typeof transactionChanges.amount === 'number') {
        updatedTransaction.modifiedAmount = isFromExpenseReport ? -transactionChanges.amount : transactionChanges.amount;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'currency')) {
        updatedTransaction.modifiedCurrency = transactionChanges.currency;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'merchant')) {
        updatedTransaction.modifiedMerchant = transactionChanges.merchant;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'waypoints')) {
        updatedTransaction.modifiedWaypoints = transactionChanges.waypoints;
        updatedTransaction.isLoading = true;
        shouldStopSmartscan = true;
        if (!((_d = (_c = (_b = transactionChanges.routes) === null || _b === void 0 ? void 0 : _b.route0) === null || _c === void 0 ? void 0 : _c.geometry) === null || _d === void 0 ? void 0 : _d.coordinates)) {
            // The waypoints were changed, but there is no route – it is pending from the BE and we should mark the fields as pending
            updatedTransaction.amount = CONST_1.default.IOU.DEFAULT_AMOUNT;
            updatedTransaction.modifiedAmount = CONST_1.default.IOU.DEFAULT_AMOUNT;
            updatedTransaction.modifiedMerchant = (0, Localize_1.translateLocal)('iou.fieldPending');
        }
        else {
            var mileageRate = DistanceRequestUtils_1.default.getRate({ transaction: updatedTransaction, policy: policy });
            var unit = mileageRate.unit, rate = mileageRate.rate;
            var distanceInMeters = (0, getDistanceInMeters_1.default)(transaction, unit);
            var amount = DistanceRequestUtils_1.default.getDistanceRequestAmount(distanceInMeters, unit, rate !== null && rate !== void 0 ? rate : 0);
            var updatedAmount = isFromExpenseReport ? -amount : amount;
            var updatedMerchant = DistanceRequestUtils_1.default.getDistanceMerchant(true, distanceInMeters, unit, rate, transaction.currency, Localize_1.translateLocal, function (digit) {
                return (0, LocaleDigitUtils_1.toLocaleDigit)(IntlStore_1.default.getCurrentLocale(), digit);
            });
            updatedTransaction.amount = updatedAmount;
            updatedTransaction.modifiedAmount = updatedAmount;
            updatedTransaction.modifiedMerchant = updatedMerchant;
        }
    }
    if (Object.hasOwn(transactionChanges, 'customUnitRateID')) {
        (0, set_1.default)(updatedTransaction, 'comment.customUnit.customUnitRateID', transactionChanges.customUnitRateID);
        (0, set_1.default)(updatedTransaction, 'comment.customUnit.defaultP2PRate', null);
        shouldStopSmartscan = true;
        var existingDistanceUnit = (_f = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _e === void 0 ? void 0 : _e.customUnit) === null || _f === void 0 ? void 0 : _f.distanceUnit;
        // Get the new distance unit from the rate's unit
        var newDistanceUnit = DistanceRequestUtils_1.default.getUpdatedDistanceUnit({ transaction: updatedTransaction, policy: policy });
        (0, set_1.default)(updatedTransaction, 'comment.customUnit.distanceUnit', newDistanceUnit);
        // If the distanceUnit is set and the rate is changed to one that has a different unit, convert the distance to the new unit
        if (existingDistanceUnit && newDistanceUnit !== existingDistanceUnit) {
            var conversionFactor = existingDistanceUnit === CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? CONST_1.default.CUSTOM_UNITS.MILES_TO_KILOMETERS : CONST_1.default.CUSTOM_UNITS.KILOMETERS_TO_MILES;
            var distance = (0, NumberUtils_1.roundToTwoDecimalPlaces)(((_j = (_h = (_g = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _g === void 0 ? void 0 : _g.customUnit) === null || _h === void 0 ? void 0 : _h.quantity) !== null && _j !== void 0 ? _j : 0) * conversionFactor);
            (0, set_1.default)(updatedTransaction, 'comment.customUnit.quantity', distance);
        }
        if (!isFetchingWaypointsFromServer(transaction)) {
            // When the waypoints are being fetched from the server, we have no information about the distance, and cannot recalculate the updated amount.
            // Otherwise, recalculate the fields based on the new rate.
            var oldMileageRate = DistanceRequestUtils_1.default.getRate({ transaction: transaction, policy: policy });
            var updatedMileageRate = DistanceRequestUtils_1.default.getRate({ transaction: updatedTransaction, policy: policy, useTransactionDistanceUnit: false });
            var unit = updatedMileageRate.unit, rate = updatedMileageRate.rate;
            var distanceInMeters = (0, getDistanceInMeters_1.default)(transaction, oldMileageRate === null || oldMileageRate === void 0 ? void 0 : oldMileageRate.unit);
            var amount = DistanceRequestUtils_1.default.getDistanceRequestAmount(distanceInMeters, unit, rate !== null && rate !== void 0 ? rate : 0);
            var updatedAmount = isFromExpenseReport ? -amount : amount;
            var updatedCurrency = (_k = updatedMileageRate.currency) !== null && _k !== void 0 ? _k : CONST_1.default.CURRENCY.USD;
            var updatedMerchant = DistanceRequestUtils_1.default.getDistanceMerchant(true, distanceInMeters, unit, rate, updatedCurrency, Localize_1.translateLocal, function (digit) {
                return (0, LocaleDigitUtils_1.toLocaleDigit)(IntlStore_1.default.getCurrentLocale(), digit);
            });
            updatedTransaction.amount = updatedAmount;
            updatedTransaction.modifiedAmount = updatedAmount;
            updatedTransaction.modifiedMerchant = updatedMerchant;
            updatedTransaction.modifiedCurrency = updatedCurrency;
        }
    }
    if (Object.hasOwn(transactionChanges, 'taxAmount') && typeof transactionChanges.taxAmount === 'number') {
        updatedTransaction.taxAmount = isFromExpenseReport ? -transactionChanges.taxAmount : transactionChanges.taxAmount;
    }
    if (Object.hasOwn(transactionChanges, 'taxCode') && typeof transactionChanges.taxCode === 'string') {
        updatedTransaction.taxCode = transactionChanges.taxCode;
    }
    if (Object.hasOwn(transactionChanges, 'billable') && typeof transactionChanges.billable === 'boolean') {
        updatedTransaction.billable = transactionChanges.billable;
    }
    if (Object.hasOwn(transactionChanges, 'category') && typeof transactionChanges.category === 'string') {
        updatedTransaction.category = transactionChanges.category;
        var _q = getCategoryTaxCodeAndAmount(transactionChanges.category, transaction, policy), categoryTaxCode = _q.categoryTaxCode, categoryTaxAmount = _q.categoryTaxAmount;
        if (categoryTaxCode && categoryTaxAmount !== undefined) {
            updatedTransaction.taxCode = categoryTaxCode;
            updatedTransaction.taxAmount = categoryTaxAmount;
        }
    }
    if (Object.hasOwn(transactionChanges, 'tag') && typeof transactionChanges.tag === 'string') {
        updatedTransaction.tag = transactionChanges.tag;
    }
    if (Object.hasOwn(transactionChanges, 'attendees')) {
        updatedTransaction.modifiedAttendees = transactionChanges === null || transactionChanges === void 0 ? void 0 : transactionChanges.attendees;
    }
    if (shouldUpdateReceiptState &&
        shouldStopSmartscan &&
        (transaction === null || transaction === void 0 ? void 0 : transaction.receipt) &&
        Object.keys(transaction.receipt).length > 0 &&
        ((_l = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _l === void 0 ? void 0 : _l.state) !== CONST_1.default.IOU.RECEIPT_STATE.OPEN &&
        updatedTransaction.receipt) {
        updatedTransaction.receipt.state = CONST_1.default.IOU.RECEIPT_STATE.OPEN;
    }
    updatedTransaction.pendingFields = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, ((_m = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.pendingFields) !== null && _m !== void 0 ? _m : {})), (Object.hasOwn(transactionChanges, 'comment') && { comment: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'created') && { created: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'amount') && { amount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'currency') && { currency: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'merchant') && { merchant: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'waypoints') && { waypoints: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'billable') && { billable: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'category') && { category: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'tag') && { tag: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'taxAmount') && { taxAmount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'taxCode') && { taxCode: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (Object.hasOwn(transactionChanges, 'attendees') && { attendees: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }));
    return updatedTransaction;
}
/**
 * Return the comment field (referred to as description in the App) from the transaction.
 * The comment does not have its modifiedComment counterpart.
 */
function getDescription(transaction) {
    var _a, _b, _c;
    // Casting the description to string to avoid wrong data types (e.g. number) being returned from the API
    return (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.comment) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '';
}
/**
 * Return the amount field from the transaction, return the modifiedAmount if present.
 */
function getAmount(transaction, isFromExpenseReport, isFromTrackedExpense, allowNegative, disableOppositeConversion) {
    var _a, _b, _c, _d, _e;
    if (isFromExpenseReport === void 0) { isFromExpenseReport = false; }
    if (isFromTrackedExpense === void 0) { isFromTrackedExpense = false; }
    if (allowNegative === void 0) { allowNegative = false; }
    if (disableOppositeConversion === void 0) { disableOppositeConversion = false; }
    // IOU requests cannot have negative values, but they can be stored as negative values, let's return absolute value
    if ((!isFromExpenseReport || isFromTrackedExpense) && !allowNegative) {
        var amount_1 = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAmount) !== null && _a !== void 0 ? _a : 0;
        if (amount_1) {
            return Math.abs(amount_1);
        }
        return Math.abs((_b = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _b !== void 0 ? _b : 0);
    }
    if (disableOppositeConversion) {
        return (_c = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _c !== void 0 ? _c : 0;
    }
    // Expense report case:
    // The amounts are stored using an opposite sign and negative values can be set,
    // we need to return an opposite sign than is saved in the transaction object
    var amount = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAmount) !== null && _d !== void 0 ? _d : 0;
    if (amount) {
        return -amount;
    }
    amount = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _e !== void 0 ? _e : 0;
    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    return amount ? -amount : 0;
}
/**
 * Return the tax amount field from the transaction.
 */
function getTaxAmount(transaction, isFromExpenseReport) {
    var _a, _b;
    // IOU requests cannot have negative values but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport) {
        return Math.abs((_a = transaction === null || transaction === void 0 ? void 0 : transaction.taxAmount) !== null && _a !== void 0 ? _a : 0);
    }
    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    var amount = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.taxAmount) !== null && _b !== void 0 ? _b : 0;
    return amount ? -amount : 0;
}
/**
 * Return the tax code from the transaction.
 */
function getTaxCode(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.taxCode) !== null && _a !== void 0 ? _a : '';
}
/**
 * Return the posted date from the transaction.
 */
function getPostedDate(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.posted) !== null && _a !== void 0 ? _a : '';
}
/**
 * Return the formatted posted date from the transaction.
 */
function getFormattedPostedDate(transaction, dateFormat) {
    if (dateFormat === void 0) { dateFormat = CONST_1.default.DATE.FNS_FORMAT_STRING; }
    var postedDate = getPostedDate(transaction);
    var parsedDate = (0, date_fns_1.parse)(postedDate, 'yyyyMMdd', new Date());
    if ((0, date_fns_1.isValid)(parsedDate)) {
        return DateUtils_1.default.formatWithUTCTimeZone((0, date_fns_1.format)(parsedDate, 'yyyy-MM-dd'), dateFormat);
    }
    return '';
}
/**
 * Return the currency field from the transaction, return the modifiedCurrency if present.
 */
function getCurrency(transaction) {
    var _a, _b;
    var currency = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedCurrency) !== null && _a !== void 0 ? _a : '';
    if (currency) {
        return currency;
    }
    return (_b = transaction === null || transaction === void 0 ? void 0 : transaction.currency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD;
}
/**
 * Return the original currency field from the transaction.
 */
function getOriginalCurrency(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.originalCurrency) !== null && _a !== void 0 ? _a : '';
}
/**
 * Return the absolute value of the original amount field from the transaction.
 */
function getOriginalAmount(transaction) {
    var _a;
    var amount = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.originalAmount) !== null && _a !== void 0 ? _a : 0;
    return Math.abs(amount);
}
/**
 * Verify if the transaction is expecting the distance to be calculated on the server
 */
function isFetchingWaypointsFromServer(transaction) {
    var _a;
    return !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.pendingFields) === null || _a === void 0 ? void 0 : _a.waypoints);
}
/**
 * Return the merchant field from the transaction, return the modifiedMerchant if present.
 */
function getMerchant(transaction, policyParam) {
    var _a;
    if (policyParam === void 0) { policyParam = undefined; }
    if (transaction && isDistanceRequest(transaction)) {
        var report = (0, ReportUtils_1.getReportOrDraftReport)(transaction.reportID);
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var policy = policyParam !== null && policyParam !== void 0 ? policyParam : (0, PolicyUtils_1.getPolicy)(report === null || report === void 0 ? void 0 : report.policyID);
        var mileageRate = DistanceRequestUtils_1.default.getRate({ transaction: transaction, policy: policy });
        var unit = mileageRate.unit, rate = mileageRate.rate;
        var distanceInMeters = (0, getDistanceInMeters_1.default)(transaction, unit);
        return DistanceRequestUtils_1.default.getDistanceMerchant(true, distanceInMeters, unit, rate, transaction.currency, Localize_1.translateLocal, function (digit) {
            return (0, LocaleDigitUtils_1.toLocaleDigit)(IntlStore_1.default.getCurrentLocale(), digit);
        });
    }
    return (transaction === null || transaction === void 0 ? void 0 : transaction.modifiedMerchant) ? transaction.modifiedMerchant : ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.merchant) !== null && _a !== void 0 ? _a : '');
}
function getMerchantOrDescription(transaction) {
    return !isMerchantMissing(transaction) ? getMerchant(transaction) : getDescription(transaction);
}
/**
 * Return the list of modified attendees if present otherwise list of attendees
 */
function getAttendees(transaction) {
    var _a, _b, _c, _d, _e, _f, _g;
    var attendees = (transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAttendees) ? transaction.modifiedAttendees : ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.attendees) !== null && _b !== void 0 ? _b : []);
    if (attendees.length === 0) {
        var details = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(currentUserEmail);
        attendees.push({
            email: currentUserEmail,
            login: (_c = details === null || details === void 0 ? void 0 : details.login) !== null && _c !== void 0 ? _c : currentUserEmail,
            displayName: (_d = details === null || details === void 0 ? void 0 : details.displayName) !== null && _d !== void 0 ? _d : currentUserEmail,
            accountID: currentUserAccountID,
            text: (_e = details === null || details === void 0 ? void 0 : details.displayName) !== null && _e !== void 0 ? _e : currentUserEmail,
            searchText: (_f = details === null || details === void 0 ? void 0 : details.displayName) !== null && _f !== void 0 ? _f : currentUserEmail,
            avatarUrl: (_g = details === null || details === void 0 ? void 0 : details.avatarThumbnail) !== null && _g !== void 0 ? _g : '',
            selected: true,
        });
    }
    return attendees;
}
/**
 * Return the list of attendees as a string and modified list of attendees as a string if present.
 */
function getFormattedAttendees(modifiedAttendees, attendees) {
    var oldAttendees = modifiedAttendees !== null && modifiedAttendees !== void 0 ? modifiedAttendees : [];
    var newAttendees = attendees !== null && attendees !== void 0 ? attendees : [];
    return [oldAttendees.map(function (item) { var _a; return (_a = item.displayName) !== null && _a !== void 0 ? _a : item.login; }).join(', '), newAttendees.map(function (item) { var _a; return (_a = item.displayName) !== null && _a !== void 0 ? _a : item.login; }).join(', ')];
}
/**
 * Return the reimbursable value. Defaults to true to match BE logic.
 */
function getReimbursable(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.reimbursable) !== null && _a !== void 0 ? _a : true;
}
/**
 * Return the mccGroup field from the transaction, return the modifiedMCCGroup if present.
 */
function getMCCGroup(transaction) {
    return (transaction === null || transaction === void 0 ? void 0 : transaction.modifiedMCCGroup) ? transaction.modifiedMCCGroup : transaction === null || transaction === void 0 ? void 0 : transaction.mccGroup;
}
/**
 * Return the waypoints field from the transaction, return the modifiedWaypoints if present.
 */
function getWaypoints(transaction) {
    var _a, _b;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedWaypoints) !== null && _a !== void 0 ? _a : (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.waypoints;
}
/**
 * Return the category from the transaction. This "category" field has no "modified" complement.
 */
function getCategory(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.category) !== null && _a !== void 0 ? _a : '';
}
/**
 * Return the cardID from the transaction.
 */
function getCardID(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.cardID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
}
/**
 * Return the billable field from the transaction. This "billable" field has no "modified" complement.
 */
function getBillable(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.billable) !== null && _a !== void 0 ? _a : false;
}
/**
 * Return a colon-delimited tag string as an array, considering escaped colons and double backslashes.
 */
function getTagArrayFromName(tagName) {
    // WAIT!!!!!!!!!!!!!!!!!!
    // You need to keep this in sync with TransactionUtils.php
    // We need to be able to preserve double backslashes in the original string
    // and not have it interfere with splitting on a colon (:).
    // So, let's replace it with something absurd to begin with, do our split, and
    // then replace the double backslashes in the end.
    var tagWithoutDoubleSlashes = tagName.replace(/\\\\/g, '☠');
    var tagWithoutEscapedColons = tagWithoutDoubleSlashes.replace(/\\:/g, '☢');
    // Do our split
    var matches = tagWithoutEscapedColons.split(':');
    var newMatches = [];
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var item = matches_1[_i];
        var tagWithEscapedColons = item.replace(/☢/g, '\\:');
        var tagWithDoubleSlashes = tagWithEscapedColons.replace(/☠/g, '\\\\');
        newMatches.push(tagWithDoubleSlashes);
    }
    return newMatches;
}
/**
 * Return the tag from the transaction. When the tagIndex is passed, return the tag based on the index.
 * This "tag" field has no "modified" complement.
 */
function getTag(transaction, tagIndex) {
    var _a, _b, _c;
    if (tagIndex !== undefined) {
        var tagsArray = getTagArrayFromName((_a = transaction === null || transaction === void 0 ? void 0 : transaction.tag) !== null && _a !== void 0 ? _a : '');
        return (_b = tagsArray.at(tagIndex)) !== null && _b !== void 0 ? _b : '';
    }
    return (_c = transaction === null || transaction === void 0 ? void 0 : transaction.tag) !== null && _c !== void 0 ? _c : '';
}
function getTagForDisplay(transaction, tagIndex) {
    return (0, PolicyUtils_1.getCleanedTagName)(getTag(transaction, tagIndex));
}
function getCreated(transaction) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return (transaction === null || transaction === void 0 ? void 0 : transaction.modifiedCreated) ? transaction.modifiedCreated : (transaction === null || transaction === void 0 ? void 0 : transaction.created) || '';
}
/**
 * Return the created field from the transaction, return the modifiedCreated if present.
 */
function getFormattedCreated(transaction, dateFormat) {
    if (dateFormat === void 0) { dateFormat = CONST_1.default.DATE.FNS_FORMAT_STRING; }
    var created = getCreated(transaction);
    return DateUtils_1.default.formatWithUTCTimeZone(created, dateFormat);
}
/**
 * Determine whether a transaction is made with an Expensify card.
 */
function isExpensifyCardTransaction(transaction) {
    return (transaction === null || transaction === void 0 ? void 0 : transaction.bank) === CONST_1.default.EXPENSIFY_CARD.BANK;
}
/**
 * Determine whether a transaction is made with a card (Expensify or Company Card).
 */
function isCardTransaction(transaction) {
    return !!(transaction === null || transaction === void 0 ? void 0 : transaction.managedCard);
}
function getCardName(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.cardName) !== null && _a !== void 0 ? _a : '';
}
/**
 * Check if the transaction status is set to Pending.
 */
function isPending(transaction) {
    if (!(transaction === null || transaction === void 0 ? void 0 : transaction.status)) {
        return false;
    }
    return transaction.status === CONST_1.default.TRANSACTION.STATUS.PENDING;
}
/**
 * Check if the transaction status is set to Posted.
 */
function isPosted(transaction) {
    if (!transaction.status) {
        return false;
    }
    return transaction.status === CONST_1.default.TRANSACTION.STATUS.POSTED;
}
/**
 * The transaction is considered scanning if it is a partial transaction, has a receipt, and the receipt is being scanned.
 * Note that this does not include receipts that are being scanned in the background for auditing / smart scan everything, because there should be no indication to the user that the receipt is being scanned.
 */
function isScanning(transaction) {
    return isPartialTransaction(transaction) && hasReceipt(transaction) && isReceiptBeingScanned(transaction);
}
function isReceiptBeingScanned(transaction) {
    return [CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY, CONST_1.default.IOU.RECEIPT_STATE.SCANNING].some(function (value) { var _a; return value === ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.state); });
}
function didReceiptScanSucceed(transaction) {
    return [CONST_1.default.IOU.RECEIPT_STATE.SCAN_COMPLETE].some(function (value) { var _a; return value === ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.state); });
}
/**
 * Check if the transaction has a non-smart-scanning receipt and is missing required fields
 */
function hasMissingSmartscanFields(transaction) {
    return !!(transaction && !isDistanceRequest(transaction) && !isReceiptBeingScanned(transaction) && areRequiredFieldsEmpty(transaction));
}
/**
 * Get all transaction violations of the transaction with given transactionID.
 */
function getTransactionViolations(transaction, transactionViolations) {
    var _a;
    if (!transaction || !transactionViolations) {
        return undefined;
    }
    return (_a = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations[ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID]) === null || _a === void 0 ? void 0 : _a.filter(function (violation) { return !isViolationDismissed(transaction, violation); });
}
/**
 * Check if there is pending rter violation in transactionViolations.
 */
function hasPendingRTERViolation(transactionViolations) {
    return !!(transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.some(function (transactionViolation) {
        var _a, _b, _c;
        return transactionViolation.name === CONST_1.default.VIOLATIONS.RTER &&
            ((_a = transactionViolation.data) === null || _a === void 0 ? void 0 : _a.pendingPattern) &&
            ((_b = transactionViolation.data) === null || _b === void 0 ? void 0 : _b.rterType) !== CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION &&
            ((_c = transactionViolation.data) === null || _c === void 0 ? void 0 : _c.rterType) !== CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530;
    }));
}
/**
 * Check if there is broken connection violation.
 */
function hasBrokenConnectionViolation(transaction, transactionViolations) {
    var violations = getTransactionViolations(transaction, transactionViolations);
    return !!(violations === null || violations === void 0 ? void 0 : violations.find(function (violation) { return isBrokenConnectionViolation(violation); }));
}
function isBrokenConnectionViolation(violation) {
    var _a, _b;
    return (violation.name === CONST_1.default.VIOLATIONS.RTER &&
        (((_a = violation.data) === null || _a === void 0 ? void 0 : _a.rterType) === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || ((_b = violation.data) === null || _b === void 0 ? void 0 : _b.rterType) === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530));
}
function shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy) {
    if (brokenConnectionViolations.length === 0) {
        return false;
    }
    if (!(0, PolicyUtils_1.isPolicyAdmin)(policy) || (0, ReportUtils_1.isCurrentUserSubmitter)(report === null || report === void 0 ? void 0 : report.reportID)) {
        return true;
    }
    if ((0, ReportUtils_1.isOpenExpenseReport)(report)) {
        return true;
    }
    return (0, ReportUtils_1.isProcessingReport)(report) && (0, PolicyUtils_1.isInstantSubmitEnabled)(policy);
}
/**
 * Check if user should see broken connection violation warning based on violations list.
 */
function shouldShowBrokenConnectionViolation(report, policy, transactionViolations) {
    var brokenConnectionViolations = transactionViolations.filter(function (violation) { return isBrokenConnectionViolation(violation); });
    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}
/**
 * Check if user should see broken connection violation warning based on selected transactions.
 */
function shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, report, policy, transactionViolations) {
    var violations = transactionIDs.flatMap(function (id) { var _a; return (_a = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(id)]) !== null && _a !== void 0 ? _a : []; });
    var brokenConnectionViolations = violations.filter(function (violation) { return isBrokenConnectionViolation(violation); });
    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}
/**
 * Check if there is pending rter violation in all transactionViolations with given transactionIDs.
 */
function allHavePendingRTERViolation(transactions, transactionViolations) {
    if (!transactions) {
        return false;
    }
    var transactionsWithRTERViolations = transactions.map(function (transaction) {
        var filteredTransactionViolations = getTransactionViolations(transaction, transactionViolations);
        return hasPendingRTERViolation(filteredTransactionViolations);
    });
    return transactionsWithRTERViolations.length > 0 && transactionsWithRTERViolations.every(function (value) { return value === true; });
}
function checkIfShouldShowMarkAsCashButton(hasRTERPendingViolation, shouldDisplayBrokenConnectionViolation, report, policy) {
    if (hasRTERPendingViolation) {
        return true;
    }
    return (shouldDisplayBrokenConnectionViolation && (!(0, PolicyUtils_1.isPolicyAdmin)(policy) || (0, ReportUtils_1.isCurrentUserSubmitter)(report === null || report === void 0 ? void 0 : report.reportID)) && !(0, ReportUtils_1.isReportApproved)({ report: report }) && !(0, ReportUtils_1.isReportManuallyReimbursed)(report));
}
/**
 * Check if there is any transaction without RTER violation within the given transactionIDs.
 */
function hasAnyTransactionWithoutRTERViolation(transactions, transactionViolations) {
    return (transactions.length > 0 &&
        transactions.some(function (transaction) {
            return !hasBrokenConnectionViolation(transaction, transactionViolations);
        }));
}
/**
 * Check if the transaction is pending or has a pending rter violation.
 */
function hasPendingUI(transaction, transactionViolations) {
    return isScanning(transaction) || isPending(transaction) || (!!transaction && hasPendingRTERViolation(transactionViolations));
}
/**
 * Check if the transaction has a defined route
 */
function hasRoute(transaction, isDistanceRequestType) {
    var _a, _b, _c, _d, _e;
    return !!((_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.routes) === null || _a === void 0 ? void 0 : _a.route0) === null || _b === void 0 ? void 0 : _b.geometry) === null || _c === void 0 ? void 0 : _c.coordinates) || (!!isDistanceRequestType && !!((_e = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit) === null || _e === void 0 ? void 0 : _e.quantity));
}
function waypointHasValidAddress(waypoint) {
    var _a;
    return !!((_a = waypoint === null || waypoint === void 0 ? void 0 : waypoint.address) === null || _a === void 0 ? void 0 : _a.trim());
}
/**
 * Converts the key of a waypoint to its index
 */
function getWaypointIndex(key) {
    return Number(key.replace('waypoint', ''));
}
/**
 * Filters the waypoints which are valid and returns those
 */
function getValidWaypoints(waypoints, reArrangeIndexes) {
    if (reArrangeIndexes === void 0) { reArrangeIndexes = false; }
    if (!waypoints) {
        return {};
    }
    var sortedIndexes = Object.keys(waypoints)
        .map(getWaypointIndex)
        .sort(function (a, b) { return a - b; });
    var waypointValues = sortedIndexes.map(function (index) { return waypoints["waypoint".concat(index)]; });
    // Ensure the number of waypoints is between 2 and 25
    if (waypointValues.length < 2 || waypointValues.length > 25) {
        return {};
    }
    var lastWaypointIndex = -1;
    var waypointIndex = -1;
    return waypointValues.reduce(function (acc, currentWaypoint, index) {
        // Array.at(-1) returns the last element of the array
        // If a user does a round trip, the last waypoint will be the same as the first waypoint
        // We want to avoid comparing them as this will result in an incorrect duplicate waypoint error.
        var previousWaypoint = lastWaypointIndex !== -1 ? waypointValues.at(lastWaypointIndex) : undefined;
        // Check if the waypoint has a valid address
        if (!waypointHasValidAddress(currentWaypoint)) {
            return acc;
        }
        // Check for adjacent waypoints with the same address
        if (previousWaypoint && (currentWaypoint === null || currentWaypoint === void 0 ? void 0 : currentWaypoint.address) === previousWaypoint.address) {
            return acc;
        }
        acc["waypoint".concat(reArrangeIndexes ? waypointIndex + 1 : index)] = currentWaypoint;
        lastWaypointIndex = index;
        waypointIndex += 1;
        return acc;
    }, {});
}
/**
 * Returns the most recent transactions in an object
 */
function getRecentTransactions(transactions, size) {
    if (size === void 0) { size = 2; }
    return Object.keys(transactions)
        .sort(function (transactionID1, transactionID2) { return (new Date(transactions[transactionID1]) < new Date(transactions[transactionID2]) ? 1 : -1); })
        .slice(0, size);
}
/**
 * Check if transaction has duplicatedTransaction violation.
 * @param transactionID - the transaction to check
 * @param checkDismissed - whether to check if the violation has already been dismissed as well
 */
function isDuplicate(transaction, checkDismissed) {
    var _a;
    if (checkDismissed === void 0) { checkDismissed = false; }
    if (!transaction) {
        return false;
    }
    var duplicateViolation = (_a = allTransactionViolations === null || allTransactionViolations === void 0 ? void 0 : allTransactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID)]) === null || _a === void 0 ? void 0 : _a.find(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; });
    var hasDuplicatedViolation = !!duplicateViolation;
    if (!checkDismissed) {
        return hasDuplicatedViolation;
    }
    var didDismissedViolation = isViolationDismissed(transaction, duplicateViolation);
    return hasDuplicatedViolation && !didDismissedViolation;
}
/**
 * Check if transaction is on hold
 */
function isOnHold(transaction) {
    var _a;
    if (!transaction) {
        return false;
    }
    return !!((_a = transaction.comment) === null || _a === void 0 ? void 0 : _a.hold);
}
/**
 * Check if transaction is on hold for the given transactionID
 */
function isOnHoldByTransactionID(transactionID) {
    if (!transactionID) {
        return false;
    }
    return isOnHold(allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)]);
}
/**
 * Checks if a violation is dismissed for the given transaction
 */
function isViolationDismissed(transaction, violation) {
    var _a, _b, _c;
    if (!transaction || !violation) {
        return false;
    }
    return ((_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.dismissedViolations) === null || _b === void 0 ? void 0 : _b[violation.name]) === null || _c === void 0 ? void 0 : _c[currentUserEmail]) === "".concat(currentUserAccountID);
}
/**
 * Checks if violations are supported for the given transaction
 */
function doesTransactionSupportViolations(transaction) {
    if (!transaction) {
        return false;
    }
    if (isExpensifyCardTransaction(transaction) && isPending(transaction)) {
        return false;
    }
    return true;
}
/**
 * Checks if any violations for the provided transaction are of type 'violation'
 */
function hasViolation(transaction, transactionViolations, showInReview) {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    var violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations[ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID];
    return !!(violations === null || violations === void 0 ? void 0 : violations.some(function (violation) {
        var _a;
        return violation.type === CONST_1.default.VIOLATION_TYPES.VIOLATION &&
            (showInReview === undefined || showInReview === ((_a = violation.showInReview) !== null && _a !== void 0 ? _a : false)) &&
            !isViolationDismissed(transaction, violation);
    }));
}
function hasDuplicateTransactions(iouReportID, allReportTransactions) {
    var transactionsByIouReportID = (0, ReportUtils_1.getReportTransactions)(iouReportID);
    var reportTransactions = allReportTransactions !== null && allReportTransactions !== void 0 ? allReportTransactions : transactionsByIouReportID;
    return reportTransactions.length > 0 && reportTransactions.some(function (transaction) { return isDuplicate(transaction, true); });
}
/**
 * Checks if any violations for the provided transaction are of type 'notice'
 */
function hasNoticeTypeViolation(transaction, transactionViolations, showInReview) {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    var violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)];
    return !!(violations === null || violations === void 0 ? void 0 : violations.some(function (violation) {
        var _a;
        return violation.type === CONST_1.default.VIOLATION_TYPES.NOTICE &&
            (showInReview === undefined || showInReview === ((_a = violation.showInReview) !== null && _a !== void 0 ? _a : false)) &&
            !isViolationDismissed(transaction, violation);
    }));
}
/**
 * Checks if any violations for the provided transaction are of type 'warning'
 */
function hasWarningTypeViolation(transaction, transactionViolations, showInReview) {
    var _a;
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    var violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)];
    var warningTypeViolations = (_a = violations === null || violations === void 0 ? void 0 : violations.filter(function (violation) {
        var _a;
        return violation.type === CONST_1.default.VIOLATION_TYPES.WARNING &&
            (showInReview === undefined || showInReview === ((_a = violation.showInReview) !== null && _a !== void 0 ? _a : false)) &&
            !isViolationDismissed(transaction, violation);
    })) !== null && _a !== void 0 ? _a : [];
    return warningTypeViolations.length > 0;
}
/**
 * Calculates tax amount from the given expense amount and tax percentage
 */
function calculateTaxAmount(percentage, amount, currency) {
    if (!percentage) {
        return 0;
    }
    var divisor = Number(percentage.slice(0, -1)) / 100 + 1;
    var taxAmount = (amount - amount / divisor) / 100;
    var decimals = (0, CurrencyUtils_1.getCurrencyDecimals)(currency);
    return parseFloat(taxAmount.toFixed(decimals));
}
/**
 * Calculates count of all tax enabled options
 */
function getEnabledTaxRateCount(options) {
    return Object.values(options).filter(function (option) { return !option.isDisabled; }).length;
}
/**
 * Check if the customUnitRateID has a value default for P2P distance requests
 */
function isCustomUnitRateIDForP2P(transaction) {
    var _a, _b;
    return ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.customUnitRateID) === CONST_1.default.CUSTOM_UNITS.FAKE_P2P_ID;
}
function hasReservationList(transaction) {
    var _a, _b;
    return !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.reservationList) && ((_b = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _b === void 0 ? void 0 : _b.reservationList.length) > 0;
}
/**
 * Whether an expense is going to be paid later, either at checkout for hotels or drop off for car rental
 */
function isPayAtEndExpense(transaction) {
    var _a, _b;
    return !!((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.reservationList) === null || _b === void 0 ? void 0 : _b.some(function (reservation) { return reservation.paymentType === 'PAY_AT_HOTEL' || reservation.paymentType === 'PAY_AT_VENDOR'; }));
}
/**
 * Get custom unit rate (distance rate) ID from the transaction object
 */
function getRateID(transaction) {
    var _a, _b, _c;
    return (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.customUnitRateID) !== null && _c !== void 0 ? _c : CONST_1.default.CUSTOM_UNITS.FAKE_P2P_ID;
}
/**
 * Gets the tax code based on the type of transaction and selected currency.
 * If it is distance request, then returns the tax code corresponding to the custom unit rate
 * Else returns policy default tax rate if transaction is in policy default currency, otherwise foreign default tax rate
 */
function getDefaultTaxCode(policy, transaction, currency) {
    var _a, _b, _c, _d;
    if (isDistanceRequest(transaction)) {
        var customUnitRateID = (_a = getRateID(transaction)) !== null && _a !== void 0 ? _a : '';
        var customUnitRate = (0, PolicyUtils_1.getDistanceRateCustomUnitRate)(policy, customUnitRateID);
        return (_b = customUnitRate === null || customUnitRate === void 0 ? void 0 : customUnitRate.attributes) === null || _b === void 0 ? void 0 : _b.taxRateExternalID;
    }
    var defaultExternalID = (_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.defaultExternalID;
    var foreignTaxDefault = (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.foreignTaxDefault;
    return (policy === null || policy === void 0 ? void 0 : policy.outputCurrency) === (currency !== null && currency !== void 0 ? currency : getCurrency(transaction)) ? defaultExternalID : foreignTaxDefault;
}
/**
 * Transforms tax rates to a new object format - to add codes and new name with concatenated name and value.
 *
 * @param  policy - The policy which the user has access to and which the report is tied to.
 * @returns The transformed tax rates object.g
 */
function transformedTaxRates(policy, transaction) {
    var _a;
    var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
    var defaultExternalID = taxRates === null || taxRates === void 0 ? void 0 : taxRates.defaultExternalID;
    var defaultTaxCode = function () {
        if (!transaction) {
            return defaultExternalID;
        }
        return policy && getDefaultTaxCode(policy, transaction);
    };
    var getModifiedName = function (data, code) { return "".concat(data.name, " (").concat(data.value, ")").concat(defaultTaxCode() === code ? " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat((0, Localize_1.translateLocal)('common.default')) : ''); };
    var taxes = Object.fromEntries(Object.entries((_a = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) !== null && _a !== void 0 ? _a : {}).map(function (_a) {
        var code = _a[0], data = _a[1];
        return [code, __assign(__assign({}, data), { code: code, modifiedName: getModifiedName(data, code), name: data.name })];
    }));
    return taxes;
}
/**
 * Gets the tax value of a selected tax
 */
function getTaxValue(policy, transaction, taxCode) {
    var _a;
    return (_a = Object.values(transformedTaxRates(policy, transaction)).find(function (taxRate) { return taxRate.code === taxCode; })) === null || _a === void 0 ? void 0 : _a.value;
}
/**
 * Gets the tax name for Workspace Taxes Settings
 */
function getWorkspaceTaxesSettingsName(policy, taxCode) {
    var _a;
    return (_a = Object.values(transformedTaxRates(policy)).find(function (taxRate) { return taxRate.code === taxCode; })) === null || _a === void 0 ? void 0 : _a.modifiedName;
}
/**
 * Gets the name corresponding to the taxCode that is displayed to the user
 */
function getTaxName(policy, transaction) {
    var _a;
    var defaultTaxCode = getDefaultTaxCode(policy, transaction);
    return (_a = Object.values(transformedTaxRates(policy, transaction)).find(function (taxRate) { var _a; return taxRate.code === ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.taxCode) !== null && _a !== void 0 ? _a : defaultTaxCode); })) === null || _a === void 0 ? void 0 : _a.modifiedName;
}
function getTransactionOrDraftTransaction(transactionID) {
    var _a;
    return (_a = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)]) !== null && _a !== void 0 ? _a : allTransactionDrafts === null || allTransactionDrafts === void 0 ? void 0 : allTransactionDrafts["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID)];
}
function removeSettledAndApprovedTransactions(transactions) {
    return transactions.filter(function (transaction) { return !!transaction && !(0, ReportUtils_1.isSettled)(transaction === null || transaction === void 0 ? void 0 : transaction.reportID) && !(0, ReportUtils_1.isReportIDApproved)(transaction === null || transaction === void 0 ? void 0 : transaction.reportID); });
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
function compareDuplicateTransactionFields(reviewingTransaction, duplicates, reportID, selectedTransactionID) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var reviewingTransactionID = reviewingTransaction === null || reviewingTransaction === void 0 ? void 0 : reviewingTransaction.transactionID;
    if (!reviewingTransactionID || !reportID) {
        return { change: {}, keep: {} };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var keep = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var change = {};
    if (!reviewingTransactionID || !reportID) {
        return { keep: keep, change: change };
    }
    var transactions = removeSettledAndApprovedTransactions(__spreadArray([reviewingTransaction], (duplicates !== null && duplicates !== void 0 ? duplicates : []), true));
    var fieldsToCompare = {
        merchant: ['modifiedMerchant', 'merchant'],
        category: ['category'],
        tag: ['tag'],
        description: ['comment'],
        taxCode: ['taxCode'],
        billable: ['billable'],
        reimbursable: ['reimbursable'],
    };
    // Helper function thats create an array of different values for a given key in the transactions
    function getDifferentValues(items, keys) {
        return __spreadArray([], new Set(items
            .map(function (item) {
            // Prioritize modifiedMerchant over merchant
            if (keys.includes('modifiedMerchant') && keys.includes('merchant')) {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                return getMerchant(item);
            }
            return keys.map(function (key) { return item === null || item === void 0 ? void 0 : item[key]; });
        })
            .flat()), true);
    }
    // Helper function to check if all comments are equal
    function areAllCommentsEqual(items, firstTransaction) {
        return items.every(function (item) { return (0, fast_equals_1.deepEqual)(getDescription(item), getDescription(firstTransaction)); });
    }
    // Helper function to check if all fields are equal for a given key
    function areAllFieldsEqual(items, keyExtractor) {
        var firstTransaction = transactions.at(0);
        return items.every(function (item) { return keyExtractor(item) === keyExtractor(firstTransaction); });
    }
    // Helper function to process changes
    function processChanges(fieldName, items, keys) {
        var differentValues = getDifferentValues(items, keys);
        if (differentValues.length > 0) {
            change[fieldName] = differentValues;
        }
    }
    // The comment object needs to be stored only when selecting a specific transaction to keep.
    // It contains details such as 'customUnit' and 'waypoints,' which remain unchanged during the review steps
    // but are essential for displaying complete information on the confirmation page.
    if (selectedTransactionID) {
        var selectedTransaction = transactions.find(function (t) { return (t === null || t === void 0 ? void 0 : t.transactionID) === selectedTransactionID; });
        keep.comment = (_a = selectedTransaction === null || selectedTransaction === void 0 ? void 0 : selectedTransaction.comment) !== null && _a !== void 0 ? _a : {};
    }
    var _loop_1 = function (fieldName) {
        if (Object.prototype.hasOwnProperty.call(fieldsToCompare, fieldName)) {
            var keys_1 = fieldsToCompare[fieldName];
            var firstTransaction = transactions.at(0);
            var isFirstTransactionCommentEmptyObject = typeof (firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction.comment) === 'object' && ((_b = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction.comment) === null || _b === void 0 ? void 0 : _b.comment) === '';
            var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
            // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
            // eslint-disable-next-line deprecation/deprecation
            var policy_1 = (0, PolicyUtils_1.getPolicy)(report === null || report === void 0 ? void 0 : report.policyID);
            var areAllFieldsEqualForKey = areAllFieldsEqual(transactions, function (item) { return keys_1.map(function (key) { return item === null || item === void 0 ? void 0 : item[key]; }).join('|'); });
            if (fieldName === 'description') {
                var allCommentsAreEqual = areAllCommentsEqual(transactions, firstTransaction);
                var allCommentsAreEmpty = isFirstTransactionCommentEmptyObject && transactions.every(function (item) { return getDescription(item) === ''; });
                if (allCommentsAreEqual || allCommentsAreEmpty) {
                    keep[fieldName] = (_d = (_c = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction.comment) === null || _c === void 0 ? void 0 : _c.comment) !== null && _d !== void 0 ? _d : firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction.comment;
                }
                else {
                    processChanges(fieldName, transactions, keys_1);
                }
            }
            else if (fieldName === 'merchant') {
                if (areAllFieldsEqual(transactions, getMerchant)) {
                    keep[fieldName] = getMerchant(firstTransaction);
                }
                else {
                    processChanges(fieldName, transactions, keys_1);
                }
            }
            else if (fieldName === 'taxCode') {
                var differentValues = getDifferentValues(transactions, keys_1);
                var validTaxes = differentValues === null || differentValues === void 0 ? void 0 : differentValues.filter(function (taxID) {
                    var _a;
                    var tax = (0, PolicyUtils_1.getTaxByID)(policy_1, (_a = taxID) !== null && _a !== void 0 ? _a : '');
                    return (tax === null || tax === void 0 ? void 0 : tax.name) && !tax.isDisabled && tax.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                });
                if (!areAllFieldsEqualForKey && validTaxes.length > 1) {
                    change[fieldName] = validTaxes;
                }
                else if (areAllFieldsEqualForKey) {
                    keep[fieldName] = (_e = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _e !== void 0 ? _e : firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[1]];
                }
            }
            else if (fieldName === 'category') {
                var differentValues_1 = getDifferentValues(transactions, keys_1);
                var policyCategories = (report === null || report === void 0 ? void 0 : report.policyID) ? (0, Category_1.getPolicyCategoriesData)(report.policyID) : {};
                var availableCategories = Object.values(policyCategories)
                    .filter(function (category) { return differentValues_1.includes(category.name) && category.enabled && category.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; })
                    .map(function (e) { return e.name; });
                if (!areAllFieldsEqualForKey && (policy_1 === null || policy_1 === void 0 ? void 0 : policy_1.areCategoriesEnabled) && (availableCategories.length > 1 || (availableCategories.length === 1 && differentValues_1.includes('')))) {
                    change[fieldName] = __spreadArray(__spreadArray([], availableCategories, true), (differentValues_1.includes('') ? [''] : []), true);
                }
                else if (areAllFieldsEqualForKey) {
                    keep[fieldName] = (_f = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _f !== void 0 ? _f : firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[1]];
                }
            }
            else if (fieldName === 'tag') {
                var policyTags = (report === null || report === void 0 ? void 0 : report.policyID) ? (0, Tag_1.getPolicyTagsData)(report === null || report === void 0 ? void 0 : report.policyID) : {};
                var isMultiLevelTags = (0, PolicyUtils_1.isMultiLevelTags)(policyTags);
                if (isMultiLevelTags) {
                    if (areAllFieldsEqualForKey || !(policy_1 === null || policy_1 === void 0 ? void 0 : policy_1.areTagsEnabled)) {
                        keep[fieldName] = (_g = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _g !== void 0 ? _g : firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[1]];
                    }
                    else {
                        processChanges(fieldName, transactions, keys_1);
                    }
                }
                else {
                    var differentValues_2 = getDifferentValues(transactions, keys_1);
                    var policyTagsObj = Object.values((_j = (_h = Object.values(policyTags).at(0)) === null || _h === void 0 ? void 0 : _h.tags) !== null && _j !== void 0 ? _j : {});
                    var availableTags = policyTagsObj
                        .filter(function (tag) { return differentValues_2.includes(tag.name) && tag.enabled && tag.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; })
                        .map(function (e) { return e.name; });
                    if (!areAllFieldsEqualForKey && (policy_1 === null || policy_1 === void 0 ? void 0 : policy_1.areTagsEnabled) && (availableTags.length > 1 || (availableTags.length === 1 && differentValues_2.includes('')))) {
                        change[fieldName] = __spreadArray(__spreadArray([], availableTags, true), (differentValues_2.includes('') ? [''] : []), true);
                    }
                    else if (areAllFieldsEqualForKey) {
                        keep[fieldName] = (_k = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _k !== void 0 ? _k : firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[1]];
                    }
                }
            }
            else if (areAllFieldsEqualForKey) {
                keep[fieldName] = (_l = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _l !== void 0 ? _l : firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[1]];
            }
            else {
                processChanges(fieldName, transactions, keys_1);
            }
        }
    };
    for (var fieldName in fieldsToCompare) {
        _loop_1(fieldName);
    }
    return { keep: keep, change: change };
}
function getTransactionID(threadReportID) {
    var _a;
    if (!threadReportID) {
        return;
    }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(threadReportID)];
    var parentReportAction = (0, ReportUtils_1.isThread)(report) ? (0, ReportActionsUtils_1.getReportAction)(report.parentReportID, report.parentReportActionID) : undefined;
    var IOUTransactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportAction) ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID : undefined;
    return IOUTransactionID;
}
function buildNewTransactionAfterReviewingDuplicates(reviewDuplicateTransaction) {
    var _a;
    var originalTransaction = (_a = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.transactionID)]) !== null && _a !== void 0 ? _a : undefined;
    var _b = reviewDuplicateTransaction !== null && reviewDuplicateTransaction !== void 0 ? reviewDuplicateTransaction : {}, duplicates = _b.duplicates, restReviewDuplicateTransaction = __rest(_b, ["duplicates"]);
    return __assign(__assign(__assign({}, originalTransaction), restReviewDuplicateTransaction), { modifiedMerchant: reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.merchant, merchant: reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.merchant, comment: __assign(__assign({}, reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.comment), { comment: reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.description }) });
}
function buildMergeDuplicatesParams(reviewDuplicates, duplicatedTransactions, originalTransaction) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
        amount: -getAmount(originalTransaction, true),
        reportID: originalTransaction === null || originalTransaction === void 0 ? void 0 : originalTransaction.reportID,
        receiptID: (_b = (_a = originalTransaction === null || originalTransaction === void 0 ? void 0 : originalTransaction.receipt) === null || _a === void 0 ? void 0 : _a.receiptID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID,
        currency: getCurrency(originalTransaction),
        created: getFormattedCreated(originalTransaction),
        transactionID: reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.transactionID,
        transactionIDList: removeSettledAndApprovedTransactions(duplicatedTransactions !== null && duplicatedTransactions !== void 0 ? duplicatedTransactions : []).map(function (transaction) { return transaction.transactionID; }),
        billable: (_c = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.billable) !== null && _c !== void 0 ? _c : false,
        reimbursable: (_d = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.reimbursable) !== null && _d !== void 0 ? _d : false,
        category: (_e = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.category) !== null && _e !== void 0 ? _e : '',
        tag: (_f = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.tag) !== null && _f !== void 0 ? _f : '',
        merchant: (_g = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.merchant) !== null && _g !== void 0 ? _g : '',
        comment: (_h = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.description) !== null && _h !== void 0 ? _h : '',
    };
}
function getCategoryTaxCodeAndAmount(category, transaction, policy) {
    var _a, _b;
    var taxRules = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.expenseRules) === null || _b === void 0 ? void 0 : _b.filter(function (rule) { return rule.tax; });
    if (!taxRules || (taxRules === null || taxRules === void 0 ? void 0 : taxRules.length) === 0 || isDistanceRequest(transaction)) {
        return { categoryTaxCode: undefined, categoryTaxAmount: undefined };
    }
    var defaultTaxCode = getDefaultTaxCode(policy, transaction, getCurrency(transaction));
    var categoryTaxCode = (0, CategoryUtils_1.getCategoryDefaultTaxRate)(taxRules, category, defaultTaxCode);
    var categoryTaxPercentage = getTaxValue(policy, transaction, categoryTaxCode !== null && categoryTaxCode !== void 0 ? categoryTaxCode : '');
    var categoryTaxAmount;
    if (categoryTaxPercentage) {
        categoryTaxAmount = (0, CurrencyUtils_1.convertToBackendAmount)(calculateTaxAmount(categoryTaxPercentage, getAmount(transaction), getCurrency(transaction)));
    }
    return { categoryTaxCode: categoryTaxCode, categoryTaxAmount: categoryTaxAmount };
}
/**
 * Return the sorted list transactions of an iou report
 */
function getAllSortedTransactions(iouReportID) {
    return (0, ReportUtils_1.getReportTransactions)(iouReportID).sort(function (transA, transB) {
        var _a, _b;
        if (transA.created < transB.created) {
            return -1;
        }
        if (transA.created > transB.created) {
            return 1;
        }
        return ((_a = transA.inserted) !== null && _a !== void 0 ? _a : '') < ((_b = transB.inserted) !== null && _b !== void 0 ? _b : '') ? -1 : 1;
    });
}
function shouldShowRTERViolationMessage(transactions) {
    return (transactions === null || transactions === void 0 ? void 0 : transactions.length) === 1 && hasPendingUI(transactions === null || transactions === void 0 ? void 0 : transactions.at(0), getTransactionViolations(transactions === null || transactions === void 0 ? void 0 : transactions.at(0), allTransactionViolations));
}
var getOriginalTransactionWithSplitInfo = function (transaction) {
    var _a, _b, _c;
    var _d = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) !== null && _a !== void 0 ? _a : {}, originalTransactionID = _d.originalTransactionID, source = _d.source, splits = _d.splits;
    var originalTransaction = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID)];
    if (splits && splits.length > 0) {
        return { isBillSplit: true, isExpenseSplit: false, originalTransaction: originalTransaction !== null && originalTransaction !== void 0 ? originalTransaction : transaction };
    }
    if (!originalTransactionID || source !== CONST_1.default.IOU.TYPE.SPLIT) {
        return { isBillSplit: false, isExpenseSplit: false, originalTransaction: transaction };
    }
    // To determine if it’s a split bill or a split expense, we check for the presence of `comment.splits` on the original transaction.
    // Since both splits use `comment.originalTransaction`, but split expenses won’t have `comment.splits`.
    return { isBillSplit: !!((_b = originalTransaction === null || originalTransaction === void 0 ? void 0 : originalTransaction.comment) === null || _b === void 0 ? void 0 : _b.splits), isExpenseSplit: !((_c = originalTransaction === null || originalTransaction === void 0 ? void 0 : originalTransaction.comment) === null || _c === void 0 ? void 0 : _c.splits), originalTransaction: originalTransaction !== null && originalTransaction !== void 0 ? originalTransaction : transaction };
};
exports.getOriginalTransactionWithSplitInfo = getOriginalTransactionWithSplitInfo;
/**
 * Return transactions pending action.
 */
function getTransactionPendingAction(transaction) {
    var _a;
    if (transaction === null || transaction === void 0 ? void 0 : transaction.pendingAction) {
        return transaction.pendingAction;
    }
    var hasPendingFields = Object.keys((_a = transaction === null || transaction === void 0 ? void 0 : transaction.pendingFields) !== null && _a !== void 0 ? _a : {}).length > 0;
    return hasPendingFields ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null;
}
function isTransactionPendingDelete(transaction) {
    return getTransactionPendingAction(transaction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}
/**
 * Creates sections data for unreported expenses, marking transactions with DELETE pending action as disabled
 */
function createUnreportedExpenseSections(transactions) {
    return [
        {
            shouldShow: true,
            data: transactions
                .filter(function (t) { return t !== undefined; })
                .map(function (transaction) { return (__assign(__assign({}, transaction), { isDisabled: isTransactionPendingDelete(transaction), keyForList: transaction.transactionID, errors: transaction.errors })); }),
        },
    ];
}
