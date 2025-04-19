'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
var __rest =
    (this && this.__rest) ||
    function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === 'function')
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
            }
        return t;
    };
var __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
        return r;
    };
exports.__esModule = true;
exports.isOnHold =
    exports.isPosted =
    exports.isPending =
    exports.isDuplicate =
    exports.isCardTransaction =
    exports.isExpensifyCardTransaction =
    exports.isFetchingWaypointsFromServer =
    exports.isDistanceRequest =
    exports.getValidWaypoints =
    exports.didReceiptScanSucceed =
    exports.isReceiptBeingScanned =
    exports.hasRoute =
    exports.hasEReceipt =
    exports.hasReceipt =
    exports.getTransactionViolations =
    exports.getTagForDisplay =
    exports.getTagArrayFromName =
    exports.getTag =
    exports.getBillable =
    exports.getCategory =
    exports.getFormattedCreated =
    exports.getCreated =
    exports.getMCCGroup =
    exports.getMerchantOrDescription =
    exports.hasAnyTransactionWithoutRTERViolation =
    exports.getMerchant =
    exports.getFormattedAttendees =
    exports.getOriginalAmount =
    exports.getOriginalCurrency =
    exports.getCardID =
    exports.getDistanceInMeters =
    exports.getCurrency =
    exports.getTaxCode =
    exports.getTaxAmount =
    exports.getAttendees =
    exports.getAmount =
    exports.isScanRequest =
    exports.isManualRequest =
    exports.getExpenseType =
    exports.getRequestType =
    exports.getDescription =
    exports.getUpdatedTransaction =
    exports.getEnabledTaxRateCount =
    exports.getTaxName =
    exports.getTaxValue =
    exports.transformedTaxRates =
    exports.getDefaultTaxCode =
    exports.getWorkspaceTaxesSettingsName =
    exports.calculateTaxAmount =
    exports.buildOptimisticTransaction =
        void 0;
exports.isPendingCardOrScanningTransaction =
    exports.isPartialTransaction =
    exports.shouldShowRTERViolationMessage =
    exports.checkIfShouldShowMarkAsCashButton =
    exports.isBrokenConnectionViolation =
    exports.isViolationDismissed =
    exports.isPerDiemRequest =
    exports.getCategoryTaxCodeAndAmount =
    exports.getFormattedPostedDate =
    exports.getAllSortedTransactions =
    exports.shouldShowAttendees =
    exports.hasReceiptSource =
    exports.getCardName =
    exports.removeSettledAndApprovedTransactions =
    exports.isPayAtEndExpense =
    exports.getReimbursable =
    exports.buildMergeDuplicatesParams =
    exports.buildNewTransactionAfterReviewingDuplicates =
    exports.getTransactionID =
    exports.compareDuplicateTransactionFields =
    exports.getTransaction =
    exports.getRateID =
    exports.isCustomUnitRateIDForP2P =
    exports.hasWarningTypeViolation =
    exports.hasNoticeTypeViolation =
    exports.shouldShowBrokenConnectionViolationForMultipleTransactions =
    exports.shouldShowBrokenConnectionViolation =
    exports.hasBrokenConnectionViolation =
    exports.hasDuplicateTransactions =
    exports.hasViolation =
    exports.hasReservationList =
    exports.getRecentTransactions =
    exports.waypointHasValidAddress =
    exports.getWaypointIndex =
    exports.hasPendingUI =
    exports.allHavePendingRTERViolation =
    exports.hasPendingRTERViolation =
    exports.hasMissingSmartscanFields =
    exports.areRequiredFieldsEmpty =
    exports.isCreatedMissing =
    exports.isPartialMerchant =
    exports.isMerchantMissing =
    exports.isAmountMissing =
    exports.getWaypoints =
    exports.isOnHoldByTransactionID =
        void 0;
var date_fns_1 = require('date-fns');
var cloneDeep_1 = require('lodash/cloneDeep');
var has_1 = require('lodash/has');
var isEqual_1 = require('lodash/isEqual');
var set_1 = require('lodash/set');
var react_native_onyx_1 = require('react-native-onyx');
var Category_1 = require('@libs/actions/Policy/Category');
var Tag_1 = require('@libs/actions/Policy/Tag');
var CategoryUtils_1 = require('@libs/CategoryUtils');
var CurrencyUtils_1 = require('@libs/CurrencyUtils');
var DateUtils_1 = require('@libs/DateUtils');
var DistanceRequestUtils_1 = require('@libs/DistanceRequestUtils');
var LocaleDigitUtils_1 = require('@libs/LocaleDigitUtils');
var Localize = require('@libs/Localize');
var NumberUtils = require('@libs/NumberUtils');
var PolicyUtils_1 = require('@libs/PolicyUtils');
var ReportActionsUtils_1 = require('@libs/ReportActionsUtils');
var ReportUtils_1 = require('@libs/ReportUtils');
var CONST_1 = require('@src/CONST');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var EmptyObject_1 = require('@src/types/utils/EmptyObject');
var getDistanceInMeters_1 = require('./getDistanceInMeters');
exports.getDistanceInMeters = getDistanceInMeters_1['default'];
var allTransactions = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            return;
        }
        allTransactions = Object.fromEntries(
            Object.entries(value).filter(function (_a) {
                var transaction = _a[1];
                return !!transaction;
            }),
        );
    },
});
var allReports = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var allTransactionViolations = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) {
        return (allTransactionViolations = value);
    },
});
var preferredLocale = CONST_1['default'].LOCALES.DEFAULT;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_PREFERRED_LOCALE,
    callback: function (value) {
        if (!value) {
            return;
        }
        preferredLocale = value;
    },
});
var currentUserEmail = '';
var currentUserAccountID = -1;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].SESSION,
    callback: function (val) {
        var _a, _b;
        currentUserEmail = (_a = val === null || val === void 0 ? void 0 : val.email) !== null && _a !== void 0 ? _a : '';
        currentUserAccountID = (_b = val === null || val === void 0 ? void 0 : val.accountID) !== null && _b !== void 0 ? _b : CONST_1['default'].DEFAULT_NUMBER_ID;
    },
});
function isDistanceRequest(transaction) {
    var _a, _b, _c;
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (has_1['default'](transaction, 'iouRequestType')) {
        return (transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType) === CONST_1['default'].IOU.REQUEST_TYPE.DISTANCE;
    }
    // This is the case for transaction objects once they have been saved to the server
    var type = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.type;
    var customUnitName =
        (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.customUnit) === null || _c === void 0
            ? void 0
            : _c.name;
    return type === CONST_1['default'].TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST_1['default'].CUSTOM_UNITS.NAME_DISTANCE;
}
exports.isDistanceRequest = isDistanceRequest;
function isScanRequest(transaction) {
    var _a;
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (has_1['default'](transaction, 'iouRequestType')) {
        return (transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType) === CONST_1['default'].IOU.REQUEST_TYPE.SCAN;
    }
    return (
        !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.source) &&
        (transaction === null || transaction === void 0 ? void 0 : transaction.amount) === 0
    );
}
exports.isScanRequest = isScanRequest;
function isPerDiemRequest(transaction) {
    var _a, _b, _c;
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (has_1['default'](transaction, 'iouRequestType')) {
        return (transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType) === CONST_1['default'].IOU.REQUEST_TYPE.PER_DIEM;
    }
    // This is the case for transaction objects once they have been saved to the server
    var type = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.type;
    var customUnitName =
        (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.customUnit) === null || _c === void 0
            ? void 0
            : _c.name;
    return type === CONST_1['default'].TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST_1['default'].CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL;
}
exports.isPerDiemRequest = isPerDiemRequest;
function getRequestType(transaction) {
    if (isDistanceRequest(transaction)) {
        return CONST_1['default'].IOU.REQUEST_TYPE.DISTANCE;
    }
    if (isScanRequest(transaction)) {
        return CONST_1['default'].IOU.REQUEST_TYPE.SCAN;
    }
    if (isPerDiemRequest(transaction)) {
        return CONST_1['default'].IOU.REQUEST_TYPE.PER_DIEM;
    }
    return CONST_1['default'].IOU.REQUEST_TYPE.MANUAL;
}
exports.getRequestType = getRequestType;
/**
 * Determines the expense type of a given transaction.
 */
