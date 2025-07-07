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
exports.getReviewNavigationRoute = void 0;
exports.getIOUPayerAndReceiver = getIOUPayerAndReceiver;
exports.getTransactionPreviewTextAndTranslationPaths = getTransactionPreviewTextAndTranslationPaths;
exports.createTransactionPreviewConditionals = createTransactionPreviewConditionals;
exports.getViolationTranslatePath = getViolationTranslatePath;
exports.getUniqueActionErrors = getUniqueActionErrors;
var truncate_1 = require("lodash/truncate");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var Report_1 = require("./actions/Report");
var Transaction_1 = require("./actions/Transaction");
var CategoryUtils_1 = require("./CategoryUtils");
var CurrencyUtils_1 = require("./CurrencyUtils");
var DateUtils_1 = require("./DateUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var ReportUtils_1 = require("./ReportUtils");
var StringUtils_1 = require("./StringUtils");
var TransactionUtils_1 = require("./TransactionUtils");
var emptyPersonalDetails = {
    accountID: CONST_1.default.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};
/**
 * Returns the data for displaying payer and receiver (`from` and `to`) values for given ids and amount.
 * In IOU transactions we can deduce who is the payer and receiver based on sign (positive/negative) of the amount.
 */
function getIOUPayerAndReceiver(managerID, ownerAccountID, personalDetails, amount) {
    var fromID = ownerAccountID;
    var toID = managerID;
    if (amount < 0) {
        fromID = managerID;
        toID = ownerAccountID;
    }
    return {
        from: personalDetails ? personalDetails[fromID] : emptyPersonalDetails,
        to: personalDetails ? personalDetails[toID] : emptyPersonalDetails,
    };
}
var getReviewNavigationRoute = function (route, transaction, duplicates) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var backTo = route.params.backTo;
    // Clear the draft before selecting a different expense to prevent merging fields from the previous expense
    // (e.g., category, tag, tax) that may be not enabled/available in the new expense's policy.
    (0, Transaction_1.abandonReviewDuplicateTransactions)();
    var comparisonResult = (0, TransactionUtils_1.compareDuplicateTransactionFields)(transaction, duplicates, transaction === null || transaction === void 0 ? void 0 : transaction.reportID, transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
    (0, Transaction_1.setReviewDuplicatesKey)(__assign(__assign({}, comparisonResult.keep), { duplicates: duplicates.map(function (duplicate) { return duplicate === null || duplicate === void 0 ? void 0 : duplicate.transactionID; }).filter(Boolean), transactionID: transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, reportID: transaction === null || transaction === void 0 ? void 0 : transaction.reportID }));
    if (comparisonResult.change.merchant) {
        return ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute((_a = route.params) === null || _a === void 0 ? void 0 : _a.threadReportID, backTo);
    }
    if (comparisonResult.change.category) {
        return ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute((_b = route.params) === null || _b === void 0 ? void 0 : _b.threadReportID, backTo);
    }
    if (comparisonResult.change.tag) {
        return ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute((_c = route.params) === null || _c === void 0 ? void 0 : _c.threadReportID, backTo);
    }
    if (comparisonResult.change.description) {
        return ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute((_d = route.params) === null || _d === void 0 ? void 0 : _d.threadReportID, backTo);
    }
    if (comparisonResult.change.taxCode) {
        return ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute((_e = route.params) === null || _e === void 0 ? void 0 : _e.threadReportID, backTo);
    }
    if (comparisonResult.change.billable) {
        return ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute((_f = route.params) === null || _f === void 0 ? void 0 : _f.threadReportID, backTo);
    }
    if (comparisonResult.change.reimbursable) {
        return ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute((_g = route.params) === null || _g === void 0 ? void 0 : _g.threadReportID, backTo);
    }
    return ROUTES_1.default.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.getRoute((_h = route.params) === null || _h === void 0 ? void 0 : _h.threadReportID, backTo);
};
exports.getReviewNavigationRoute = getReviewNavigationRoute;
var dotSeparator = { text: " ".concat(CONST_1.default.DOT_SEPARATOR, " ") };
function getViolationTranslatePath(violations, hasFieldErrors, violationMessage, isTransactionOnHold) {
    var _a;
    var violationsCount = (_a = violations === null || violations === void 0 ? void 0 : violations.filter(function (v) { return v.type === CONST_1.default.VIOLATION_TYPES.VIOLATION; }).length) !== null && _a !== void 0 ? _a : 0;
    var hasViolationsAndHold = violationsCount > 0 && isTransactionOnHold;
    var isTooLong = violationsCount > 1 || violationMessage.length > CONST_1.default.REPORT_VIOLATIONS.RBR_MESSAGE_MAX_CHARACTERS_FOR_PREVIEW;
    var hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;
    return isTooLong || hasViolationsAndHold || hasViolationsAndFieldErrors ? { translationPath: 'violations.reviewRequired' } : { text: violationMessage };
}
/**
 * Extracts unique error messages from report actions. If no report or actions are found,
 * it returns an empty array. It identifies the latest error in each action and filters out duplicates to
 * ensure only unique error messages are returned.
 */
function getUniqueActionErrors(reportActions) {
    var reportErrors = Object.values(reportActions).map(function (reportAction) {
        var _a, _b;
        var errors = (_a = reportAction.errors) !== null && _a !== void 0 ? _a : {};
        var key = (_b = Object.keys(errors).sort().reverse().at(0)) !== null && _b !== void 0 ? _b : '';
        var error = errors[key];
        return typeof error === 'string' ? error : '';
    });
    return __spreadArray([], new Set(reportErrors), true).filter(function (err) { return err.length; });
}
function getTransactionPreviewTextAndTranslationPaths(_a) {
    var _b, _c, _d;
    var iouReport = _a.iouReport, transaction = _a.transaction, action = _a.action, violations = _a.violations, transactionDetails = _a.transactionDetails, isBillSplit = _a.isBillSplit, shouldShowRBR = _a.shouldShowRBR, violationMessage = _a.violationMessage, reportActions = _a.reportActions;
    var isFetchingWaypoints = (0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction);
    var isTransactionOnHold = (0, TransactionUtils_1.isOnHold)(transaction);
    var isTransactionMadeWithCard = (0, TransactionUtils_1.isCardTransaction)(transaction);
    var isMoneyRequestSettled = (0, ReportUtils_1.isSettled)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    var isSettlementOrApprovalPartial = !!((_b = iouReport === null || iouReport === void 0 ? void 0 : iouReport.pendingFields) === null || _b === void 0 ? void 0 : _b.partial);
    var isPartialHold = isSettlementOrApprovalPartial && isTransactionOnHold;
    // We don't use isOnHold because it's true for duplicated transaction too and we only want to show hold message if the transaction is truly on hold
    var shouldShowHoldMessage = !(isMoneyRequestSettled && !isSettlementOrApprovalPartial) && !!((_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.hold);
    var showCashOrCard = { translationPath: isTransactionMadeWithCard ? 'iou.card' : 'iou.cash' };
    var isTransactionScanning = (0, TransactionUtils_1.isScanning)(transaction);
    var hasFieldErrors = (0, TransactionUtils_1.hasMissingSmartscanFields)(transaction);
    var hasViolationsOfTypeNotice = (0, TransactionUtils_1.hasNoticeTypeViolation)(transaction, violations, true) && (0, ReportUtils_1.isPaidGroupPolicy)(iouReport);
    var hasActionWithErrors = (0, ReportUtils_1.hasActionsWithErrors)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    var requestAmount = transactionDetails.amount, requestCurrency = transactionDetails.currency;
    var RBRMessage;
    if (!shouldShowRBR || !transaction) {
        RBRMessage = { text: '' };
    }
    if (shouldShowHoldMessage && RBRMessage === undefined) {
        RBRMessage = { translationPath: 'iou.expenseWasPutOnHold' };
    }
    var path = getViolationTranslatePath(violations, hasFieldErrors, violationMessage !== null && violationMessage !== void 0 ? violationMessage : '', isTransactionOnHold);
    if (path.translationPath === 'violations.reviewRequired' || (RBRMessage === undefined && violationMessage)) {
        RBRMessage = path;
    }
    if (hasFieldErrors && RBRMessage === undefined) {
        var merchantMissing = (0, TransactionUtils_1.isMerchantMissing)(transaction);
        var amountMissing = (0, TransactionUtils_1.isAmountMissing)(transaction);
        if (amountMissing && merchantMissing) {
            RBRMessage = { translationPath: 'violations.reviewRequired' };
        }
        else if (amountMissing) {
            RBRMessage = { translationPath: 'iou.missingAmount' };
        }
        else if (merchantMissing) {
            RBRMessage = { translationPath: 'iou.missingMerchant' };
        }
    }
    if (RBRMessage === undefined && hasActionWithErrors && !!reportActions) {
        var actionsWithErrors = getUniqueActionErrors(reportActions);
        RBRMessage = actionsWithErrors.length > 1 ? { translationPath: 'violations.reviewRequired' } : { text: actionsWithErrors.at(0) };
    }
    RBRMessage !== null && RBRMessage !== void 0 ? RBRMessage : (RBRMessage = { text: '' });
    var previewHeaderText = [showCashOrCard];
    if ((0, TransactionUtils_1.isDistanceRequest)(transaction)) {
        previewHeaderText = [{ translationPath: 'common.distance' }];
    }
    else if ((0, TransactionUtils_1.isPerDiemRequest)(transaction)) {
        previewHeaderText = [{ translationPath: 'common.perDiem' }];
    }
    else if (isTransactionScanning) {
        previewHeaderText = [{ translationPath: 'common.receipt' }];
    }
    else if (isBillSplit) {
        previewHeaderText = [{ translationPath: 'iou.split' }];
    }
    if (!(0, TransactionUtils_1.isCreatedMissing)(transaction)) {
        var created = (0, TransactionUtils_1.getFormattedCreated)(transaction);
        var date = DateUtils_1.default.formatWithUTCTimeZone(created, DateUtils_1.default.doesDateBelongToAPastYear(created) ? CONST_1.default.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST_1.default.DATE.MONTH_DAY_ABBR_FORMAT);
        previewHeaderText.unshift({ text: date }, dotSeparator);
    }
    if ((0, TransactionUtils_1.isPending)(transaction)) {
        previewHeaderText.push(dotSeparator, { translationPath: 'iou.pending' });
    }
    if ((0, TransactionUtils_1.hasPendingRTERViolation)(violations)) {
        previewHeaderText.push(dotSeparator, { translationPath: 'iou.pendingMatch' });
    }
    var isPreviewHeaderTextComplete = false;
    if (isMoneyRequestSettled && !(iouReport === null || iouReport === void 0 ? void 0 : iouReport.isCancelledIOU) && !isPartialHold) {
        previewHeaderText.push(dotSeparator, { translationPath: isTransactionMadeWithCard ? 'common.done' : 'iou.settledExpensify' });
        isPreviewHeaderTextComplete = true;
    }
    if (!isPreviewHeaderTextComplete) {
        if (hasViolationsOfTypeNotice && transaction && !(0, ReportUtils_1.isReportApproved)({ report: iouReport }) && !(0, ReportUtils_1.isSettled)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)) {
            previewHeaderText.push(dotSeparator, { translationPath: 'violations.reviewRequired' });
        }
        else if ((0, ReportUtils_1.isPaidGroupPolicyExpenseReport)(iouReport) && (0, ReportUtils_1.isReportApproved)({ report: iouReport }) && !(0, ReportUtils_1.isSettled)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID) && !isPartialHold) {
            previewHeaderText.push(dotSeparator, { translationPath: 'iou.approved' });
        }
        else if (iouReport === null || iouReport === void 0 ? void 0 : iouReport.isCancelledIOU) {
            previewHeaderText.push(dotSeparator, { translationPath: 'iou.canceled' });
        }
        else if (shouldShowHoldMessage) {
            previewHeaderText.push(dotSeparator, { translationPath: 'violations.hold' });
        }
    }
    var amount = isBillSplit ? (0, TransactionUtils_1.getAmount)((0, TransactionUtils_1.getOriginalTransactionWithSplitInfo)(transaction).originalTransaction) : requestAmount;
    var displayAmountText = isTransactionScanning ? { translationPath: 'iou.receiptStatusTitle' } : { text: (0, CurrencyUtils_1.convertToDisplayString)(amount, requestCurrency) };
    if (isFetchingWaypoints && !requestAmount) {
        displayAmountText = { translationPath: 'iou.fieldPending' };
    }
    var iouOriginalMessage = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) ? ((_d = (0, ReportActionsUtils_1.getOriginalMessage)(action)) !== null && _d !== void 0 ? _d : undefined) : undefined;
    var displayDeleteAmountText = { text: (0, CurrencyUtils_1.convertToDisplayString)(iouOriginalMessage === null || iouOriginalMessage === void 0 ? void 0 : iouOriginalMessage.amount, iouOriginalMessage === null || iouOriginalMessage === void 0 ? void 0 : iouOriginalMessage.currency) };
    return {
        RBRMessage: RBRMessage,
        displayAmountText: displayAmountText,
        displayDeleteAmountText: displayDeleteAmountText,
        previewHeaderText: previewHeaderText,
    };
}
function createTransactionPreviewConditionals(_a) {
    var _b, _c, _d;
    var iouReport = _a.iouReport, transaction = _a.transaction, action = _a.action, violations = _a.violations, transactionDetails = _a.transactionDetails, isBillSplit = _a.isBillSplit, isReportAPolicyExpenseChat = _a.isReportAPolicyExpenseChat, areThereDuplicates = _a.areThereDuplicates;
    var requestAmount = transactionDetails.amount, requestComment = transactionDetails.comment, merchant = transactionDetails.merchant, tag = transactionDetails.tag, category = transactionDetails.category;
    var requestMerchant = (0, truncate_1.default)(merchant, { length: CONST_1.default.REQUEST_PREVIEW.MAX_LENGTH });
    var description = (0, truncate_1.default)(StringUtils_1.default.lineBreaksToSpaces(requestComment), { length: CONST_1.default.REQUEST_PREVIEW.MAX_LENGTH });
    var isMoneyRequestSettled = (0, ReportUtils_1.isSettled)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    var isApproved = (0, ReportUtils_1.isReportApproved)({ report: iouReport });
    var isSettlementOrApprovalPartial = !!((_b = iouReport === null || iouReport === void 0 ? void 0 : iouReport.pendingFields) === null || _b === void 0 ? void 0 : _b.partial);
    var hasViolationsOfTypeNotice = (0, TransactionUtils_1.hasNoticeTypeViolation)(transaction, violations, true) && iouReport && (0, ReportUtils_1.isPaidGroupPolicy)(iouReport);
    var hasFieldErrors = (0, TransactionUtils_1.hasMissingSmartscanFields)(transaction);
    var isFetchingWaypoints = (0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction);
    var isTransactionOnHold = (0, TransactionUtils_1.isOnHold)(transaction);
    var isFullySettled = isMoneyRequestSettled && !isSettlementOrApprovalPartial;
    var isFullyApproved = isApproved && !isSettlementOrApprovalPartial;
    var shouldShowSkeleton = (0, EmptyObject_1.isEmptyObject)(transaction) && !(0, ReportActionsUtils_1.isMessageDeleted)(action) && (action === null || action === void 0 ? void 0 : action.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    var shouldShowTag = !!tag && isReportAPolicyExpenseChat;
    var categoryForDisplay = (0, CategoryUtils_1.isCategoryMissing)(category) ? '' : category;
    var shouldShowCategory = !!categoryForDisplay && isReportAPolicyExpenseChat;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var hasAnyViolations = hasViolationsOfTypeNotice || (0, TransactionUtils_1.hasWarningTypeViolation)(transaction, violations, true) || (0, TransactionUtils_1.hasViolation)(transaction, violations, true);
    var hasErrorOrOnHold = hasFieldErrors || (!isFullySettled && !isFullyApproved && isTransactionOnHold);
    var hasReportViolationsOrActionErrors = ((0, ReportUtils_1.isReportOwner)(iouReport) && (0, ReportUtils_1.hasReportViolations)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)) || (0, ReportUtils_1.hasActionsWithErrors)(iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID);
    var shouldShowRBR = hasAnyViolations || hasErrorOrOnHold || hasReportViolationsOrActionErrors;
    // When there are no settled transactions in duplicates, show the "Keep this one" button
    var shouldShowKeepButton = areThereDuplicates;
    var participantAccountIDs = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) && isBillSplit ? ((_d = (_c = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _c === void 0 ? void 0 : _c.participantAccountIDs) !== null && _d !== void 0 ? _d : []) : [];
    var shouldShowSplitShare = isBillSplit && !!requestAmount && requestAmount > 0 && participantAccountIDs.includes((0, Report_1.getCurrentUserAccountID)());
    /*
 Show the merchant for IOUs and expenses only if:
 - the merchant is not empty, is custom, or is not related to scanning smartscan;
 - the expense is not a distance expense with a pending route and amount = 0 - in this case,
   the merchant says: "Route pending...", which is already shown in the amount field;
*/
    var shouldShowMerchant = !!requestMerchant &&
        requestMerchant !== CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT &&
        requestMerchant !== CONST_1.default.TRANSACTION.DEFAULT_MERCHANT &&
        !(isFetchingWaypoints && !requestAmount);
    var shouldShowDescription = !!description && !shouldShowMerchant && !(0, TransactionUtils_1.isScanning)(transaction);
    return {
        shouldShowSkeleton: shouldShowSkeleton,
        shouldShowTag: shouldShowTag,
        shouldShowRBR: shouldShowRBR,
        shouldShowCategory: shouldShowCategory,
        shouldShowKeepButton: shouldShowKeepButton,
        shouldShowSplitShare: shouldShowSplitShare,
        shouldShowMerchant: shouldShowMerchant,
        shouldShowDescription: shouldShowDescription,
    };
}
