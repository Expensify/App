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
Object.defineProperty(exports, "__esModule", { value: true });
var mapValues_1 = require("lodash/mapValues");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ReceiptAudit_1 = require("@components/ReceiptAudit");
var ReceiptEmptyState_1 = require("@components/ReceiptEmptyState");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var ViolationMessages_1 = require("@components/ViolationMessages");
var useActiveRoute_1 = require("@hooks/useActiveRoute");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var useViolations_1 = require("@hooks/useViolations");
var CardUtils_1 = require("@libs/CardUtils");
var CategoryUtils_1 = require("@libs/CategoryUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReceiptUtils_1 = require("@libs/ReceiptUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TagsOptionsListUtils_1 = require("@libs/TagsOptionsListUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var ViolationsUtils_1 = require("@libs/Violations/ViolationsUtils");
var Navigation_1 = require("@navigation/Navigation");
var AnimatedEmptyStateBackground_1 = require("@pages/home/report/AnimatedEmptyStateBackground");
var IOU_1 = require("@userActions/IOU");
var Report_1 = require("@userActions/Report");
var ReportActions_1 = require("@userActions/ReportActions");
var Transaction_1 = require("@userActions/Transaction");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ReportActionItemImage_1 = require("./ReportActionItemImage");
var receiptImageViolationNames = [
    CONST_1.default.VIOLATIONS.RECEIPT_REQUIRED,
    CONST_1.default.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
    CONST_1.default.VIOLATIONS.CASH_EXPENSE_WITH_NO_RECEIPT,
    CONST_1.default.VIOLATIONS.SMARTSCAN_FAILED,
    CONST_1.default.VIOLATIONS.PROHIBITED_EXPENSE,
    CONST_1.default.VIOLATIONS.RECEIPT_GENERATED_WITH_AI,
];
var receiptFieldViolationNames = [CONST_1.default.VIOLATIONS.MODIFIED_AMOUNT, CONST_1.default.VIOLATIONS.MODIFIED_DATE];
function MoneyRequestView(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var report = _a.report, shouldShowAnimatedBackground = _a.shouldShowAnimatedBackground, _q = _a.readonly, readonly = _q === void 0 ? false : _q, updatedTransaction = _a.updatedTransaction, _r = _a.isFromReviewDuplicates, isFromReviewDuplicates = _r === void 0 ? false : _r;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _s = (0, useLocalize_1.default)(), translate = _s.translate, toLocaleDigit = _s.toLocaleDigit;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var getReportRHPActiveRoute = (0, useActiveRoute_1.default)().getReportRHPActiveRoute;
    var parentReportID = report === null || report === void 0 ? void 0 : report.parentReportID;
    var policyID = report === null || report === void 0 ? void 0 : report.policyID;
    var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID), { canBeMissing: true })[0];
    var chatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.parentReportID), {
        selector: function (chatReportValue) { return chatReportValue && { reportID: chatReportValue.reportID, errorFields: chatReportValue.errorFields }; },
        canBeMissing: true,
    })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true })[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID), { canBeMissing: true })[0];
    var transactionReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.reportID), { canBeMissing: true })[0];
    var targetPolicyID = (updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.reportID) ? transactionReport === null || transactionReport === void 0 ? void 0 : transactionReport.policyID : policyID;
    var policyTagList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(targetPolicyID), { canBeMissing: true })[0];
    var cardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var parentReportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID), {
        canEvict: false,
        canBeMissing: true,
    })[0];
    var parentReportAction = (report === null || report === void 0 ? void 0 : report.parentReportActionID) ? parentReportActions === null || parentReportActions === void 0 ? void 0 : parentReportActions[report.parentReportActionID] : undefined;
    var isTrackExpense = (0, ReportUtils_1.isTrackExpenseReport)(report);
    var moneyRequestReport = parentReport;
    var linkedTransactionID = (0, react_1.useMemo)(function () {
        if (!parentReportAction) {
            return undefined;
        }
        var originalMessage = parentReportAction && (0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportAction) ? (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction) : undefined;
        return originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUTransactionID;
    }, [parentReportAction]);
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(linkedTransactionID), { canBeMissing: true })[0];
    var transactionBackup = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_BACKUP).concat(linkedTransactionID), { canBeMissing: true })[0];
    var transactionViolations = (0, useTransactionViolations_1.default)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
    var allowNegativeAmount = (0, ReportUtils_1.shouldEnableNegative)(report, policy);
    var _t = (0, react_1.useMemo)(function () { var _a; return (_a = (0, ReportUtils_1.getTransactionDetails)(transaction, undefined, undefined, allowNegativeAmount)) !== null && _a !== void 0 ? _a : {}; }, [allowNegativeAmount, transaction]), transactionDate = _t.created, transactionAmount = _t.amount, transactionAttendees = _t.attendees, transactionTaxAmount = _t.taxAmount, transactionCurrency = _t.currency, transactionDescription = _t.comment, transactionMerchant = _t.merchant, transactionBillable = _t.billable, transactionCategory = _t.category, transactionTag = _t.tag, transactionOriginalAmount = _t.originalAmount, transactionOriginalCurrency = _t.originalCurrency, transactionPostedDate = _t.postedDate;
    var isEmptyMerchant = transactionMerchant === '' || transactionMerchant === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    var isDistanceRequest = (0, TransactionUtils_1.isDistanceRequest)(transaction);
    var isPerDiemRequest = (0, TransactionUtils_1.isPerDiemRequest)(transaction);
    var hasReceipt = (0, TransactionUtils_1.hasReceipt)(updatedTransaction !== null && updatedTransaction !== void 0 ? updatedTransaction : transaction);
    var isTransactionScanning = (0, TransactionUtils_1.isScanning)(updatedTransaction !== null && updatedTransaction !== void 0 ? updatedTransaction : transaction);
    var didReceiptScanSucceed = hasReceipt && (0, TransactionUtils_1.didReceiptScanSucceed)(transaction);
    var hasRoute = (0, TransactionUtils_1.hasRoute)(transactionBackup !== null && transactionBackup !== void 0 ? transactionBackup : transaction, isDistanceRequest);
    var shouldDisplayTransactionAmount = ((isDistanceRequest && hasRoute) || !!transactionAmount) && transactionAmount !== undefined;
    var formattedTransactionAmount = shouldDisplayTransactionAmount ? (0, CurrencyUtils_1.convertToDisplayString)(transactionAmount, transactionCurrency) : '';
    var formattedPerAttendeeAmount = shouldDisplayTransactionAmount && ((hasReceipt && !isTransactionScanning && didReceiptScanSucceed) || isPerDiemRequest)
        ? (0, CurrencyUtils_1.convertToDisplayString)(transactionAmount / ((_b = transactionAttendees === null || transactionAttendees === void 0 ? void 0 : transactionAttendees.length) !== null && _b !== void 0 ? _b : 1), transactionCurrency)
        : '';
    var formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && (0, CurrencyUtils_1.convertToDisplayString)(transactionOriginalAmount, transactionOriginalCurrency);
    var isCardTransaction = (0, TransactionUtils_1.isCardTransaction)(transaction);
    var cardProgramName = (0, CardUtils_1.getCompanyCardDescription)(transaction === null || transaction === void 0 ? void 0 : transaction.cardName, transaction === null || transaction === void 0 ? void 0 : transaction.cardID, cardList);
    var shouldShowCard = isCardTransaction && cardProgramName;
    var isApproved = (0, ReportUtils_1.isReportApproved)({ report: moneyRequestReport });
    var isInvoice = (0, ReportUtils_1.isInvoiceReport)(moneyRequestReport);
    var isPaidReport = (0, ReportActionsUtils_1.isPayAction)(parentReportAction);
    var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
    var formattedTaxAmount = (updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.taxAmount)
        ? (0, CurrencyUtils_1.convertToDisplayString)(Math.abs(updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.taxAmount), transactionCurrency)
        : (0, CurrencyUtils_1.convertToDisplayString)(Math.abs(transactionTaxAmount !== null && transactionTaxAmount !== void 0 ? transactionTaxAmount : 0), transactionCurrency);
    var taxRatesDescription = taxRates === null || taxRates === void 0 ? void 0 : taxRates.name;
    var taxRateTitle = updatedTransaction ? (0, TransactionUtils_1.getTaxName)(policy, updatedTransaction) : (0, TransactionUtils_1.getTaxName)(policy, transaction);
    var isSettled = (0, ReportUtils_1.isSettled)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
    var isCancelled = moneyRequestReport && (moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.isCancelledIOU);
    // Flags for allowing or disallowing editing an expense
    // Used for non-restricted fields such as: description, category, tag, billable, etc...
    var canUserPerformWriteAction = !!(0, ReportUtils_1.canUserPerformWriteAction)(report) && !readonly;
    var canEdit = (0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportAction) && (0, ReportUtils_1.canEditMoneyRequest)(parentReportAction, transaction) && canUserPerformWriteAction;
    var canEditTaxFields = canEdit && !isDistanceRequest;
    var canEditAmount = canUserPerformWriteAction && (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.AMOUNT);
    var canEditMerchant = canUserPerformWriteAction && (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.MERCHANT);
    var canEditDate = canUserPerformWriteAction && (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.DATE);
    var canEditReceipt = canUserPerformWriteAction && (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.RECEIPT);
    var canEditDistance = canUserPerformWriteAction && (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.DISTANCE);
    var canEditDistanceRate = canUserPerformWriteAction && (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.DISTANCE_RATE);
    var canEditReport = canUserPerformWriteAction && (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.REPORT);
    // A flag for verifying that the current report is a sub-report of a expense chat
    // if the policy of the report is either Collect or Control, then this report must be tied to expense chat
    var isPolicyExpenseChat = (0, ReportUtils_1.isReportInGroupPolicy)(report);
    var policyTagLists = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getTagLists)(policyTagList); }, [policyTagList]);
    var iouType = (0, react_1.useMemo)(function () {
        if (isTrackExpense) {
            return CONST_1.default.IOU.TYPE.TRACK;
        }
        if (isInvoice) {
            return CONST_1.default.IOU.TYPE.INVOICE;
        }
        return CONST_1.default.IOU.TYPE.SUBMIT;
    }, [isTrackExpense, isInvoice]);
    var category = transactionCategory !== null && transactionCategory !== void 0 ? transactionCategory : '';
    var categoryForDisplay = (0, CategoryUtils_1.isCategoryMissing)(category) ? '' : category;
    // Flags for showing categories and tags
    // transactionCategory can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var shouldShowCategory = isPolicyExpenseChat && (categoryForDisplay || (0, OptionsListUtils_1.hasEnabledOptions)(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var shouldShowTag = isPolicyExpenseChat && (transactionTag || (0, TagsOptionsListUtils_1.hasEnabledTags)(policyTagLists));
    var shouldShowBillable = isPolicyExpenseChat && (!!transactionBillable || !((_d = (_c = policy === null || policy === void 0 ? void 0 : policy.disabledFields) === null || _c === void 0 ? void 0 : _c.defaultBillable) !== null && _d !== void 0 ? _d : true) || !!(updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.billable));
    var shouldShowAttendees = (0, react_1.useMemo)(function () { return (0, TransactionUtils_1.shouldShowAttendees)(iouType, policy); }, [iouType, policy]);
    var shouldShowTax = (0, PolicyUtils_1.isTaxTrackingEnabled)(isPolicyExpenseChat, policy, isDistanceRequest, isPerDiemRequest);
    var tripID = (0, ReportUtils_1.getTripIDFromTransactionParentReportID)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.parentReportID);
    var shouldShowViewTripDetails = (0, TransactionUtils_1.hasReservationList)(transaction) && !!tripID;
    var getViolationsForField = (0, useViolations_1.default)(transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : [], isTransactionScanning || !(0, ReportUtils_1.isPaidGroupPolicy)(report)).getViolationsForField;
    var hasViolations = (0, react_1.useCallback)(function (field, data, policyHasDependentTags, tagValue) {
        if (policyHasDependentTags === void 0) { policyHasDependentTags = false; }
        return getViolationsForField(field, data, policyHasDependentTags, tagValue).length > 0;
    }, [getViolationsForField]);
    var amountDescription = "".concat(translate('iou.amount'));
    var dateDescription = "".concat(translate('common.date'));
    var _u = DistanceRequestUtils_1.default.getRate({ transaction: transaction, policy: policy }), unit = _u.unit, rate = _u.rate;
    var distance = (0, TransactionUtils_1.getDistanceInMeters)(transactionBackup !== null && transactionBackup !== void 0 ? transactionBackup : transaction, unit);
    var currency = transactionCurrency !== null && transactionCurrency !== void 0 ? transactionCurrency : CONST_1.default.CURRENCY.USD;
    var isCustomUnitOutOfPolicy = transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY; });
    var rateToDisplay = isCustomUnitOutOfPolicy ? translate('common.rateOutOfPolicy') : DistanceRequestUtils_1.default.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline);
    var distanceToDisplay = DistanceRequestUtils_1.default.getDistanceForDisplay(hasRoute, distance, unit, rate, translate);
    var merchantTitle = isEmptyMerchant ? '' : transactionMerchant;
    var amountTitle = formattedTransactionAmount ? formattedTransactionAmount.toString() : '';
    if (isTransactionScanning) {
        merchantTitle = translate('iou.receiptStatusTitle');
        amountTitle = translate('iou.receiptStatusTitle');
    }
    var updatedTransactionDescription = (0, react_1.useMemo)(function () {
        if (!updatedTransaction) {
            return undefined;
        }
        return (0, TransactionUtils_1.getDescription)(updatedTransaction !== null && updatedTransaction !== void 0 ? updatedTransaction : null);
    }, [updatedTransaction]);
    var isEmptyUpdatedMerchant = (updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.modifiedMerchant) === '' || (updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.modifiedMerchant) === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    var updatedMerchantTitle = isEmptyUpdatedMerchant ? '' : ((_e = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.modifiedMerchant) !== null && _e !== void 0 ? _e : merchantTitle);
    var saveBillable = (0, react_1.useCallback)(function (newBillable) {
        // If the value hasn't changed, don't request to save changes on the server and just close the modal
        if (newBillable === (0, TransactionUtils_1.getBillable)(transaction) || !(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
            return;
        }
        (0, IOU_1.updateMoneyRequestBillable)(transaction.transactionID, report === null || report === void 0 ? void 0 : report.reportID, newBillable, policy, policyTagList, policyCategories);
    }, [transaction, report, policy, policyTagList, policyCategories]);
    if (isCardTransaction) {
        if (transactionPostedDate) {
            dateDescription += " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.posted'), " ").concat(transactionPostedDate);
        }
        if (formattedOriginalAmount) {
            amountDescription += " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.original'), " ").concat(formattedOriginalAmount);
        }
        if (isCancelled) {
            amountDescription += " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.canceled'));
        }
    }
    else {
        if (!isDistanceRequest && !isPerDiemRequest) {
            amountDescription += " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.cash'));
        }
        if ((0, TransactionUtils_1.getOriginalTransactionWithSplitInfo)(transaction).isExpenseSplit) {
            amountDescription += " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.split'));
        }
        if (isCancelled) {
            amountDescription += " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.canceled'));
        }
        else if (isApproved) {
            amountDescription += " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.approved'));
        }
        else if (isSettled) {
            amountDescription += " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('iou.settledExpensify'));
        }
    }
    var receiptURIs;
    var hasErrors = (0, TransactionUtils_1.hasMissingSmartscanFields)(transaction);
    if (hasReceipt) {
        receiptURIs = (0, ReceiptUtils_1.getThumbnailAndImageURIs)(updatedTransaction !== null && updatedTransaction !== void 0 ? updatedTransaction : transaction);
    }
    var pendingAction = transaction === null || transaction === void 0 ? void 0 : transaction.pendingAction;
    // Need to return undefined when we have pendingAction to avoid the duplicate pending action
    var getPendingFieldAction = function (fieldPath) { var _a; return (pendingAction ? undefined : (_a = transaction === null || transaction === void 0 ? void 0 : transaction.pendingFields) === null || _a === void 0 ? void 0 : _a[fieldPath]); };
    var getErrorForField = (0, react_1.useCallback)(function (field, data, policyHasDependentTags, tagValue) {
        var _a;
        if (policyHasDependentTags === void 0) { policyHasDependentTags = false; }
        // Checks applied when creating a new expense
        // NOTE: receipt field can return multiple violations, so we need to handle it separately
        var fieldChecks = {
            amount: {
                isError: transactionAmount === 0,
                translationPath: canEditAmount ? 'common.error.enterAmount' : 'common.error.missingAmount',
            },
            merchant: {
                isError: !isSettled && !isCancelled && isPolicyExpenseChat && isEmptyMerchant,
                translationPath: canEditMerchant ? 'common.error.enterMerchant' : 'common.error.missingMerchantName',
            },
            date: {
                isError: transactionDate === '',
                translationPath: canEditDate ? 'common.error.enterDate' : 'common.error.missingDate',
            },
        };
        var _b = (_a = fieldChecks[field]) !== null && _a !== void 0 ? _a : {}, isError = _b.isError, translationPath = _b.translationPath;
        if (readonly) {
            return '';
        }
        // Return form errors if there are any
        if (hasErrors && isError && translationPath) {
            return translate(translationPath);
        }
        // Return violations if there are any
        if (field !== 'merchant' && hasViolations(field, data, policyHasDependentTags, tagValue)) {
            var violations = getViolationsForField(field, data, policyHasDependentTags, tagValue);
            var firstViolation = violations.at(0);
            if (firstViolation) {
                return ViolationsUtils_1.default.getViolationTranslation(firstViolation, translate, canEdit);
            }
        }
        return '';
    }, [
        transactionAmount,
        isSettled,
        isCancelled,
        isPolicyExpenseChat,
        isEmptyMerchant,
        transactionDate,
        readonly,
        hasErrors,
        hasViolations,
        translate,
        getViolationsForField,
        canEditAmount,
        canEditDate,
        canEditMerchant,
        canEdit,
    ]);
    var distanceRequestFields = (<>
            <OfflineWithFeedback_1.default pendingAction={(_f = getPendingFieldAction('waypoints')) !== null && _f !== void 0 ? _f : getPendingFieldAction('merchant')}>
                <MenuItemWithTopDescription_1.default description={translate('common.distance')} title={distanceToDisplay} interactive={canEditDistance} shouldShowRightIcon={canEditDistance} titleStyle={styles.flex1} onPress={function () {
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
        }} copyValue={!canEditDistance ? distanceToDisplay : undefined}/>
            </OfflineWithFeedback_1.default>
            <OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('customUnitRateID')}>
                <MenuItemWithTopDescription_1.default description={translate('common.rate')} title={rateToDisplay} interactive={canEditDistanceRate} shouldShowRightIcon={canEditDistanceRate} titleStyle={styles.flex1} onPress={function () {
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
        }} brickRoadIndicator={getErrorForField('customUnitRateID') ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={getErrorForField('customUnitRateID')} copyValue={!canEditDistanceRate ? rateToDisplay : undefined}/>
            </OfflineWithFeedback_1.default>
        </>);
    var isReceiptAllowed = !isPaidReport && !isInvoice;
    var shouldShowReceiptEmptyState = isReceiptAllowed && !hasReceipt;
    var _v = (0, react_1.useMemo)(function () {
        var imageViolations = [];
        var allViolations = [];
        for (var _i = 0, _a = transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : []; _i < _a.length; _i++) {
            var violation = _a[_i];
            var isReceiptFieldViolation = receiptFieldViolationNames.includes(violation.name);
            var isReceiptImageViolation = receiptImageViolationNames.includes(violation.name);
            if (isReceiptFieldViolation || isReceiptImageViolation) {
                var violationMessage = ViolationsUtils_1.default.getViolationTranslation(violation, translate, canEdit);
                allViolations.push(violationMessage);
                if (isReceiptImageViolation) {
                    imageViolations.push(violationMessage);
                }
            }
        }
        return [imageViolations, allViolations];
    }, [transactionViolations, translate, canEdit]), receiptImageViolations = _v[0], receiptViolations = _v[1];
    var receiptRequiredViolation = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.RECEIPT_REQUIRED; });
    var customRulesViolation = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.CUSTOM_RULES; });
    // Whether to show receipt audit result (e.g.`Verified`, `Issue Found`) and messages (e.g. `Receipt not verified. Please confirm accuracy.`)
    // `!!(receiptViolations.length || didReceiptScanSucceed)` is for not showing `Verified` when `receiptViolations` is empty and `didReceiptScanSucceed` is false.
    var shouldShowAuditMessage = !isTransactionScanning && (hasReceipt || !!receiptRequiredViolation || !!customRulesViolation) && !!(receiptViolations.length || didReceiptScanSucceed) && (0, ReportUtils_1.isPaidGroupPolicy)(report);
    var shouldShowReceiptAudit = isReceiptAllowed && (shouldShowReceiptEmptyState || hasReceipt);
    var errors = __assign(__assign({}, ((_k = (_h = (_g = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _g === void 0 ? void 0 : _g.route) !== null && _h !== void 0 ? _h : (_j = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _j === void 0 ? void 0 : _j.waypoints) !== null && _k !== void 0 ? _k : transaction === null || transaction === void 0 ? void 0 : transaction.errors)), parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.errors);
    var tagList = policyTagLists.map(function (_a, index) {
        var name = _a.name, orderWeight = _a.orderWeight, tags = _a.tags;
        var tagForDisplay = (0, TransactionUtils_1.getTagForDisplay)(updatedTransaction !== null && updatedTransaction !== void 0 ? updatedTransaction : transaction, index);
        var shouldShow = false;
        if ((0, PolicyUtils_1.hasDependentTags)(policy, policyTagList)) {
            if (index === 0) {
                shouldShow = true;
            }
            else {
                var prevTagValue = (0, TransactionUtils_1.getTagForDisplay)(transaction, index - 1);
                shouldShow = !!prevTagValue;
            }
        }
        else {
            shouldShow = !!tagForDisplay || (0, OptionsListUtils_1.hasEnabledOptions)(tags);
        }
        if (!shouldShow) {
            return null;
        }
        var tagError = getErrorForField('tag', {
            tagListIndex: index,
            tagListName: name,
        }, (0, PolicyUtils_1.hasDependentTags)(policy, policyTagList), tagForDisplay);
        return (<OfflineWithFeedback_1.default key={name} pendingAction={getPendingFieldAction('tag')}>
                <MenuItemWithTopDescription_1.default highlighted={shouldShow && !(0, TransactionUtils_1.getTagForDisplay)(transaction, index)} description={name !== null && name !== void 0 ? name : translate('common.tag')} title={tagForDisplay} numberOfLinesTitle={2} interactive={canEdit} shouldShowRightIcon={canEdit} titleStyle={styles.flex1} onPress={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TAG.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, orderWeight, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
            }} brickRoadIndicator={tagError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={tagError} shouldShowBasicTitle shouldShowDescriptionOnTop/>
            </OfflineWithFeedback_1.default>);
    });
    var _w = (0, react_1.useState)(false), showConfirmDismissReceiptError = _w[0], setShowConfirmDismissReceiptError = _w[1];
    var dismissReceiptError = (0, react_1.useCallback)(function () {
        var _a;
        if (!(report === null || report === void 0 ? void 0 : report.reportID)) {
            return;
        }
        if ((transaction === null || transaction === void 0 ? void 0 : transaction.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            if ((chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID) && (0, ReportUtils_1.getCreationReportErrors)(chatReport)) {
                (0, Report_1.navigateToConciergeChatAndDeleteReport)(chatReport.reportID, true, true);
                return;
            }
            if (parentReportAction) {
                (0, IOU_1.cleanUpMoneyRequest)((_a = transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) !== null && _a !== void 0 ? _a : linkedTransactionID, parentReportAction, report.reportID, true);
                return;
            }
        }
        if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)) {
            if (!linkedTransactionID) {
                return;
            }
            (0, Transaction_1.clearError)(linkedTransactionID);
            (0, ReportActions_1.clearAllRelatedReportActionErrors)(report.reportID, parentReportAction);
            return;
        }
        (0, Transaction_1.revert)(transaction, (0, Transaction_1.getLastModifiedExpense)(report === null || report === void 0 ? void 0 : report.reportID));
        (0, Transaction_1.clearError)(transaction.transactionID);
        (0, ReportActions_1.clearAllRelatedReportActionErrors)(report.reportID, parentReportAction);
    }, [transaction, chatReport, parentReportAction, linkedTransactionID, report === null || report === void 0 ? void 0 : report.reportID]);
    var receiptStyle = shouldUseNarrowLayout ? styles.expenseViewImageSmall : styles.expenseViewImage;
    return (<react_native_1.View style={styles.pRelative}>
            {shouldShowAnimatedBackground && <AnimatedEmptyStateBackground_1.default />}
            <>
                {shouldShowReceiptAudit && (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('receipt')}>
                        <ReceiptAudit_1.default notes={receiptViolations} shouldShowAuditResult={!!shouldShowAuditMessage}/>
                    </OfflineWithFeedback_1.default>)}
                {shouldShowReceiptEmptyState && (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('receipt')} style={styles.mv3}>
                        <ReceiptEmptyState_1.default disabled={!canEditReceipt} onPress={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SCAN.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
            }} isThumbnail={!canEditReceipt} isInMoneyRequestView style={receiptStyle}/>
                    </OfflineWithFeedback_1.default>)}
                {(hasReceipt || !!errors) && (<OfflineWithFeedback_1.default pendingAction={isDistanceRequest ? getPendingFieldAction('waypoints') : getPendingFieldAction('receipt')} errors={errors} errorRowStyles={[styles.mh4]} onClose={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) && !linkedTransactionID) {
                    return;
                }
                var errorEntries = Object.entries(errors !== null && errors !== void 0 ? errors : {});
                var errorMessages = (0, mapValues_1.default)(Object.fromEntries(errorEntries), function (error) { return error; });
                var hasReceiptError = Object.values(errorMessages).some(function (error) { return (0, ErrorUtils_1.isReceiptError)(error); });
                if (hasReceiptError) {
                    setShowConfirmDismissReceiptError(true);
                }
                else {
                    dismissReceiptError();
                }
            }} dismissError={dismissReceiptError} style={styles.mv3}>
                        {hasReceipt && (<react_native_1.View style={[styles.moneyRequestViewImage, receiptStyle]}>
                                <ReportActionItemImage_1.default thumbnail={receiptURIs === null || receiptURIs === void 0 ? void 0 : receiptURIs.thumbnail} fileExtension={receiptURIs === null || receiptURIs === void 0 ? void 0 : receiptURIs.fileExtension} isThumbnail={receiptURIs === null || receiptURIs === void 0 ? void 0 : receiptURIs.isThumbnail} image={receiptURIs === null || receiptURIs === void 0 ? void 0 : receiptURIs.image} isLocalFile={receiptURIs === null || receiptURIs === void 0 ? void 0 : receiptURIs.isLocalFile} filename={receiptURIs === null || receiptURIs === void 0 ? void 0 : receiptURIs.filename} transaction={updatedTransaction !== null && updatedTransaction !== void 0 ? updatedTransaction : transaction} enablePreviewModal readonly={readonly || !canEditReceipt} isFromReviewDuplicates={isFromReviewDuplicates}/>
                            </react_native_1.View>)}
                    </OfflineWithFeedback_1.default>)}
                {!shouldShowReceiptEmptyState && !hasReceipt && <react_native_1.View style={{ marginVertical: 6 }}/>}
                {!!shouldShowAuditMessage && <ReceiptAudit_1.ReceiptAuditMessages notes={receiptImageViolations}/>}
                <OfflineWithFeedback_1.default pendingAction={(_l = getPendingFieldAction('amount')) !== null && _l !== void 0 ? _l : (amountTitle ? getPendingFieldAction('customUnitRateID') : undefined)}>
                    <MenuItemWithTopDescription_1.default title={amountTitle} shouldShowTitleIcon={isSettled} titleIcon={Expensicons.Checkmark} description={amountDescription} titleStyle={styles.textHeadlineH2} interactive={canEditAmount} shouldShowRightIcon={canEditAmount} onPress={function () {
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_AMOUNT.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, '', getReportRHPActiveRoute()));
        }} brickRoadIndicator={getErrorForField('amount') ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={getErrorForField('amount')}/>
                </OfflineWithFeedback_1.default>
                <OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('comment')}>
                    <MenuItemWithTopDescription_1.default description={translate('common.description')} shouldRenderAsHTML title={updatedTransactionDescription !== null && updatedTransactionDescription !== void 0 ? updatedTransactionDescription : transactionDescription} interactive={canEdit} shouldShowRightIcon={canEdit} titleStyle={styles.flex1} onPress={function () {
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
        }} wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]} brickRoadIndicator={getErrorForField('comment') ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={getErrorForField('comment')} numberOfLinesTitle={0}/>
                </OfflineWithFeedback_1.default>
                {isDistanceRequest && ((_m = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _m === void 0 ? void 0 : _m.waypoints) ? (distanceRequestFields) : (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('merchant')}>
                        <MenuItemWithTopDescription_1.default description={translate('common.merchant')} title={updatedMerchantTitle} interactive={canEditMerchant} shouldShowRightIcon={canEditMerchant} titleStyle={styles.flex1} onPress={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_MERCHANT.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
            }} wrapperStyle={[styles.taskDescriptionMenuItem]} brickRoadIndicator={getErrorForField('merchant') ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={getErrorForField('merchant')} numberOfLinesTitle={0} copyValue={!canEditMerchant ? updatedMerchantTitle : undefined}/>
                    </OfflineWithFeedback_1.default>)}
                <OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('created')}>
                    <MenuItemWithTopDescription_1.default description={dateDescription} title={transactionDate} interactive={canEditDate} shouldShowRightIcon={canEditDate} titleStyle={styles.flex1} onPress={function () {
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DATE.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
        }} brickRoadIndicator={getErrorForField('date') ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={getErrorForField('date')} copyValue={!canEditDate ? transactionDate : undefined}/>
                </OfflineWithFeedback_1.default>
                {!!shouldShowCategory && (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('category')}>
                        <MenuItemWithTopDescription_1.default description={translate('common.category')} title={(_o = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.category) !== null && _o !== void 0 ? _o : categoryForDisplay} numberOfLinesTitle={2} interactive={canEdit} shouldShowRightIcon={canEdit} titleStyle={styles.flex1} onPress={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
            }} brickRoadIndicator={getErrorForField('category') ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={getErrorForField('category')}/>
                    </OfflineWithFeedback_1.default>)}
                {shouldShowTag && tagList}
                {!!shouldShowCard && (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('cardID')}>
                        <MenuItemWithTopDescription_1.default description={translate('iou.card')} title={cardProgramName} titleStyle={styles.flex1} interactive={false}/>
                    </OfflineWithFeedback_1.default>)}
                {shouldShowTax && (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('taxCode')}>
                        <MenuItemWithTopDescription_1.default title={taxRateTitle !== null && taxRateTitle !== void 0 ? taxRateTitle : ''} description={taxRatesDescription} interactive={canEditTaxFields} shouldShowRightIcon={canEditTaxFields} titleStyle={styles.flex1} onPress={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TAX_RATE.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
            }} brickRoadIndicator={getErrorForField('tax') ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={getErrorForField('tax')}/>
                    </OfflineWithFeedback_1.default>)}
                {shouldShowTax && (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('taxAmount')}>
                        <MenuItemWithTopDescription_1.default title={formattedTaxAmount ? formattedTaxAmount.toString() : ''} description={translate('iou.taxAmount')} interactive={canEditTaxFields} shouldShowRightIcon={canEditTaxFields} titleStyle={styles.flex1} onPress={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
            }}/>
                    </OfflineWithFeedback_1.default>)}
                {shouldShowAttendees && (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('attendees')}>
                        <MenuItemWithTopDescription_1.default key="attendees" title={Array.isArray(transactionAttendees) ? transactionAttendees.map(function (item) { var _a; return (_a = item === null || item === void 0 ? void 0 : item.displayName) !== null && _a !== void 0 ? _a : item === null || item === void 0 ? void 0 : item.login; }).join(', ') : ''} description={"".concat(translate('iou.attendees'), " ").concat(Array.isArray(transactionAttendees) && transactionAttendees.length > 1 && formattedPerAttendeeAmount
                ? "".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(formattedPerAttendeeAmount, " ").concat(translate('common.perPerson'))
                : '')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_ATTENDEE.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction.transactionID, report.reportID));
            }} interactive={canEdit} shouldShowRightIcon={canEdit} shouldRenderAsHTML/>
                    </OfflineWithFeedback_1.default>)}
                {!!parentReportID && (<OfflineWithFeedback_1.default pendingAction={getPendingFieldAction('reportID')}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon={canEditReport} title={(0, ReportUtils_1.getReportName)(parentReport) || (parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportName)} description={translate('common.report')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={function () {
                if (!canEditReport || !(report === null || report === void 0 ? void 0 : report.reportID) || !(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_REPORT.getRoute(CONST_1.default.IOU.ACTION.EDIT, iouType, transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, report.reportID, getReportRHPActiveRoute()));
            }} interactive={canEditReport} shouldRenderAsHTML/>
                    </OfflineWithFeedback_1.default>)}
                {/* Note: "Billable" toggle and "View trip details" should be always the last two items */}
                {shouldShowBillable && (<react_native_1.View style={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}>
                        <react_native_1.View>
                            <Text_1.default>{translate('common.billable')}</Text_1.default>
                            {!!getErrorForField('billable') && (<ViolationMessages_1.default violations={getViolationsForField('billable')} containerStyle={[styles.mt1]} textStyle={[styles.ph0]} isLast canEdit={canEdit}/>)}
                        </react_native_1.View>
                        <Switch_1.default accessibilityLabel={translate('common.billable')} isOn={(_p = updatedTransaction === null || updatedTransaction === void 0 ? void 0 : updatedTransaction.billable) !== null && _p !== void 0 ? _p : !!transactionBillable} onToggle={saveBillable} disabled={!canEdit}/>
                    </react_native_1.View>)}
                {shouldShowViewTripDetails && (<MenuItem_1.default title={translate('travel.viewTripDetails')} icon={Expensicons.Suitcase} onPress={function () {
                var _a, _b, _c;
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) || !(report === null || report === void 0 ? void 0 : report.reportID)) {
                    return;
                }
                var reservations = (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.reservationList) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
                if (reservations > 1) {
                    Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_TRIP_SUMMARY.getRoute(report.reportID, transaction.transactionID, getReportRHPActiveRoute()));
                }
                Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_TRIP_DETAILS.getRoute(report.reportID, transaction.transactionID, '0', 0, getReportRHPActiveRoute()));
            }}/>)}
            </>
            <ConfirmModal_1.default isVisible={showConfirmDismissReceiptError} onConfirm={function () {
            dismissReceiptError();
            setShowConfirmDismissReceiptError(false);
        }} onCancel={function () {
            setShowConfirmDismissReceiptError(false);
        }} title={translate('iou.dismissReceiptError')} prompt={translate('iou.dismissReceiptErrorConfirmation')} confirmText={translate('common.dismiss')} cancelText={translate('common.cancel')} shouldShowCancelButton danger/>
        </react_native_1.View>);
}
MoneyRequestView.displayName = 'MoneyRequestView';
exports.default = MoneyRequestView;