function getExpenseType(transaction) {
    if (!transaction) {
        return undefined;
    }
    if (isExpensifyCardTransaction(transaction)) {
        if (isPending(transaction)) {
            return CONST_1['default'].IOU.EXPENSE_TYPE.PENDING_EXPENSIFY_CARD;
        }
        return CONST_1['default'].IOU.EXPENSE_TYPE.EXPENSIFY_CARD;
    }
    return getRequestType(transaction);
}
exports.getExpenseType = getExpenseType;
function isManualRequest(transaction) {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (has_1['default'](transaction, 'iouRequestType')) {
        return transaction.iouRequestType === CONST_1['default'].IOU.REQUEST_TYPE.MANUAL;
    }
    return getRequestType(transaction) === CONST_1['default'].IOU.REQUEST_TYPE.MANUAL;
}
exports.isManualRequest = isManualRequest;
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
exports.isPartialTransaction = isPartialTransaction;
function isPendingCardOrScanningTransaction(transaction) {
    return (isExpensifyCardTransaction(transaction) && isPending(transaction)) || isPartialTransaction(transaction) || (isScanRequest(transaction) && isReceiptBeingScanned(transaction));
}
exports.isPendingCardOrScanningTransaction = isPendingCardOrScanningTransaction;
/**
 * Optimistically generate a transaction.
 *
 * @param amount – in cents
 * @param [existingTransactionID] When creating a distance expense, an empty transaction has already been created with a transactionID. In that case, the transaction here needs to have
 * it's transactionID match what was already generated.
 */
function buildOptimisticTransaction(params) {
    var _a, _b;
    var _c = params.originalTransactionID,
        originalTransactionID = _c === void 0 ? '' : _c,
        existingTransactionID = params.existingTransactionID,
        existingTransaction = params.existingTransaction,
        policy = params.policy,
        transactionParams = params.transactionParams;
    var amount = transactionParams.amount,
        currency = transactionParams.currency,
        reportID = transactionParams.reportID,
        _d = transactionParams.comment,
        comment = _d === void 0 ? '' : _d,
        _e = transactionParams.attendees,
        attendees = _e === void 0 ? [] : _e,
        _f = transactionParams.created,
        created = _f === void 0 ? '' : _f,
        _g = transactionParams.merchant,
        merchant = _g === void 0 ? '' : _g,
        receipt = transactionParams.receipt,
        _h = transactionParams.category,
        category = _h === void 0 ? '' : _h,
        _j = transactionParams.tag,
        tag = _j === void 0 ? '' : _j,
        _k = transactionParams.taxCode,
        taxCode = _k === void 0 ? '' : _k,
        _l = transactionParams.taxAmount,
        taxAmount = _l === void 0 ? 0 : _l,
        _m = transactionParams.billable,
        billable = _m === void 0 ? false : _m,
        pendingFields = transactionParams.pendingFields,
        _o = transactionParams.reimbursable,
        reimbursable = _o === void 0 ? true : _o,
        _p = transactionParams.source,
        source = _p === void 0 ? '' : _p,
        _q = transactionParams.filename,
        filename = _q === void 0 ? '' : _q,
        customUnit = transactionParams.customUnit;
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    var transactionID = existingTransactionID !== null && existingTransactionID !== void 0 ? existingTransactionID : NumberUtils.rand64();
    var commentJSON = {comment: comment, attendees: attendees};
    if (source) {
        commentJSON.source = source;
    }
    if (originalTransactionID) {
        commentJSON.originalTransactionID = originalTransactionID;
    }
    var isDistanceTransaction = !!(pendingFields === null || pendingFields === void 0 ? void 0 : pendingFields.waypoints);
    if (isDistanceTransaction) {
        // Set the distance unit, which comes from the policy distance unit or the P2P rate data
        set_1['default'](commentJSON, 'customUnit.distanceUnit', DistanceRequestUtils_1['default'].getUpdatedDistanceUnit({transaction: existingTransaction, policy: policy}));
    }
    var isPerDiemTransaction = !!(pendingFields === null || pendingFields === void 0 ? void 0 : pendingFields.subRates);
    if (isPerDiemTransaction) {
        // Set the custom unit, which comes from the policy per diem rate data
        set_1['default'](commentJSON, 'customUnit', customUnit);
    }
    return __assign(__assign({}, !EmptyObject_1.isEmptyObject(pendingFields) ? {pendingFields: pendingFields} : {}), {
        transactionID: transactionID,
        amount: amount,
        currency: currency,
        reportID: reportID,
        comment: commentJSON,
        merchant: merchant || CONST_1['default'].TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        created: created || DateUtils_1['default'].getDBTime(),
        pendingAction: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.ADD,
        receipt: (receipt === null || receipt === void 0 ? void 0 : receipt.source)
            ? {source: receipt.source, state: (_a = receipt.state) !== null && _a !== void 0 ? _a : CONST_1['default'].IOU.RECEIPT_STATE.SCANREADY}
            : {},
        filename: ((receipt === null || receipt === void 0 ? void 0 : receipt.source)
            ? (_b = receipt === null || receipt === void 0 ? void 0 : receipt.name) !== null && _b !== void 0
                ? _b
                : filename
            : filename
        ).toString(),
        category: category,
        tag: tag,
        taxCode: taxCode,
        taxAmount: taxAmount,
        billable: billable,
        reimbursable: reimbursable,
        inserted: DateUtils_1['default'].getDBTime(),
    });
}
exports.buildOptimisticTransaction = buildOptimisticTransaction;
/**
 * Check if the transaction has an Ereceipt
 */
function hasEReceipt(transaction) {
    return !!(transaction === null || transaction === void 0 ? void 0 : transaction.hasEReceipt);
}
exports.hasEReceipt = hasEReceipt;
function hasReceipt(transaction) {
    var _a;
    return !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.state) || hasEReceipt(transaction);
}
exports.hasReceipt = hasReceipt;
/** Check if the receipt has the source file */
function hasReceiptSource(transaction) {
    var _a;
    return !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.source);
}
exports.hasReceiptSource = hasReceiptSource;
function isMerchantMissing(transaction) {
    if ((transaction === null || transaction === void 0 ? void 0 : transaction.modifiedMerchant) && transaction.modifiedMerchant !== '') {
        return transaction.modifiedMerchant === CONST_1['default'].TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    }
    var isMerchantEmpty =
        (transaction === null || transaction === void 0 ? void 0 : transaction.merchant) === CONST_1['default'].TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ||
        (transaction === null || transaction === void 0 ? void 0 : transaction.merchant) === '';
    return isMerchantEmpty;
}
exports.isMerchantMissing = isMerchantMissing;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldShowAttendees(iouType, policy) {
    return false;
    // To be renabled once feature is complete: https://github.com/Expensify/App/issues/44725
    // Keep this disabled for per diem expense
    return (
        iouType === CONST_1['default'].IOU.TYPE.SUBMIT &&
        !!(policy === null || policy === void 0 ? void 0 : policy.id) &&
        ((policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1['default'].POLICY.TYPE.CORPORATE ||
            (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1['default'].POLICY.TYPE.TEAM)
    );
}
exports.shouldShowAttendees = shouldShowAttendees;
/**
 * Check if the merchant is partial i.e. `(none)`
 */
function isPartialMerchant(merchant) {
    return merchant === CONST_1['default'].TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
}
exports.isPartialMerchant = isPartialMerchant;
function isAmountMissing(transaction) {
    return (transaction === null || transaction === void 0 ? void 0 : transaction.amount) === 0 && (!transaction.modifiedAmount || transaction.modifiedAmount === 0);
}
exports.isAmountMissing = isAmountMissing;
function isCreatedMissing(transaction) {
    return (transaction === null || transaction === void 0 ? void 0 : transaction.created) === '' && (!transaction.created || transaction.modifiedCreated === '');
}
exports.isCreatedMissing = isCreatedMissing;
function areRequiredFieldsEmpty(transaction) {
    var _a, _b;
    var parentReport =
        allReports === null || allReports === void 0
            ? void 0
            : allReports['' + ONYXKEYS_1['default'].COLLECTION.REPORT + (transaction === null || transaction === void 0 ? void 0 : transaction.reportID)];
    var isFromExpenseReport = (parentReport === null || parentReport === void 0 ? void 0 : parentReport.type) === CONST_1['default'].REPORT.TYPE.EXPENSE;
    var isSplitPolicyExpenseChat = !!((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.splits) === null ||
    _b === void 0
        ? void 0
        : _b.some(function (participant) {
              var _a;
              return (_a = allReports === null || allReports === void 0 ? void 0 : allReports['' + ONYXKEYS_1['default'].COLLECTION.REPORT + participant.chatReportID]) === null ||
                  _a === void 0
                  ? void 0
                  : _a.isOwnPolicyExpenseChat;
          }));
    var isMerchantRequired = isFromExpenseReport || isSplitPolicyExpenseChat;
    return (isMerchantRequired && isMerchantMissing(transaction)) || isAmountMissing(transaction) || isCreatedMissing(transaction);
}
exports.areRequiredFieldsEmpty = areRequiredFieldsEmpty;
/**
 * Given the edit made to the expense, return an updated transaction object.
 */
function getUpdatedTransaction(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var transaction = _a.transaction,
        transactionChanges = _a.transactionChanges,
        isFromExpenseReport = _a.isFromExpenseReport,
        _o = _a.shouldUpdateReceiptState,
        shouldUpdateReceiptState = _o === void 0 ? true : _o,
        _p = _a.policy,
        policy = _p === void 0 ? undefined : _p;
    // Only changing the first level fields so no need for deep clone now
    var updatedTransaction = cloneDeep_1['default'](transaction);
    var shouldStopSmartscan = false;
    // The comment property does not have its modifiedComment counterpart
    if (Object.hasOwn(transactionChanges, 'comment')) {
        updatedTransaction.comment = __assign(__assign({}, updatedTransaction.comment), {comment: transactionChanges.comment});
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
        if (
            !((_d = (_c = (_b = transactionChanges.routes) === null || _b === void 0 ? void 0 : _b.route0) === null || _c === void 0 ? void 0 : _c.geometry) === null || _d === void 0
                ? void 0
                : _d.coordinates)
        ) {
            // The waypoints were changed, but there is no route – it is pending from the BE and we should mark the fields as pending
            updatedTransaction.amount = CONST_1['default'].IOU.DEFAULT_AMOUNT;
            updatedTransaction.modifiedAmount = CONST_1['default'].IOU.DEFAULT_AMOUNT;
            updatedTransaction.modifiedMerchant = Localize.translateLocal('iou.fieldPending');
        } else {
            var mileageRate = DistanceRequestUtils_1['default'].getRate({transaction: updatedTransaction, policy: policy});
            var unit = mileageRate.unit,
                rate = mileageRate.rate;
            var distanceInMeters = getDistanceInMeters_1['default'](transaction, unit);
            var amount = DistanceRequestUtils_1['default'].getDistanceRequestAmount(distanceInMeters, unit, rate !== null && rate !== void 0 ? rate : 0);
            var updatedAmount = isFromExpenseReport ? -amount : amount;
            var updatedMerchant = DistanceRequestUtils_1['default'].getDistanceMerchant(true, distanceInMeters, unit, rate, transaction.currency, Localize.translateLocal, function (digit) {
                return LocaleDigitUtils_1.toLocaleDigit(preferredLocale, digit);
            });
            updatedTransaction.amount = updatedAmount;
            updatedTransaction.modifiedAmount = updatedAmount;
            updatedTransaction.modifiedMerchant = updatedMerchant;
        }
    }
    if (Object.hasOwn(transactionChanges, 'customUnitRateID')) {
        set_1['default'](updatedTransaction, 'comment.customUnit.customUnitRateID', transactionChanges.customUnitRateID);
        set_1['default'](updatedTransaction, 'comment.customUnit.defaultP2PRate', null);
        shouldStopSmartscan = true;
        var existingDistanceUnit =
            (_f = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _e === void 0 ? void 0 : _e.customUnit) === null || _f === void 0
                ? void 0
                : _f.distanceUnit;
        // Get the new distance unit from the rate's unit
        var newDistanceUnit = DistanceRequestUtils_1['default'].getUpdatedDistanceUnit({transaction: updatedTransaction, policy: policy});
        set_1['default'](updatedTransaction, 'comment.customUnit.distanceUnit', newDistanceUnit);
        // If the distanceUnit is set and the rate is changed to one that has a different unit, convert the distance to the new unit
        if (existingDistanceUnit && newDistanceUnit !== existingDistanceUnit) {
            var conversionFactor =
                existingDistanceUnit === CONST_1['default'].CUSTOM_UNITS.DISTANCE_UNIT_MILES
                    ? CONST_1['default'].CUSTOM_UNITS.MILES_TO_KILOMETERS
                    : CONST_1['default'].CUSTOM_UNITS.KILOMETERS_TO_MILES;
            var distance = NumberUtils.roundToTwoDecimalPlaces(
                ((_j =
                    (_h = (_g = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _g === void 0 ? void 0 : _g.customUnit) === null || _h === void 0
                        ? void 0
                        : _h.quantity) !== null && _j !== void 0
                    ? _j
                    : 0) * conversionFactor,
            );
            set_1['default'](updatedTransaction, 'comment.customUnit.quantity', distance);
        }
        if (!isFetchingWaypointsFromServer(transaction)) {
            // When the waypoints are being fetched from the server, we have no information about the distance, and cannot recalculate the updated amount.
            // Otherwise, recalculate the fields based on the new rate.
            var oldMileageRate = DistanceRequestUtils_1['default'].getRate({transaction: transaction, policy: policy});
            var updatedMileageRate = DistanceRequestUtils_1['default'].getRate({transaction: updatedTransaction, policy: policy, useTransactionDistanceUnit: false});
            var unit = updatedMileageRate.unit,
                rate = updatedMileageRate.rate;
            var distanceInMeters = getDistanceInMeters_1['default'](transaction, oldMileageRate === null || oldMileageRate === void 0 ? void 0 : oldMileageRate.unit);
            var amount = DistanceRequestUtils_1['default'].getDistanceRequestAmount(distanceInMeters, unit, rate !== null && rate !== void 0 ? rate : 0);
            var updatedAmount = isFromExpenseReport ? -amount : amount;
            var updatedCurrency = (_k = updatedMileageRate.currency) !== null && _k !== void 0 ? _k : CONST_1['default'].CURRENCY.USD;
            var updatedMerchant = DistanceRequestUtils_1['default'].getDistanceMerchant(true, distanceInMeters, unit, rate, updatedCurrency, Localize.translateLocal, function (digit) {
                return LocaleDigitUtils_1.toLocaleDigit(preferredLocale, digit);
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
        var _q = getCategoryTaxCodeAndAmount(transactionChanges.category, transaction, policy),
            categoryTaxCode = _q.categoryTaxCode,
            categoryTaxAmount = _q.categoryTaxAmount;
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
    if (
        shouldUpdateReceiptState &&
        shouldStopSmartscan &&
        (transaction === null || transaction === void 0 ? void 0 : transaction.receipt) &&
        Object.keys(transaction.receipt).length > 0 &&
        ((_l = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _l === void 0 ? void 0 : _l.state) !== CONST_1['default'].IOU.RECEIPT_STATE.OPEN &&
        updatedTransaction.receipt
    ) {
        updatedTransaction.receipt.state = CONST_1['default'].IOU.RECEIPT_STATE.OPEN;
    }
    updatedTransaction.pendingFields = __assign(
        __assign(
            __assign(
                __assign(
                    __assign(
                        __assign(
                            __assign(
                                __assign(
                                    __assign(
                                        __assign(
                                            __assign(
                                                __assign(
                                                    __assign(
                                                        {},
                                                        (_m = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.pendingFields) !== null &&
                                                            _m !== void 0
                                                            ? _m
                                                            : {},
                                                    ),
                                                    Object.hasOwn(transactionChanges, 'comment') && {comment: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                                ),
                                                Object.hasOwn(transactionChanges, 'created') && {created: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                            ),
                                            Object.hasOwn(transactionChanges, 'amount') && {amount: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                        ),
                                        Object.hasOwn(transactionChanges, 'currency') && {currency: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                    ),
                                    Object.hasOwn(transactionChanges, 'merchant') && {merchant: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                ),
                                Object.hasOwn(transactionChanges, 'waypoints') && {waypoints: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            ),
                            Object.hasOwn(transactionChanges, 'billable') && {billable: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        ),
                        Object.hasOwn(transactionChanges, 'category') && {category: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    ),
                    Object.hasOwn(transactionChanges, 'tag') && {tag: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                ),
                Object.hasOwn(transactionChanges, 'taxAmount') && {taxAmount: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            ),
            Object.hasOwn(transactionChanges, 'taxCode') && {taxCode: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        ),
        Object.hasOwn(transactionChanges, 'attendees') && {attendees: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
    );
    return updatedTransaction;
}
exports.getUpdatedTransaction = getUpdatedTransaction;
/**
 * Return the comment field (referred to as description in the App) from the transaction.
 * The comment does not have its modifiedComment counterpart.
 */
function getDescription(transaction) {
    var _a, _b, _c;
    // Casting the description to string to avoid wrong data types (e.g. number) being returned from the API
    return (_c =
        (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.comment) === null || _b === void 0
            ? void 0
            : _b.toString()) !== null && _c !== void 0
        ? _c
        : '';
}
exports.getDescription = getDescription;
/**
 * Return the amount field from the transaction, return the modifiedAmount if present.
 */
function getAmount(transaction, isFromExpenseReport, isFromTrackedExpense) {
    var _a, _b, _c, _d;
    if (isFromExpenseReport === void 0) {
        isFromExpenseReport = false;
    }
    if (isFromTrackedExpense === void 0) {
        isFromTrackedExpense = false;
    }
    // IOU requests cannot have negative values, but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport || isFromTrackedExpense) {
        var amount_1 = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAmount) !== null && _a !== void 0 ? _a : 0;
        if (amount_1) {
            return Math.abs(amount_1);
        }
        return Math.abs((_b = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _b !== void 0 ? _b : 0);
    }
    // Expense report case:
    // The amounts are stored using an opposite sign and negative values can be set,
    // we need to return an opposite sign than is saved in the transaction object
    var amount = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAmount) !== null && _c !== void 0 ? _c : 0;
    if (amount) {
        return -amount;
    }
    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    amount = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _d !== void 0 ? _d : 0;
    return amount ? -amount : 0;
}
exports.getAmount = getAmount;
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
exports.getTaxAmount = getTaxAmount;
/**
 * Return the tax code from the transaction.
 */
function getTaxCode(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.taxCode) !== null && _a !== void 0 ? _a : '';
}
exports.getTaxCode = getTaxCode;
/**
 * Return the posted date from the transaction.
 */
function getPostedDate(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.posted) !== null && _a !== void 0 ? _a : '';
}
/**
 * Return the formated posted date from the transaction.
 */
function getFormattedPostedDate(transaction, dateFormat) {
    if (dateFormat === void 0) {
        dateFormat = CONST_1['default'].DATE.FNS_FORMAT_STRING;
    }
    var postedDate = getPostedDate(transaction);
    var parsedDate = date_fns_1.parse(postedDate, 'yyyyMMdd', new Date());
    if (date_fns_1.isValid(parsedDate)) {
        return DateUtils_1['default'].formatWithUTCTimeZone(date_fns_1.format(parsedDate, 'yyyy-MM-dd'), dateFormat);
    }
    return '';
}
exports.getFormattedPostedDate = getFormattedPostedDate;
/**
 * Return the currency field from the transaction, return the modifiedCurrency if present.
 */
function getCurrency(transaction) {
    var _a, _b;
    var currency = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedCurrency) !== null && _a !== void 0 ? _a : '';
    if (currency) {
        return currency;
    }
    return (_b = transaction === null || transaction === void 0 ? void 0 : transaction.currency) !== null && _b !== void 0 ? _b : CONST_1['default'].CURRENCY.USD;
}
exports.getCurrency = getCurrency;
/**
 * Return the original currency field from the transaction.
 */
function getOriginalCurrency(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.originalCurrency) !== null && _a !== void 0 ? _a : '';
}
exports.getOriginalCurrency = getOriginalCurrency;
/**
 * Return the absolute value of the original amount field from the transaction.
 */
function getOriginalAmount(transaction) {
    var _a;
    var amount = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.originalAmount) !== null && _a !== void 0 ? _a : 0;
    return Math.abs(amount);
}
exports.getOriginalAmount = getOriginalAmount;
/**
 * Verify if the transaction is expecting the distance to be calculated on the server
 */
function isFetchingWaypointsFromServer(transaction) {
    var _a;
    return !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.pendingFields) === null || _a === void 0 ? void 0 : _a.waypoints);
}
exports.isFetchingWaypointsFromServer = isFetchingWaypointsFromServer;
/**
 * Return the merchant field from the transaction, return the modifiedMerchant if present.
 */
function getMerchant(transaction) {
    var _a;
    if (transaction && isDistanceRequest(transaction)) {
        var report = ReportUtils_1.getReportOrDraftReport(transaction.reportID);
        var policy = PolicyUtils_1.getPolicy(report === null || report === void 0 ? void 0 : report.policyID);
        var mileageRate = DistanceRequestUtils_1['default'].getRate({transaction: transaction, policy: policy});
        var unit = mileageRate.unit,
            rate = mileageRate.rate;
        var distanceInMeters = getDistanceInMeters_1['default'](transaction, unit);
        return DistanceRequestUtils_1['default'].getDistanceMerchant(true, distanceInMeters, unit, rate, transaction.currency, Localize.translateLocal, function (digit) {
            return LocaleDigitUtils_1.toLocaleDigit(preferredLocale, digit);
        });
    }
    return (transaction === null || transaction === void 0 ? void 0 : transaction.modifiedMerchant)
        ? transaction.modifiedMerchant
        : (_a = transaction === null || transaction === void 0 ? void 0 : transaction.merchant) !== null && _a !== void 0
        ? _a
        : '';
}
exports.getMerchant = getMerchant;
function getMerchantOrDescription(transaction) {
    return !isMerchantMissing(transaction) ? getMerchant(transaction) : getDescription(transaction);
}
exports.getMerchantOrDescription = getMerchantOrDescription;
/**
 * Return the list of modified attendees if present otherwise list of attendees
 */
function getAttendees(transaction) {
    var _a, _b;
    return (transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAttendees)
        ? transaction.modifiedAttendees
        : (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.attendees) !== null && _b !== void 0
        ? _b
        : [];
}
exports.getAttendees = getAttendees;
/**
 * Return the list of attendees as a string and modified list of attendees as a string if present.
 */
function getFormattedAttendees(modifiedAttendees, attendees) {
    var oldAttendees = modifiedAttendees !== null && modifiedAttendees !== void 0 ? modifiedAttendees : [];
    var newAttendees = attendees !== null && attendees !== void 0 ? attendees : [];
    return [
        oldAttendees
            .map(function (item) {
                var _a;
                return (_a = item.displayName) !== null && _a !== void 0 ? _a : item.login;
            })
            .join(', '),
        newAttendees
            .map(function (item) {
                var _a;
                return (_a = item.displayName) !== null && _a !== void 0 ? _a : item.login;
            })
            .join(', '),
    ];
}
exports.getFormattedAttendees = getFormattedAttendees;
/**
 * Return the reimbursable value. Defaults to true to match BE logic.
 */
function getReimbursable(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.reimbursable) !== null && _a !== void 0 ? _a : true;
}
exports.getReimbursable = getReimbursable;
/**
 * Return the mccGroup field from the transaction, return the modifiedMCCGroup if present.
 */
function getMCCGroup(transaction) {
    return (transaction === null || transaction === void 0 ? void 0 : transaction.modifiedMCCGroup)
        ? transaction.modifiedMCCGroup
        : transaction === null || transaction === void 0
        ? void 0
        : transaction.mccGroup;
}
exports.getMCCGroup = getMCCGroup;
/**
 * Return the waypoints field from the transaction, return the modifiedWaypoints if present.
 */
function getWaypoints(transaction) {
    var _a, _b;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.modifiedWaypoints) !== null && _a !== void 0
        ? _a
        : (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0
        ? void 0
        : _b.waypoints;
}
exports.getWaypoints = getWaypoints;
/**
 * Return the category from the transaction. This "category" field has no "modified" complement.
 */
function getCategory(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.category) !== null && _a !== void 0 ? _a : '';
}
exports.getCategory = getCategory;
/**
 * Return the cardID from the transaction.
 */
function getCardID(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.cardID) !== null && _a !== void 0 ? _a : CONST_1['default'].DEFAULT_NUMBER_ID;
}
exports.getCardID = getCardID;
/**
 * Return the billable field from the transaction. This "billable" field has no "modified" complement.
 */
function getBillable(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.billable) !== null && _a !== void 0 ? _a : false;
}
exports.getBillable = getBillable;
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
exports.getTagArrayFromName = getTagArrayFromName;
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
exports.getTag = getTag;
function getTagForDisplay(transaction, tagIndex) {
    return PolicyUtils_1.getCleanedTagName(getTag(transaction, tagIndex));
}
exports.getTagForDisplay = getTagForDisplay;
function getCreated(transaction) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return (transaction === null || transaction === void 0 ? void 0 : transaction.modifiedCreated)
        ? transaction.modifiedCreated
        : (transaction === null || transaction === void 0 ? void 0 : transaction.created) || '';
}
exports.getCreated = getCreated;
/**
 * Return the created field from the transaction, return the modifiedCreated if present.
 */
function getFormattedCreated(transaction, dateFormat) {
    if (dateFormat === void 0) {
        dateFormat = CONST_1['default'].DATE.FNS_FORMAT_STRING;
    }
    var created = getCreated(transaction);
    return DateUtils_1['default'].formatWithUTCTimeZone(created, dateFormat);
}
exports.getFormattedCreated = getFormattedCreated;
/**
 * Determine whether a transaction is made with an Expensify card.
 */
function isExpensifyCardTransaction(transaction) {
    return (transaction === null || transaction === void 0 ? void 0 : transaction.bank) === CONST_1['default'].EXPENSIFY_CARD.BANK;
}
exports.isExpensifyCardTransaction = isExpensifyCardTransaction;
/**
 * Determine whether a transaction is made with a card (Expensify or Company Card).
 */
function isCardTransaction(transaction) {
    return !!(transaction === null || transaction === void 0 ? void 0 : transaction.managedCard);
}
exports.isCardTransaction = isCardTransaction;
function getCardName(transaction) {
    var _a;
    return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.cardName) !== null && _a !== void 0 ? _a : '';
}
exports.getCardName = getCardName;
/**
 * Check if the transaction status is set to Pending.
 */
function isPending(transaction) {
    if (!(transaction === null || transaction === void 0 ? void 0 : transaction.status)) {
        return false;
    }
    return transaction.status === CONST_1['default'].TRANSACTION.STATUS.PENDING;
}
exports.isPending = isPending;
/**
 * Check if the transaction status is set to Posted.
 */
function isPosted(transaction) {
    if (!transaction.status) {
        return false;
    }
    return transaction.status === CONST_1['default'].TRANSACTION.STATUS.POSTED;
}
exports.isPosted = isPosted;
function isReceiptBeingScanned(transaction) {
    return [CONST_1['default'].IOU.RECEIPT_STATE.SCANREADY, CONST_1['default'].IOU.RECEIPT_STATE.SCANNING].some(function (value) {
        var _a;
        return value === ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.state);
    });
}
exports.isReceiptBeingScanned = isReceiptBeingScanned;
function didReceiptScanSucceed(transaction) {
    return [CONST_1['default'].IOU.RECEIPT_STATE.SCANCOMPLETE].some(function (value) {
        var _a;
        return value === ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.state);
    });
}
exports.didReceiptScanSucceed = didReceiptScanSucceed;
/**
 * Check if the transaction has a non-smartscanning receipt and is missing required fields
 */
function hasMissingSmartscanFields(transaction) {
    return !!(transaction && !isDistanceRequest(transaction) && !isReceiptBeingScanned(transaction) && areRequiredFieldsEmpty(transaction));
}
exports.hasMissingSmartscanFields = hasMissingSmartscanFields;
/**
 * Get all transaction violations of the transaction with given tranactionID.
 */
function getTransactionViolations(transactionID, transactionViolations) {
    var _a;
    var transaction = getTransaction(transactionID);
    if (!transactionID || !transactionViolations) {
        return undefined;
    }
    return (_a =
        transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations[ONYXKEYS_1['default'].COLLECTION.TRANSACTION_VIOLATIONS + transactionID]) ===
        null || _a === void 0
        ? void 0
        : _a.filter(function (violation) {
              return !isViolationDismissed(transaction, violation);
          });
}
exports.getTransactionViolations = getTransactionViolations;
/**
 * Check if there is pending rter violation in transactionViolations.
 */
function hasPendingRTERViolation(transactionViolations) {
    return !!(transactionViolations === null || transactionViolations === void 0
        ? void 0
        : transactionViolations.some(function (transactionViolation) {
              var _a, _b, _c;
              return (
                  transactionViolation.name === CONST_1['default'].VIOLATIONS.RTER &&
                  ((_a = transactionViolation.data) === null || _a === void 0 ? void 0 : _a.pendingPattern) &&
                  ((_b = transactionViolation.data) === null || _b === void 0 ? void 0 : _b.rterType) !== CONST_1['default'].RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION &&
                  ((_c = transactionViolation.data) === null || _c === void 0 ? void 0 : _c.rterType) !== CONST_1['default'].RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530
              );
          }));
}
exports.hasPendingRTERViolation = hasPendingRTERViolation;
/**
 * Check if there is broken connection violation.
 */
function hasBrokenConnectionViolation(transactionID, transactionViolations) {
    var violations = getTransactionViolations(transactionID, transactionViolations);
    return !!(violations === null || violations === void 0
        ? void 0
        : violations.find(function (violation) {
              return isBrokenConnectionViolation(violation);
          }));
}
exports.hasBrokenConnectionViolation = hasBrokenConnectionViolation;
function isBrokenConnectionViolation(violation) {
    var _a, _b;
    return (
        violation.name === CONST_1['default'].VIOLATIONS.RTER &&
        (((_a = violation.data) === null || _a === void 0 ? void 0 : _a.rterType) === CONST_1['default'].RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION ||
            ((_b = violation.data) === null || _b === void 0 ? void 0 : _b.rterType) === CONST_1['default'].RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530)
    );
}
exports.isBrokenConnectionViolation = isBrokenConnectionViolation;
function shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy) {
    if (brokenConnectionViolations.length === 0) {
        return false;
    }
    if (!PolicyUtils_1.isPolicyAdmin(policy) || ReportUtils_1.isCurrentUserSubmitter(report === null || report === void 0 ? void 0 : report.reportID)) {
        return true;
    }
    if (ReportUtils_1.isOpenExpenseReport(report)) {
        return true;
    }
    return ReportUtils_1.isProcessingReport(report) && PolicyUtils_1.isInstantSubmitEnabled(policy);
}
/**
 * Check if user should see broken connection violation warning based on violations list.
 */
function shouldShowBrokenConnectionViolation(report, policy, transactionViolations) {
    var brokenConnectionViolations = transactionViolations.filter(function (violation) {
        return isBrokenConnectionViolation(violation);
    });
    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}
exports.shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolation;
/**
 * Check if user should see broken connection violation warning based on selected transactions.
 */
function shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, report, policy, transactionViolations) {
    var violations = transactionIDs.flatMap(function (id) {
        var _a;
        return (_a =
            transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations['' + ONYXKEYS_1['default'].COLLECTION.TRANSACTION_VIOLATIONS + id]) !==
            null && _a !== void 0
            ? _a
            : [];
    });
    var brokenConnectionViolations = violations.filter(function (violation) {
        return isBrokenConnectionViolation(violation);
    });
    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}
exports.shouldShowBrokenConnectionViolationForMultipleTransactions = shouldShowBrokenConnectionViolationForMultipleTransactions;
function checkIfShouldShowMarkAsCashButton(hasRTERVPendingViolation, shouldDisplayBrokenConnectionViolation, report, policy) {
    if (hasRTERVPendingViolation) {
        return true;
    }
    return (
        shouldDisplayBrokenConnectionViolation &&
        (!PolicyUtils_1.isPolicyAdmin(policy) || ReportUtils_1.isCurrentUserSubmitter(report === null || report === void 0 ? void 0 : report.reportID)) &&
        !ReportUtils_1.isReportApproved({report: report}) &&
        !ReportUtils_1.isReportManuallyReimbursed(report)
    );
}
exports.checkIfShouldShowMarkAsCashButton = checkIfShouldShowMarkAsCashButton;
/**
 * Check if there is pending rter violation in all transactionViolations with given transactionIDs.
 */
function allHavePendingRTERViolation(transactionIds, transactionViolations) {
    var transactionsWithRTERViolations = transactionIds.map(function (transactionId) {
        var filteredTransactionViolations = getTransactionViolations(transactionId, transactionViolations);
        return hasPendingRTERViolation(filteredTransactionViolations);
    });
    return (
        transactionsWithRTERViolations.length > 0 &&
        transactionsWithRTERViolations.every(function (value) {
            return value === true;
        })
    );
}
exports.allHavePendingRTERViolation = allHavePendingRTERViolation;
/**
 * Check if there is any transaction without RTER violation within the given transactionIDs.
 */
function hasAnyTransactionWithoutRTERViolation(transactionIds, transactionViolations) {
    return (
        transactionIds.length > 0 &&
        transactionIds.some(function (transactionId) {
            return !hasBrokenConnectionViolation(transactionId, transactionViolations);
        })
    );
}
exports.hasAnyTransactionWithoutRTERViolation = hasAnyTransactionWithoutRTERViolation;
/**
 * Check if the transaction is pending or has a pending rter violation.
 */
function hasPendingUI(transaction, transactionViolations) {
    return isReceiptBeingScanned(transaction) || isPending(transaction) || (!!transaction && hasPendingRTERViolation(transactionViolations));
}
exports.hasPendingUI = hasPendingUI;
/**
 * Check if the transaction has a defined route
 */
function hasRoute(transaction, isDistanceRequestType) {
    var _a, _b, _c, _d, _e;
    return (
        !!((_c =
            (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.routes) === null || _a === void 0 ? void 0 : _a.route0) === null || _b === void 0
                ? void 0
                : _b.geometry) === null || _c === void 0
            ? void 0
            : _c.coordinates) ||
        (!!isDistanceRequestType &&
            !!((_e = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit) === null || _e === void 0
                ? void 0
                : _e.quantity))
    );
}
exports.hasRoute = hasRoute;
function waypointHasValidAddress(waypoint) {
    var _a;
    return !!((_a = waypoint === null || waypoint === void 0 ? void 0 : waypoint.address) === null || _a === void 0 ? void 0 : _a.trim());
}
exports.waypointHasValidAddress = waypointHasValidAddress;
/**
 * Converts the key of a waypoint to its index
 */
function getWaypointIndex(key) {
    return Number(key.replace('waypoint', ''));
}
exports.getWaypointIndex = getWaypointIndex;
/**
 * Filters the waypoints which are valid and returns those
 */
function getValidWaypoints(waypoints, reArrangeIndexes) {
    if (reArrangeIndexes === void 0) {
        reArrangeIndexes = false;
    }
    if (!waypoints) {
        return {};
    }
    var sortedIndexes = Object.keys(waypoints)
        .map(getWaypointIndex)
        .sort(function (a, b) {
            return a - b;
        });
    var waypointValues = sortedIndexes.map(function (index) {
        return waypoints['waypoint' + index];
    });
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
        acc['waypoint' + (reArrangeIndexes ? waypointIndex + 1 : index)] = currentWaypoint;
        lastWaypointIndex = index;
        waypointIndex += 1;
        return acc;
    }, {});
}
exports.getValidWaypoints = getValidWaypoints;
/**
 * Returns the most recent transactions in an object
 */
function getRecentTransactions(transactions, size) {
    if (size === void 0) {
        size = 2;
    }
    return Object.keys(transactions)
        .sort(function (transactionID1, transactionID2) {
            return new Date(transactions[transactionID1]) < new Date(transactions[transactionID2]) ? 1 : -1;
        })
        .slice(0, size);
}
exports.getRecentTransactions = getRecentTransactions;
/**
 * Check if transaction has duplicatedTransaction violation.
 * @param transactionID - the transaction to check
 * @param checkDismissed - whether to check if the violation has already been dismissed as well
 */
function isDuplicate(transactionID, checkDismissed) {
    var _a;
    if (checkDismissed === void 0) {
        checkDismissed = false;
    }
    var transaction = getTransaction(transactionID);
    if (!transaction) {
        return false;
    }
    var duplicateViolation =
        (_a =
            allTransactionViolations === null || allTransactionViolations === void 0
                ? void 0
                : allTransactionViolations['' + ONYXKEYS_1['default'].COLLECTION.TRANSACTION_VIOLATIONS + transactionID]) === null || _a === void 0
            ? void 0
            : _a.find(function (violation) {
                  return violation.name === CONST_1['default'].VIOLATIONS.DUPLICATED_TRANSACTION;
              });
    var hasDuplicatedViolation = !!duplicateViolation;
    if (!checkDismissed) {
        return hasDuplicatedViolation;
    }
    var didDismissedViolation = isViolationDismissed(transaction, duplicateViolation);
    return hasDuplicatedViolation && !didDismissedViolation;
}
exports.isDuplicate = isDuplicate;
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
exports.isOnHold = isOnHold;
/**
 * Check if transaction is on hold for the given transactionID
 */
function isOnHoldByTransactionID(transactionID) {
    if (!transactionID) {
        return false;
    }
    return isOnHold(allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions['' + ONYXKEYS_1['default'].COLLECTION.TRANSACTION + transactionID]);
}
exports.isOnHoldByTransactionID = isOnHoldByTransactionID;
/**
 * Checks if a violation is dismissed for the given transaction
 */
function isViolationDismissed(transaction, violation) {
    var _a, _b, _c;
    if (!transaction || !violation) {
        return false;
    }
    return (
        ((_c =
            (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.dismissedViolations) === null || _b === void 0
                ? void 0
                : _b[violation.name]) === null || _c === void 0
            ? void 0
            : _c[currentUserEmail]) ===
        '' + currentUserAccountID
    );
}
exports.isViolationDismissed = isViolationDismissed;
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
    var violations = Array.isArray(transactionViolations)
        ? transactionViolations
        : transactionViolations === null || transactionViolations === void 0
        ? void 0
        : transactionViolations[ONYXKEYS_1['default'].COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID];
    return !!(violations === null || violations === void 0
        ? void 0
        : violations.some(function (violation) {
              var _a;
              return (
                  violation.type === CONST_1['default'].VIOLATION_TYPES.VIOLATION &&
                  (showInReview === undefined || showInReview === ((_a = violation.showInReview) !== null && _a !== void 0 ? _a : false)) &&
                  !isViolationDismissed(transaction, violation)
              );
          }));
}
exports.hasViolation = hasViolation;
function hasDuplicateTransactions(iouReportID, allReportTransactions) {
    var transactionsByIouReportID = ReportUtils_1.getReportTransactions(iouReportID);
    var reportTransactions = allReportTransactions !== null && allReportTransactions !== void 0 ? allReportTransactions : transactionsByIouReportID;
    return (
        reportTransactions.length > 0 &&
        reportTransactions.some(function (transaction) {
            return isDuplicate(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, true);
        })
    );
}
exports.hasDuplicateTransactions = hasDuplicateTransactions;
/**
 * Checks if any violations for the provided transaction are of type 'notice'
 */
function hasNoticeTypeViolation(transactionID, transactionViolations, showInReview) {
    var transaction = getTransaction(transactionID);
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    var violations = Array.isArray(transactionViolations)
        ? transactionViolations
        : transactionViolations === null || transactionViolations === void 0
        ? void 0
        : transactionViolations[ONYXKEYS_1['default'].COLLECTION.TRANSACTION_VIOLATIONS + transactionID];
    return !!(violations === null || violations === void 0
        ? void 0
        : violations.some(function (violation) {
              var _a;
              return (
                  violation.type === CONST_1['default'].VIOLATION_TYPES.NOTICE &&
                  (showInReview === undefined || showInReview === ((_a = violation.showInReview) !== null && _a !== void 0 ? _a : false)) &&
                  !isViolationDismissed(transaction, violation)
              );
          }));
}
exports.hasNoticeTypeViolation = hasNoticeTypeViolation;
/**
 * Checks if any violations for the provided transaction are of type 'warning'
 */
function hasWarningTypeViolation(transactionID, transactionViolations, showInReview) {
    var _a;
    var transaction = getTransaction(transactionID);
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    var violations = Array.isArray(transactionViolations)
        ? transactionViolations
        : transactionViolations === null || transactionViolations === void 0
        ? void 0
        : transactionViolations[ONYXKEYS_1['default'].COLLECTION.TRANSACTION_VIOLATIONS + transactionID];
    var warningTypeViolations =
        (_a =
            violations === null || violations === void 0
                ? void 0
                : violations.filter(function (violation) {
                      var _a;
                      return (
                          violation.type === CONST_1['default'].VIOLATION_TYPES.WARNING &&
                          (showInReview === undefined || showInReview === ((_a = violation.showInReview) !== null && _a !== void 0 ? _a : false)) &&
                          !isViolationDismissed(transaction, violation)
                      );
                  })) !== null && _a !== void 0
            ? _a
            : [];
    return warningTypeViolations.length > 0;
}
exports.hasWarningTypeViolation = hasWarningTypeViolation;
/**
 * Calculates tax amount from the given expense amount and tax percentage
 */
function calculateTaxAmount(percentage, amount, currency) {
    if (!percentage) {
        return 0;
    }
    var divisor = Number(percentage.slice(0, -1)) / 100 + 1;
    var taxAmount = (amount - amount / divisor) / 100;
    var decimals = CurrencyUtils_1.getCurrencyDecimals(currency);
    return parseFloat(taxAmount.toFixed(decimals));
}
exports.calculateTaxAmount = calculateTaxAmount;
/**
 * Calculates count of all tax enabled options
 */
function getEnabledTaxRateCount(options) {
    return Object.values(options).filter(function (option) {
        return !option.isDisabled;
    }).length;
}
exports.getEnabledTaxRateCount = getEnabledTaxRateCount;
/**
 * Check if the customUnitRateID has a value default for P2P distance requests
 */
function isCustomUnitRateIDForP2P(transaction) {
    var _a, _b;
    return (
        ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0
            ? void 0
            : _b.customUnitRateID) === CONST_1['default'].CUSTOM_UNITS.FAKE_P2P_ID
    );
}
exports.isCustomUnitRateIDForP2P = isCustomUnitRateIDForP2P;
function hasReservationList(transaction) {
    var _a, _b;
    return (
        !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.reservationList) &&
        ((_b = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _b === void 0 ? void 0 : _b.reservationList.length) > 0
    );
}
exports.hasReservationList = hasReservationList;
/**
 * Whether an expense is going to be paid later, either at checkout for hotels or drop off for car rental
 */
function isPayAtEndExpense(transaction) {
    var _a, _b;
    return !!((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.reservationList) === null || _b === void 0
        ? void 0
        : _b.some(function (reservation) {
              return reservation.paymentType === 'PAY_AT_HOTEL' || reservation.paymentType === 'PAY_AT_VENDOR';
          }));
}
exports.isPayAtEndExpense = isPayAtEndExpense;
/**
 * Get custom unit rate (distance rate) ID from the transaction object
 */
function getRateID(transaction) {
    var _a, _b, _c;
    return (_c =
        (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0
            ? void 0
            : _b.customUnitRateID) !== null && _c !== void 0
        ? _c
        : CONST_1['default'].CUSTOM_UNITS.FAKE_P2P_ID;
}
exports.getRateID = getRateID;
/**
 * Gets the tax code based on the type of transaction and selected currency.
 * If it is distance request, then returns the tax code corresponding to the custom unit rate
 * Else returns policy default tax rate if transaction is in policy default currency, otherwise foreign default tax rate
 */
function getDefaultTaxCode(policy, transaction, currency) {
    var _a, _b, _c, _d;
    if (isDistanceRequest(transaction)) {
        var customUnitRateID = (_a = getRateID(transaction)) !== null && _a !== void 0 ? _a : '';
        var customUnitRate = PolicyUtils_1.getDistanceRateCustomUnitRate(policy, customUnitRateID);
        return (_b = customUnitRate === null || customUnitRate === void 0 ? void 0 : customUnitRate.attributes) === null || _b === void 0 ? void 0 : _b.taxRateExternalID;
    }
    var defaultExternalID = (_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.defaultExternalID;
    var foreignTaxDefault = (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.foreignTaxDefault;
    return (policy === null || policy === void 0 ? void 0 : policy.outputCurrency) === (currency !== null && currency !== void 0 ? currency : getCurrency(transaction))
        ? defaultExternalID
        : foreignTaxDefault;
}
exports.getDefaultTaxCode = getDefaultTaxCode;
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
    var getModifiedName = function (data, code) {
        return data.name + ' (' + data.value + ')' + (defaultTaxCode() === code ? ' ' + CONST_1['default'].DOT_SEPARATOR + ' ' + Localize.translateLocal('common.default') : '');
    };
    var taxes = Object.fromEntries(
        Object.entries((_a = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) !== null && _a !== void 0 ? _a : {}).map(function (_a) {
            var code = _a[0],
                data = _a[1];
            return [code, __assign(__assign({}, data), {code: code, modifiedName: getModifiedName(data, code), name: data.name})];
        }),
    );
    return taxes;
}
exports.transformedTaxRates = transformedTaxRates;
/**
 * Gets the tax value of a selected tax
 */
function getTaxValue(policy, transaction, taxCode) {
    var _a;
    return (_a = Object.values(transformedTaxRates(policy, transaction)).find(function (taxRate) {
        return taxRate.code === taxCode;
    })) === null || _a === void 0
        ? void 0
        : _a.value;
}
exports.getTaxValue = getTaxValue;
/**
 * Gets the tax name for Workspace Taxes Settings
 */
function getWorkspaceTaxesSettingsName(policy, taxCode) {
    var _a;
    return (_a = Object.values(transformedTaxRates(policy)).find(function (taxRate) {
        return taxRate.code === taxCode;
    })) === null || _a === void 0
        ? void 0
        : _a.modifiedName;
}
exports.getWorkspaceTaxesSettingsName = getWorkspaceTaxesSettingsName;
/**
 * Gets the name corresponding to the taxCode that is displayed to the user
 */
function getTaxName(policy, transaction) {
    var _a;
    var defaultTaxCode = getDefaultTaxCode(policy, transaction);
    return (_a = Object.values(transformedTaxRates(policy, transaction)).find(function (taxRate) {
        var _a;
        return taxRate.code === ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.taxCode) !== null && _a !== void 0 ? _a : defaultTaxCode);
    })) === null || _a === void 0
        ? void 0
        : _a.modifiedName;
}
exports.getTaxName = getTaxName;
function getTransaction(transactionID) {
    return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions['' + ONYXKEYS_1['default'].COLLECTION.TRANSACTION + transactionID];
}
exports.getTransaction = getTransaction;
function removeSettledAndApprovedTransactions(transactionIDs) {
    return transactionIDs.filter(function (transactionID) {
        var _a, _b;
        return (
            !ReportUtils_1.isSettled(
                (_a = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions['' + ONYXKEYS_1['default'].COLLECTION.TRANSACTION + transactionID]) === null ||
                    _a === void 0
                    ? void 0
                    : _a.reportID,
            ) &&
            !ReportUtils_1.isReportIDApproved(
                (_b = allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions['' + ONYXKEYS_1['default'].COLLECTION.TRANSACTION + transactionID]) === null ||
                    _b === void 0
                    ? void 0
                    : _b.reportID,
            )
        );
    });
}
exports.removeSettledAndApprovedTransactions = removeSettledAndApprovedTransactions;
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
function compareDuplicateTransactionFields(reviewingTransactionID, reportID, selectedTransactionID) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    if (!reviewingTransactionID || !reportID) {
        return {change: {}, keep: {}};
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var keep = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var change = {};
    if (!reviewingTransactionID || !reportID) {
        return {keep: keep, change: change};
    }
    var transactionViolations =
        allTransactionViolations === null || allTransactionViolations === void 0
            ? void 0
            : allTransactionViolations['' + ONYXKEYS_1['default'].COLLECTION.TRANSACTION_VIOLATIONS + reviewingTransactionID];
    var duplicates =
        (_c =
            (_b =
                (_a =
                    transactionViolations === null || transactionViolations === void 0
                        ? void 0
                        : transactionViolations.find(function (violation) {
                              return violation.name === CONST_1['default'].VIOLATIONS.DUPLICATED_TRANSACTION;
                          })) === null || _a === void 0
                    ? void 0
                    : _a.data) === null || _b === void 0
                ? void 0
                : _b.duplicates) !== null && _c !== void 0
            ? _c
            : [];
    var transactions = removeSettledAndApprovedTransactions(__spreadArrays([reviewingTransactionID], duplicates)).map(function (item) {
        return getTransaction(item);
    });
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
        return __spreadArrays(
            new Set(
                items
                    .map(function (item) {
                        // Prioritize modifiedMerchant over merchant
                        if (keys.includes('modifiedMerchant') && keys.includes('merchant')) {
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            return getMerchant(item);
                        }
                        return keys.map(function (key) {
                            return item === null || item === void 0 ? void 0 : item[key];
                        });
                    })
                    .flat(),
            ),
        );
    }
    // Helper function to check if all comments are equal
    function areAllCommentsEqual(items, firstTransaction) {
        return items.every(function (item) {
            return isEqual_1['default'](getDescription(item), getDescription(firstTransaction));
        });
    }
    // Helper function to check if all fields are equal for a given key
    function areAllFieldsEqual(items, keyExtractor) {
        var firstTransaction = transactions.at(0);
        return items.every(function (item) {
            return keyExtractor(item) === keyExtractor(firstTransaction);
        });
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
        var selectedTransaction = transactions.find(function (t) {
            return (t === null || t === void 0 ? void 0 : t.transactionID) === selectedTransactionID;
        });
        keep.comment = (_d = selectedTransaction === null || selectedTransaction === void 0 ? void 0 : selectedTransaction.comment) !== null && _d !== void 0 ? _d : {};
    }
    var _loop_1 = function (fieldName) {
        if (Object.prototype.hasOwnProperty.call(fieldsToCompare, fieldName)) {
            var keys_1 = fieldsToCompare[fieldName];
            var firstTransaction = transactions.at(0);
            var isFirstTransactionCommentEmptyObject =
                typeof (firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction.comment) === 'object' &&
                ((_e = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction.comment) === null || _e === void 0 ? void 0 : _e.comment) === '';
            var report = allReports === null || allReports === void 0 ? void 0 : allReports['' + ONYXKEYS_1['default'].COLLECTION.REPORT + reportID];
            var policy_1 = PolicyUtils_1.getPolicy(report === null || report === void 0 ? void 0 : report.policyID);
            var areAllFieldsEqualForKey = areAllFieldsEqual(transactions, function (item) {
                return keys_1
                    .map(function (key) {
                        return item === null || item === void 0 ? void 0 : item[key];
                    })
                    .join('|');
            });
            if (fieldName === 'description') {
                var allCommentsAreEqual = areAllCommentsEqual(transactions, firstTransaction);
                var allCommentsAreEmpty =
                    isFirstTransactionCommentEmptyObject &&
                    transactions.every(function (item) {
                        return getDescription(item) === '';
                    });
                if (allCommentsAreEqual || allCommentsAreEmpty) {
                    keep[fieldName] =
                        (_g = (_f = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction.comment) === null || _f === void 0 ? void 0 : _f.comment) !== null &&
                        _g !== void 0
                            ? _g
                            : firstTransaction === null || firstTransaction === void 0
                            ? void 0
                            : firstTransaction.comment;
                } else {
                    processChanges(fieldName, transactions, keys_1);
                }
            } else if (fieldName === 'merchant') {
                if (areAllFieldsEqual(transactions, getMerchant)) {
                    keep[fieldName] = getMerchant(firstTransaction);
                } else {
                    processChanges(fieldName, transactions, keys_1);
                }
            } else if (fieldName === 'taxCode') {
                var differentValues = getDifferentValues(transactions, keys_1);
                var validTaxes =
                    differentValues === null || differentValues === void 0
                        ? void 0
                        : differentValues.filter(function (taxID) {
                              var _a;
                              var tax = PolicyUtils_1.getTaxByID(policy_1, (_a = taxID) !== null && _a !== void 0 ? _a : '');
                              return (tax === null || tax === void 0 ? void 0 : tax.name) && !tax.isDisabled && tax.pendingAction !== CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                          });
                if (!areAllFieldsEqualForKey && validTaxes.length > 1) {
                    change[fieldName] = validTaxes;
                } else if (areAllFieldsEqualForKey) {
                    keep[fieldName] =
                        (_h = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _h !== void 0
                            ? _h
                            : firstTransaction === null || firstTransaction === void 0
                            ? void 0
                            : firstTransaction[keys_1[1]];
                }
            } else if (fieldName === 'category') {
                var differentValues_1 = getDifferentValues(transactions, keys_1);
                var policyCategories = (report === null || report === void 0 ? void 0 : report.policyID) ? Category_1.getPolicyCategoriesData(report.policyID) : {};
                var availableCategories = Object.values(policyCategories)
                    .filter(function (category) {
                        return differentValues_1.includes(category.name) && category.enabled && category.pendingAction !== CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                    })
                    .map(function (e) {
                        return e.name;
                    });
                if (
                    !areAllFieldsEqualForKey &&
                    (policy_1 === null || policy_1 === void 0 ? void 0 : policy_1.areCategoriesEnabled) &&
                    (availableCategories.length > 1 || (availableCategories.length === 1 && differentValues_1.includes('')))
                ) {
                    change[fieldName] = __spreadArrays(availableCategories, differentValues_1.includes('') ? [''] : []);
                } else if (areAllFieldsEqualForKey) {
                    keep[fieldName] =
                        (_j = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _j !== void 0
                            ? _j
                            : firstTransaction === null || firstTransaction === void 0
                            ? void 0
                            : firstTransaction[keys_1[1]];
                }
            } else if (fieldName === 'tag') {
                var policyTags = (report === null || report === void 0 ? void 0 : report.policyID)
                    ? Tag_1.getPolicyTagsData(report === null || report === void 0 ? void 0 : report.policyID)
                    : {};
                var isMultiLevelTags = PolicyUtils_1.isMultiLevelTags(policyTags);
                if (isMultiLevelTags) {
                    if (areAllFieldsEqualForKey || !(policy_1 === null || policy_1 === void 0 ? void 0 : policy_1.areTagsEnabled)) {
                        keep[fieldName] =
                            (_k = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _k !== void 0
                                ? _k
                                : firstTransaction === null || firstTransaction === void 0
                                ? void 0
                                : firstTransaction[keys_1[1]];
                    } else {
                        processChanges(fieldName, transactions, keys_1);
                    }
                } else {
                    var differentValues_2 = getDifferentValues(transactions, keys_1);
                    var policyTagsObj = Object.values((_m = (_l = Object.values(policyTags).at(0)) === null || _l === void 0 ? void 0 : _l.tags) !== null && _m !== void 0 ? _m : {});
                    var availableTags = policyTagsObj
                        .filter(function (tag) {
                            return differentValues_2.includes(tag.name) && tag.enabled && tag.pendingAction !== CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                        })
                        .map(function (e) {
                            return e.name;
                        });
                    if (
                        !areAllFieldsEqualForKey &&
                        (policy_1 === null || policy_1 === void 0 ? void 0 : policy_1.areTagsEnabled) &&
                        (availableTags.length > 1 || (availableTags.length === 1 && differentValues_2.includes('')))
                    ) {
                        change[fieldName] = __spreadArrays(availableTags, differentValues_2.includes('') ? [''] : []);
                    } else if (areAllFieldsEqualForKey) {
                        keep[fieldName] =
                            (_o = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _o !== void 0
                                ? _o
                                : firstTransaction === null || firstTransaction === void 0
                                ? void 0
                                : firstTransaction[keys_1[1]];
                    }
                }
            } else if (areAllFieldsEqualForKey) {
                keep[fieldName] =
                    (_p = firstTransaction === null || firstTransaction === void 0 ? void 0 : firstTransaction[keys_1[0]]) !== null && _p !== void 0
                        ? _p
                        : firstTransaction === null || firstTransaction === void 0
                        ? void 0
                        : firstTransaction[keys_1[1]];
            } else {
                processChanges(fieldName, transactions, keys_1);
            }
        }
    };
    for (var fieldName in fieldsToCompare) {
        _loop_1(fieldName);
    }
    return {keep: keep, change: change};
}
exports.compareDuplicateTransactionFields = compareDuplicateTransactionFields;
function getTransactionID(threadReportID) {
    var _a;
    if (!threadReportID) {
        return;
    }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports['' + ONYXKEYS_1['default'].COLLECTION.REPORT + threadReportID];
    var parentReportAction = ReportUtils_1.isThread(report) ? ReportActionsUtils_1.getReportAction(report.parentReportID, report.parentReportActionID) : undefined;
    var IOUTransactionID = ReportActionsUtils_1.isMoneyRequestAction(parentReportAction)
        ? (_a = ReportActionsUtils_1.getOriginalMessage(parentReportAction)) === null || _a === void 0
            ? void 0
            : _a.IOUTransactionID
        : undefined;
    return IOUTransactionID;
}
exports.getTransactionID = getTransactionID;
function buildNewTransactionAfterReviewingDuplicates(reviewDuplicateTransaction) {
    var _a;
    var originalTransaction =
        (_a =
            allTransactions === null || allTransactions === void 0
                ? void 0
                : allTransactions[
                      '' +
                          ONYXKEYS_1['default'].COLLECTION.TRANSACTION +
                          (reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.transactionID)
                  ]) !== null && _a !== void 0
            ? _a
            : undefined;
    var _b = reviewDuplicateTransaction !== null && reviewDuplicateTransaction !== void 0 ? reviewDuplicateTransaction : {},
        duplicates = _b.duplicates,
        restReviewDuplicateTransaction = __rest(_b, ['duplicates']);
    return __assign(__assign(__assign({}, originalTransaction), restReviewDuplicateTransaction), {
        modifiedMerchant: reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.merchant,
        merchant: reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.merchant,
        comment: __assign(__assign({}, reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.comment), {
            comment: reviewDuplicateTransaction === null || reviewDuplicateTransaction === void 0 ? void 0 : reviewDuplicateTransaction.description,
        }),
    });
}
exports.buildNewTransactionAfterReviewingDuplicates = buildNewTransactionAfterReviewingDuplicates;
function buildMergeDuplicatesParams(reviewDuplicates, originalTransaction) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return {
        amount: -getAmount(originalTransaction, true),
        reportID: originalTransaction === null || originalTransaction === void 0 ? void 0 : originalTransaction.reportID,
        receiptID:
            (_b = (_a = originalTransaction === null || originalTransaction === void 0 ? void 0 : originalTransaction.receipt) === null || _a === void 0 ? void 0 : _a.receiptID) !== null &&
            _b !== void 0
                ? _b
                : CONST_1['default'].DEFAULT_NUMBER_ID,
        currency: getCurrency(originalTransaction),
        created: getFormattedCreated(originalTransaction),
        transactionID: reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.transactionID,
        transactionIDList: removeSettledAndApprovedTransactions(
            (_c = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.duplicates) !== null && _c !== void 0 ? _c : [],
        ),
        billable: (_d = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.billable) !== null && _d !== void 0 ? _d : false,
        reimbursable: (_e = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.reimbursable) !== null && _e !== void 0 ? _e : false,
        category: (_f = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.category) !== null && _f !== void 0 ? _f : '',
        tag: (_g = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.tag) !== null && _g !== void 0 ? _g : '',
        merchant: (_h = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.merchant) !== null && _h !== void 0 ? _h : '',
        comment: (_j = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.description) !== null && _j !== void 0 ? _j : '',
    };
}
exports.buildMergeDuplicatesParams = buildMergeDuplicatesParams;
function getCategoryTaxCodeAndAmount(category, transaction, policy) {
    var _a, _b;
    var taxRules =
        (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.expenseRules) === null || _b === void 0
            ? void 0
            : _b.filter(function (rule) {
                  return rule.tax;
              });
    if (!taxRules || (taxRules === null || taxRules === void 0 ? void 0 : taxRules.length) === 0 || isDistanceRequest(transaction)) {
        return {categoryTaxCode: undefined, categoryTaxAmount: undefined};
    }
    var defaultTaxCode = getDefaultTaxCode(policy, transaction, getCurrency(transaction));
    var categoryTaxCode = CategoryUtils_1.getCategoryDefaultTaxRate(taxRules, category, defaultTaxCode);
    var categoryTaxPercentage = getTaxValue(policy, transaction, categoryTaxCode !== null && categoryTaxCode !== void 0 ? categoryTaxCode : '');
    var categoryTaxAmount;
    if (categoryTaxPercentage) {
        categoryTaxAmount = CurrencyUtils_1.convertToBackendAmount(calculateTaxAmount(categoryTaxPercentage, getAmount(transaction), getCurrency(transaction)));
    }
    return {categoryTaxCode: categoryTaxCode, categoryTaxAmount: categoryTaxAmount};
}
exports.getCategoryTaxCodeAndAmount = getCategoryTaxCodeAndAmount;
/**
 * Return the sorted list transactions of an iou report
 */
function getAllSortedTransactions(iouReportID) {
    return ReportUtils_1.getReportTransactions(iouReportID).sort(function (transA, transB) {
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
exports.getAllSortedTransactions = getAllSortedTransactions;
function shouldShowRTERViolationMessage(transactions) {
    var _a;
    return (
        (transactions === null || transactions === void 0 ? void 0 : transactions.length) === 1 &&
        hasPendingUI(
            transactions === null || transactions === void 0 ? void 0 : transactions.at(0),
            getTransactionViolations(
                (_a = transactions === null || transactions === void 0 ? void 0 : transactions.at(0)) === null || _a === void 0 ? void 0 : _a.transactionID,
                allTransactionViolations,
            ),
        )
    );
}
exports.shouldShowRTERViolationMessage = shouldShowRTERViolationMessage;
