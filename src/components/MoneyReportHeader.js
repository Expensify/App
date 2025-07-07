"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLoadingBarVisibility_1 = require("@hooks/useLoadingBarVisibility");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePaymentAnimations_1 = require("@hooks/usePaymentAnimations");
var usePaymentOptions_1 = require("@hooks/usePaymentOptions");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSelectedTransactionsActions_1 = require("@hooks/useSelectedTransactionsActions");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Report_1 = require("@libs/actions/Report");
var MoneyRequestReportUtils_1 = require("@libs/MoneyRequestReportUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NextStepUtils_1 = require("@libs/NextStepUtils");
var PaymentUtils_1 = require("@libs/PaymentUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportPrimaryActionUtils_1 = require("@libs/ReportPrimaryActionUtils");
var ReportSecondaryActionUtils_1 = require("@libs/ReportSecondaryActionUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var variables_1 = require("@styles/variables");
var IOU_1 = require("@userActions/IOU");
var Transaction_1 = require("@userActions/Transaction");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var BrokenConnectionDescription_1 = require("./BrokenConnectionDescription");
var Button_1 = require("./Button");
var ButtonWithDropdownMenu_1 = require("./ButtonWithDropdownMenu");
var ConfirmModal_1 = require("./ConfirmModal");
var DecisionModal_1 = require("./DecisionModal");
var DelegateNoAccessModalProvider_1 = require("./DelegateNoAccessModalProvider");
var Header_1 = require("./Header");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var KYCWall_1 = require("./KYCWall");
var LoadingBar_1 = require("./LoadingBar");
var Modal_1 = require("./Modal");
var MoneyReportHeaderStatusBar_1 = require("./MoneyReportHeaderStatusBar");
var MoneyReportHeaderStatusBarSkeleton_1 = require("./MoneyReportHeaderStatusBarSkeleton");
var MoneyRequestHeaderStatusBar_1 = require("./MoneyRequestHeaderStatusBar");
var ProcessMoneyReportHoldMenu_1 = require("./ProcessMoneyReportHoldMenu");
var SearchContext_1 = require("./Search/SearchContext");
var AnimatedSettlementButton_1 = require("./SettlementButton/AnimatedSettlementButton");
var Text_1 = require("./Text");
function MoneyReportHeader(_a) {
    var _b, _c;
    var _d, _e, _f, _g, _h, _j;
    var policy = _a.policy, moneyRequestReport = _a.report, transactionThreadReportID = _a.transactionThreadReportID, reportActions = _a.reportActions, isLoadingInitialReportActions = _a.isLoadingInitialReportActions, _k = _a.shouldDisplayBackButton, shouldDisplayBackButton = _k === void 0 ? false : _k, onBackButtonPress = _a.onBackButtonPress;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _l = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _l.shouldUseNarrowLayout, isSmallScreenWidth = _l.isSmallScreenWidth, isMediumScreenWidth = _l.isMediumScreenWidth;
    var shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    var route = (0, native_1.useRoute)();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var chatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.chatReportID), { canBeMissing: true })[0];
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var nextStep = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.NEXT_STEP).concat(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID), { canBeMissing: true })[0];
    var isUserValidated = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return account === null || account === void 0 ? void 0 : account.validated; }, canBeMissing: true })[0];
    var transactionThreadReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID), { canBeMissing: true })[0];
    var reportPDFFilename = ((_d = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME).concat(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID), { canBeMissing: true })) !== null && _d !== void 0 ? _d : null)[0];
    var download = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.DOWNLOAD).concat(reportPDFFilename), { canBeMissing: true })[0];
    var isDownloadingPDF = (_e = download === null || download === void 0 ? void 0 : download.isDownloading) !== null && _e !== void 0 ? _e : false;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var requestParentReportAction = (0, react_1.useMemo)(function () {
        if (!reportActions || !(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportActionID)) {
            return null;
        }
        return reportActions.find(function (action) { return action.reportActionID === transactionThreadReport.parentReportActionID; });
    }, [reportActions, transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportActionID]);
    var _m = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, {
        selector: function (_transactions) { return (0, ReportUtils_1.reportTransactionsSelector)(_transactions, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID); },
        initialValue: [],
        canBeMissing: true,
    })[0], transactions = _m === void 0 ? [] : _m;
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat((0, ReportActionsUtils_1.isMoneyRequestAction)(requestParentReportAction) && ((_f = (0, ReportActionsUtils_1.getOriginalMessage)(requestParentReportAction)) === null || _f === void 0 ? void 0 : _f.IOUTransactionID)), {
        canBeMissing: true,
    })[0];
    var _o = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_DISMISSED_HOLD_USE_EXPLANATION, { initialValue: true, canBeMissing: true }), dismissedHoldUseExplanation = _o[0], dismissedHoldUseExplanationResult = _o[1];
    var isLoadingHoldUseExplained = (0, isLoadingOnyxValue_1.default)(dismissedHoldUseExplanationResult);
    var invoiceReceiverPolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((chatReport === null || chatReport === void 0 ? void 0 : chatReport.invoiceReceiver) && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined), { canBeMissing: true })[0];
    var isExported = (0, ReportUtils_1.isExported)(reportActions);
    var integrationNameFromExportMessage = isExported ? (0, ReportUtils_1.getIntegrationNameFromExportMessage)(reportActions) : null;
    var _p = (0, react_1.useState)(false), downloadErrorModalVisible = _p[0], setDownloadErrorModalVisible = _p[1];
    var _q = (0, react_1.useState)(false), isCancelPaymentModalVisible = _q[0], setIsCancelPaymentModalVisible = _q[1];
    var _r = (0, react_1.useState)(false), isDeleteExpenseModalVisible = _r[0], setIsDeleteExpenseModalVisible = _r[1];
    var _s = (0, react_1.useState)(false), isDeleteReportModalVisible = _s[0], setIsDeleteReportModalVisible = _s[1];
    var _t = (0, react_1.useState)(false), isUnapproveModalVisible = _t[0], setIsUnapproveModalVisible = _t[1];
    var _u = (0, react_1.useState)(false), isReopenWarningModalVisible = _u[0], setIsReopenWarningModalVisible = _u[1];
    var _v = (0, react_1.useState)(false), isPDFModalVisible = _v[0], setIsPDFModalVisible = _v[1];
    var _w = (0, react_1.useState)(null), exportModalStatus = _w[0], setExportModalStatus = _w[1];
    var _x = (0, usePaymentAnimations_1.default)(), isPaidAnimationRunning = _x.isPaidAnimationRunning, isApprovedAnimationRunning = _x.isApprovedAnimationRunning, startAnimation = _x.startAnimation, stopAnimation = _x.stopAnimation, startApprovedAnimation = _x.startApprovedAnimation;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isOnHold = (0, TransactionUtils_1.isOnHold)(transaction);
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var _y = (0, react_1.useState)(false), isHoldMenuVisible = _y[0], setIsHoldMenuVisible = _y[1];
    var _z = (0, react_1.useState)(), paymentType = _z[0], setPaymentType = _z[1];
    var _0 = (0, react_1.useState)(), requestType = _0[0], setRequestType = _0[1];
    var canAllowSettlement = (0, ReportUtils_1.hasUpdatedTotal)(moneyRequestReport, policy);
    var policyType = policy === null || policy === void 0 ? void 0 : policy.type;
    var connectedIntegration = (0, PolicyUtils_1.getValidConnectedIntegration)(policy);
    var hasScanningReceipt = (0, ReportUtils_1.getTransactionsWithReceipts)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID).some(function (t) { return (0, TransactionUtils_1.isScanning)(t); });
    var hasOnlyPendingTransactions = (0, react_1.useMemo)(function () {
        return !!transactions && transactions.length > 0 && transactions.every(function (t) { return (0, TransactionUtils_1.isExpensifyCardTransaction)(t) && (0, TransactionUtils_1.isPending)(t); });
    }, [transactions]);
    var transactionIDs = (0, react_1.useMemo)(function () { var _a; return (_a = transactions === null || transactions === void 0 ? void 0 : transactions.map(function (t) { return t.transactionID; })) !== null && _a !== void 0 ? _a : []; }, [transactions]);
    var allViolations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, { canBeMissing: true })[0];
    var violations = (0, react_1.useMemo)(function () { return Object.fromEntries(Object.entries(allViolations !== null && allViolations !== void 0 ? allViolations : {}).filter(function (_a) {
        var key = _a[0];
        return transactionIDs.includes(key.replace(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, ''));
    })); }, [allViolations, transactionIDs]);
    var messagePDF = (0, react_1.useMemo)(function () {
        if (!reportPDFFilename) {
            return translate('reportDetailsPage.waitForPDF');
        }
        if (reportPDFFilename === CONST_1.default.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        return translate('reportDetailsPage.generatedPDF');
    }, [reportPDFFilename, translate]);
    // Check if there is pending rter violation in all transactionViolations with given transactionIDs.
    var hasAllPendingRTERViolations = (0, TransactionUtils_1.allHavePendingRTERViolation)(transactions, violations);
    // Check if user should see broken connection violation warning.
    var shouldShowBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolationForMultipleTransactions)(transactionIDs, moneyRequestReport, policy, violations);
    var hasOnlyHeldExpenses = (0, ReportUtils_1.hasOnlyHeldExpenses)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
    var isPayAtEndExpense = (0, TransactionUtils_1.isPayAtEndExpense)(transaction);
    var isArchivedReport = (0, useReportIsArchived_1.default)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
    var isChatReportArchived = (0, useReportIsArchived_1.default)(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID);
    var archiveReason = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID), { selector: ReportUtils_1.getArchiveReason, canBeMissing: true })[0];
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID), { canBeMissing: true })[0];
    var getCanIOUBePaid = (0, react_1.useCallback)(function (onlyShowPayElsewhere, shouldCheckApprovedState) {
        if (onlyShowPayElsewhere === void 0) { onlyShowPayElsewhere = false; }
        if (shouldCheckApprovedState === void 0) { shouldCheckApprovedState = true; }
        return (0, IOU_1.canIOUBePaid)(moneyRequestReport, chatReport, policy, transaction ? [transaction] : undefined, onlyShowPayElsewhere, undefined, undefined, shouldCheckApprovedState);
    }, [moneyRequestReport, chatReport, policy, transaction]);
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(moneyRequestReport);
    var _1 = (0, react_1.useState)(false), isDownloadErrorModalVisible = _1[0], setIsDownloadErrorModalVisible = _1[1];
    var _2 = (0, SearchContext_1.useSearchContext)(), selectedTransactionIDs = _2.selectedTransactionIDs, clearSelectedTransactions = _2.clearSelectedTransactions;
    var _3 = (0, useSelectedTransactionsActions_1.default)({
        report: moneyRequestReport,
        reportActions: reportActions,
        allTransactionsLength: transactions.length,
        session: session,
        onExportFailed: function () { return setIsDownloadErrorModalVisible(true); },
    }), selectedTransactionsOptions = _3.options, handleDeleteTransactions = _3.handleDeleteTransactions, hookDeleteModalVisible = _3.isDeleteModalVisible, hideDeleteModal = _3.hideDeleteModal;
    var shouldShowSelectedTransactionsButton = !!selectedTransactionsOptions.length && !transactionThreadReportID;
    var canIOUBePaid = (0, react_1.useMemo)(function () { return getCanIOUBePaid(); }, [getCanIOUBePaid]);
    var onlyShowPayElsewhere = (0, react_1.useMemo)(function () { return !canIOUBePaid && getCanIOUBePaid(true); }, [canIOUBePaid, getCanIOUBePaid]);
    var shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;
    var shouldShowApproveButton = (0, react_1.useMemo)(function () { return ((0, IOU_1.canApproveIOU)(moneyRequestReport, policy, transactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning; }, [moneyRequestReport, policy, transactions, hasOnlyPendingTransactions, isApprovedAnimationRunning]);
    var shouldDisableApproveButton = shouldShowApproveButton && !(0, ReportUtils_1.isAllowedToApproveExpenseReport)(moneyRequestReport);
    var isFromPaidPolicy = policyType === CONST_1.default.POLICY.TYPE.TEAM || policyType === CONST_1.default.POLICY.TYPE.CORPORATE;
    var hasDuplicates = (0, TransactionUtils_1.hasDuplicateTransactions)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
    var shouldShowStatusBar = hasAllPendingRTERViolations || shouldShowBrokenConnectionViolation || hasOnlyHeldExpenses || hasScanningReceipt || isPayAtEndExpense || hasOnlyPendingTransactions || hasDuplicates;
    // When prevent self-approval is enabled & the current user is submitter AND they're submitting to themselves, we need to show the optimistic next step
    // We should always show this optimistic message for policies with preventSelfApproval
    // to avoid any flicker during transitions between online/offline states
    var nextApproverAccountID = (0, ReportUtils_1.getNextApproverAccountID)(moneyRequestReport);
    var isSubmitterSameAsNextApprover = (0, ReportUtils_1.isReportOwner)(moneyRequestReport) && nextApproverAccountID === (moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.ownerAccountID);
    var optimisticNextStep = isSubmitterSameAsNextApprover && (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval) ? (0, NextStepUtils_1.buildOptimisticNextStepForPreventSelfApprovalsEnabled)() : nextStep;
    var shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;
    var bankAccountRoute = (0, ReportUtils_1.getBankAccountRoute)(chatReport);
    var _4 = (0, ReportUtils_1.getNonHeldAndFullAmount)(moneyRequestReport, shouldShowPayButton), nonHeldAmount = _4.nonHeldAmount, fullAmount = _4.fullAmount, hasValidNonHeldAmount = _4.hasValidNonHeldAmount;
    var isAnyTransactionOnHold = (0, ReportUtils_1.hasHeldExpenses)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
    var _5 = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isDelegateAccessRestricted = _5.isDelegateAccessRestricted, showDelegateNoAccessModal = _5.showDelegateNoAccessModal;
    var shouldShowLoadingBar = (0, useLoadingBarVisibility_1.default)();
    var isReportInRHP = route.name === SCREENS_1.default.SEARCH.REPORT_RHP;
    var shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    var confirmPayment = (0, react_1.useCallback)(function (type, payAsBusiness, methodID, paymentMethod) {
        if (!type || !chatReport) {
            return;
        }
        setPaymentType(type);
        setRequestType(CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        }
        else if (isAnyTransactionOnHold) {
            react_native_1.InteractionManager.runAfterInteractions(function () { return setIsHoldMenuVisible(true); });
        }
        else if (isInvoiceReport) {
            startAnimation();
            (0, IOU_1.payInvoice)(type, chatReport, moneyRequestReport, payAsBusiness, methodID, paymentMethod);
        }
        else {
            startAnimation();
            (0, IOU_1.payMoneyRequest)(type, chatReport, moneyRequestReport, true);
        }
    }, [chatReport, isAnyTransactionOnHold, isDelegateAccessRestricted, showDelegateNoAccessModal, isInvoiceReport, moneyRequestReport, startAnimation]);
    var confirmApproval = function () {
        setRequestType(CONST_1.default.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        }
        else if (isAnyTransactionOnHold) {
            setIsHoldMenuVisible(true);
        }
        else {
            startApprovedAnimation();
            (0, IOU_1.approveMoneyRequest)(moneyRequestReport, true);
        }
    };
    var markAsCash = (0, react_1.useCallback)(function () {
        var _a;
        if (!requestParentReportAction) {
            return;
        }
        var iouTransactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(requestParentReportAction) ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(requestParentReportAction)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID : undefined;
        var reportID = transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID;
        if (!iouTransactionID || !reportID) {
            return;
        }
        (0, Transaction_1.markAsCash)(iouTransactionID, reportID);
    }, [requestParentReportAction, transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID]);
    var getStatusIcon = function (src) { return (<Icon_1.default src={src} height={variables_1.default.iconSizeSmall} width={variables_1.default.iconSizeSmall} fill={theme.icon}/>); };
    var getStatusBarProps = function () {
        if (isPayAtEndExpense) {
            if (!isArchivedReport) {
                return { icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.bookingPendingDescription') };
            }
            if (isArchivedReport && archiveReason === CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED) {
                return { icon: getStatusIcon(Expensicons.Box), description: translate('iou.bookingArchivedDescription') };
            }
        }
        if (hasOnlyHeldExpenses) {
            return { icon: getStatusIcon(Expensicons.Stopwatch), description: translate('iou.expensesOnHold') };
        }
        if (hasDuplicates) {
            return { icon: getStatusIcon(Expensicons.Flag), description: translate('iou.duplicateTransaction', { isSubmitted: (0, ReportUtils_1.isProcessingReport)(moneyRequestReport) }) };
        }
        if (!!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) && shouldShowBrokenConnectionViolation) {
            return {
                icon: getStatusIcon(Expensicons.Hourglass),
                description: (<BrokenConnectionDescription_1.default transactionID={transaction === null || transaction === void 0 ? void 0 : transaction.transactionID} report={moneyRequestReport} policy={policy}/>),
            };
        }
        if (hasAllPendingRTERViolations) {
            return { icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription') };
        }
        if (hasOnlyPendingTransactions) {
            return { icon: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription') };
        }
        if (hasScanningReceipt) {
            return { icon: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription') };
        }
    };
    var getFirstDuplicateThreadID = function (reportTransactions, allReportActions) {
        var duplicateTransaction = reportTransactions.find(function (reportTransaction) { return (0, TransactionUtils_1.isDuplicate)(reportTransaction); });
        if (!duplicateTransaction) {
            return null;
        }
        return (0, MoneyRequestReportUtils_1.getThreadReportIDsForTransactions)(allReportActions, [duplicateTransaction]).at(0);
    };
    var statusBarProps = getStatusBarProps();
    var shouldAddGapToContents = shouldUseNarrowLayout && shouldShowSelectedTransactionsButton && (!!statusBarProps || shouldShowNextStep);
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingHoldUseExplained || dismissedHoldUseExplanation || !isOnHold) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation_1.default.getReportRHPActiveRoute()));
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);
    var primaryAction = (0, react_1.useMemo)(function () {
        // It's necessary to allow payment animation to finish before button is changed
        if (isPaidAnimationRunning) {
            return CONST_1.default.REPORT.PRIMARY_ACTIONS.PAY;
        }
        if (!moneyRequestReport) {
            return '';
        }
        return (0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({
            report: moneyRequestReport,
            chatReport: chatReport,
            reportTransactions: transactions,
            violations: violations,
            policy: policy,
            reportNameValuePairs: reportNameValuePairs,
            reportActions: reportActions,
            isChatReportArchived: isChatReportArchived,
            invoiceReceiverPolicy: invoiceReceiverPolicy,
        });
    }, [isPaidAnimationRunning, moneyRequestReport, reportNameValuePairs, policy, transactions, violations, reportActions, isChatReportArchived, chatReport, invoiceReceiverPolicy]);
    var confirmExport = (0, react_1.useCallback)(function () {
        setExportModalStatus(null);
        if (!(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID) || !connectedIntegration) {
            return;
        }
        if (exportModalStatus === CONST_1.default.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
            (0, Report_1.exportToIntegration)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, connectedIntegration);
        }
        else if (exportModalStatus === CONST_1.default.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
            (0, Report_1.markAsManuallyExported)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, connectedIntegration);
        }
    }, [connectedIntegration, exportModalStatus, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID]);
    var getAmount = function (actionType) { return ({
        formattedAmount: (0, MoneyRequestReportUtils_1.getTotalAmountForIOUReportPreviewButton)(moneyRequestReport, policy, actionType),
    }); };
    var totalAmount = (hasOnlyHeldExpenses ? getAmount(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW) : getAmount(CONST_1.default.REPORT.PRIMARY_ACTIONS.PAY)).formattedAmount;
    var paymentButtonOptions = (0, usePaymentOptions_1.default)({
        addBankAccountRoute: bankAccountRoute,
        currency: moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID,
        formattedAmount: totalAmount,
        policyID: moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.policyID,
        onPress: confirmPayment,
        shouldHidePaymentOptions: !shouldShowPayButton,
        shouldShowApproveButton: shouldShowApproveButton,
        shouldDisableApproveButton: shouldDisableApproveButton,
        onlyShowPayElsewhere: onlyShowPayElsewhere,
    });
    var addExpenseDropdownOptions = (0, react_1.useMemo)(function () { return [
        {
            value: CONST_1.default.REPORT.ADD_EXPENSE_OPTIONS.CREATE_NEW_EXPENSE,
            text: translate('iou.createNewExpense'),
            icon: Expensicons.Plus,
            onSelected: function () {
                if (!(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID)) {
                    return;
                }
                if (policy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policy.id)) {
                    Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.SUBMIT, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
            },
        },
        {
            value: CONST_1.default.REPORT.ADD_EXPENSE_OPTIONS.ADD_UNREPORTED_EXPENSE,
            text: translate('iou.addUnreportedExpense'),
            icon: Expensicons.ReceiptPlus,
            onSelected: function () {
                if (policy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policy.id)) {
                    Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                (0, Report_1.openUnreportedExpense)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
            },
        },
    ]; }, [moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, policy, translate]);
    var primaryActionsImplementation = (_b = {},
        _b[CONST_1.default.REPORT.PRIMARY_ACTIONS.SUBMIT] = (<Button_1.default success text={translate('common.submit')} onPress={function () {
                if (!moneyRequestReport) {
                    return;
                }
                (0, IOU_1.submitReport)(moneyRequestReport);
            }}/>),
        _b[CONST_1.default.REPORT.PRIMARY_ACTIONS.APPROVE] = (<Button_1.default success onPress={confirmApproval} text={translate('iou.approve')}/>),
        _b[CONST_1.default.REPORT.PRIMARY_ACTIONS.PAY] = (<AnimatedSettlementButton_1.default isPaidAnimationRunning={isPaidAnimationRunning} isApprovedAnimationRunning={isApprovedAnimationRunning} onAnimationFinish={stopAnimation} canIOUBePaid onlyShowPayElsewhere={onlyShowPayElsewhere} currency={moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.currency} confirmApproval={confirmApproval} policyID={moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.policyID} chatReportID={chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID} iouReport={moneyRequestReport} onPress={confirmPayment} enablePaymentsRoute={ROUTES_1.default.ENABLE_PAYMENTS} addBankAccountRoute={bankAccountRoute} shouldHidePaymentOptions={!shouldShowPayButton} shouldShowApproveButton={shouldShowApproveButton} shouldDisableApproveButton={shouldDisableApproveButton} isDisabled={isOffline && !canAllowSettlement} isLoading={!isOffline && !canAllowSettlement}/>),
        _b[CONST_1.default.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING] = (<Button_1.default success 
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        text={translate('workspace.common.exportIntegrationSelected', { connectionName: connectedIntegration })} onPress={function () {
                if (!connectedIntegration || !moneyRequestReport) {
                    return;
                }
                if (isExported) {
                    setExportModalStatus(CONST_1.default.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                    return;
                }
                (0, Report_1.exportToIntegration)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, connectedIntegration);
            }}/>),
        _b[CONST_1.default.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD] = (<Button_1.default success text={translate('iou.unhold')} onPress={function () {
                var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.parentReportID, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.parentReportActionID);
                var IOUActions = (0, ReportPrimaryActionUtils_1.getAllExpensesToHoldIfApplicable)(moneyRequestReport, reportActions);
                if (IOUActions.length) {
                    IOUActions.forEach(ReportUtils_1.changeMoneyRequestHoldStatus);
                    return;
                }
                var moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
                if (!moneyRequestAction) {
                    return;
                }
                (0, ReportUtils_1.changeMoneyRequestHoldStatus)(moneyRequestAction);
            }}/>),
        _b[CONST_1.default.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH] = (<Button_1.default success text={translate('iou.markAsCash')} onPress={markAsCash}/>),
        _b[CONST_1.default.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES] = (<Button_1.default success text={translate('iou.reviewDuplicates')} onPress={function () {
                var threadID = transactionThreadReportID !== null && transactionThreadReportID !== void 0 ? transactionThreadReportID : getFirstDuplicateThreadID(transactions, reportActions);
                if (!threadID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(threadID));
            }}/>),
        _b[CONST_1.default.REPORT.PRIMARY_ACTIONS.ADD_EXPENSE] = (<ButtonWithDropdownMenu_1.default onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('iou.addExpense')} options={addExpenseDropdownOptions} isSplitButton={false}/>),
        _b);
    var _6 = (0, react_1.useState)(false), offlineModalVisible = _6[0], setOfflineModalVisible = _6[1];
    var beginPDFExport = function (reportID) {
        setIsPDFModalVisible(true);
        (0, Report_1.exportReportToPDF)({ reportID: reportID });
    };
    var secondaryActions = (0, react_1.useMemo)(function () {
        if (!moneyRequestReport) {
            return [];
        }
        return (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({
            report: moneyRequestReport,
            chatReport: chatReport,
            reportTransactions: transactions,
            violations: violations,
            policy: policy,
            reportNameValuePairs: reportNameValuePairs,
            reportActions: reportActions,
            policies: policies,
            isChatReportArchived: isChatReportArchived,
        });
    }, [moneyRequestReport, transactions, violations, policy, reportNameValuePairs, reportActions, policies, chatReport, isChatReportArchived]);
    var secondaryActionsImplementation = (_c = {},
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS] = {
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: Expensicons.Info,
            onSelected: function () {
                (0, ReportUtils_1.navigateToDetailsPage)(moneyRequestReport, Navigation_1.default.getReportRHPActiveRoute());
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_CSV] = {
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            text: translate('common.downloadAsCSV'),
            icon: Expensicons.Download,
            onSelected: function () {
                if (!moneyRequestReport) {
                    return;
                }
                if (isOffline) {
                    setOfflineModalVisible(true);
                    return;
                }
                (0, Report_1.exportReportToCSV)({ reportID: moneyRequestReport.reportID, transactionIDList: transactionIDs }, function () {
                    setDownloadErrorModalVisible(true);
                });
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF] = {
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
            text: translate('common.downloadAsPDF'),
            icon: Expensicons.Document,
            onSelected: function () {
                if (!moneyRequestReport) {
                    return;
                }
                beginPDFExport(moneyRequestReport.reportID);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.SUBMIT] = {
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.SUBMIT,
            text: translate('common.submit'),
            icon: Expensicons.Send,
            onSelected: function () {
                if (!moneyRequestReport) {
                    return;
                }
                (0, IOU_1.submitReport)(moneyRequestReport);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE] = {
            text: translate('iou.approve', getAmount(CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE)),
            icon: Expensicons.ThumbsUp,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE,
            onSelected: confirmApproval,
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.UNAPPROVE] = {
            text: translate('iou.unapprove'),
            icon: Expensicons.CircularArrowBackwards,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
            onSelected: function () {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }
                if (isExported) {
                    setIsUnapproveModalVisible(true);
                    return;
                }
                (0, IOU_1.unapproveExpenseReport)(moneyRequestReport);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT] = {
            text: translate('iou.cancelPayment'),
            icon: Expensicons.Clear,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT,
            onSelected: function () {
                setIsCancelPaymentModalVisible(true);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING] = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            text: translate('workspace.common.exportIntegrationSelected', { connectionName: connectedIntegration }),
            icon: (0, ReportUtils_1.getIntegrationIcon)(connectedIntegration),
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING,
            onSelected: function () {
                if (!connectedIntegration || !moneyRequestReport) {
                    return;
                }
                if (isExported) {
                    setExportModalStatus(CONST_1.default.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                    return;
                }
                (0, Report_1.exportToIntegration)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, connectedIntegration);
            },
            additionalIconStyles: styles.integrationIcon,
            displayInDefaultIconColor: true,
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED] = {
            text: translate('workspace.common.markAsExported'),
            icon: Expensicons.CheckCircle,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED,
            onSelected: function () {
                if (!connectedIntegration || !moneyRequestReport) {
                    return;
                }
                if (isExported) {
                    setExportModalStatus(CONST_1.default.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
                    return;
                }
                (0, Report_1.markAsManuallyExported)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, connectedIntegration);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.HOLD] = {
            text: translate('iou.hold'),
            icon: Expensicons.Stopwatch,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.HOLD,
            onSelected: function () {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }
                (0, ReportUtils_1.changeMoneyRequestHoldStatus)(requestParentReportAction);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.SPLIT] = {
            text: translate('iou.split'),
            icon: Expensicons.ArrowSplit,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.SPLIT,
            onSelected: function () {
                var _a;
                if (Number(transactions === null || transactions === void 0 ? void 0 : transactions.length) !== 1) {
                    return;
                }
                var currentTransaction = transactions.at(0);
                (0, IOU_1.initSplitExpense)(currentTransaction, (_a = moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID) !== null && _a !== void 0 ? _a : String(CONST_1.default.DEFAULT_NUMBER_ID));
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE] = {
            text: translate('iou.changeWorkspace'),
            icon: Expensicons.Buildings,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE,
            onSelected: function () {
                if (!moneyRequestReport) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID_CHANGE_WORKSPACE.getRoute(moneyRequestReport.reportID, Navigation_1.default.getActiveRoute()));
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE] = {
            text: translate('common.delete'),
            icon: Expensicons.Trashcan,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE,
            onSelected: function () {
                if (Object.keys(transactions).length === 1) {
                    setIsDeleteExpenseModalVisible(true);
                }
                else {
                    setIsDeleteReportModalVisible(true);
                }
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.RETRACT] = {
            text: translate('iou.undoSubmit'),
            icon: Expensicons.CircularArrowBackwards,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.RETRACT,
            onSelected: function () {
                (0, IOU_1.retractReport)(moneyRequestReport);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.REOPEN] = {
            text: translate('iou.undoClose'),
            icon: Expensicons.CircularArrowBackwards,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.REOPEN,
            onSelected: function () {
                if (isExported) {
                    setIsReopenWarningModalVisible(true);
                    return;
                }
                (0, IOU_1.reopenReport)(moneyRequestReport);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE] = {
            text: translate('iou.addExpense'),
            backButtonText: translate('iou.addExpense'),
            icon: Expensicons.Plus,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE,
            subMenuItems: addExpenseDropdownOptions,
            onSelected: function () {
                if (!(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID)) {
                    return;
                }
                if (policy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policy.id)) {
                    Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.SUBMIT, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
            },
        },
        _c[CONST_1.default.REPORT.SECONDARY_ACTIONS.PAY] = {
            text: translate('iou.settlePayment', { formattedAmount: totalAmount }),
            icon: Expensicons.Cash,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.PAY,
            backButtonText: translate('iou.settlePayment', { formattedAmount: totalAmount }),
            subMenuItems: Object.values(paymentButtonOptions),
        },
        _c);
    var applicableSecondaryActions = secondaryActions
        .map(function (action) { return secondaryActionsImplementation[action]; })
        .filter(function (action) { return (action === null || action === void 0 ? void 0 : action.shouldShow) !== false && (action === null || action === void 0 ? void 0 : action.value) !== primaryAction; });
    (0, react_1.useEffect)(function () {
        if (!transactionThreadReportID) {
            return;
        }
        clearSelectedTransactions(true);
        // We don't need to run the effect on change of clearSelectedTransactions since it can cause the infinite loop.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionThreadReportID]);
    var shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;
    var isMoreContentShown = shouldShowNextStep || !!statusBarProps;
    var connectedIntegrationName = connectedIntegration ? translate('workspace.accounting.connectionName', { connectionName: connectedIntegration }) : '';
    var unapproveWarningText = (0, react_1.useMemo)(function () { return (<Text_1.default>
                <Text_1.default style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text_1.default>{' '}
                <Text_1.default>{translate('iou.unapproveWithIntegrationWarning', { accountingIntegration: connectedIntegrationName })}</Text_1.default>
            </Text_1.default>); }, [connectedIntegrationName, styles.noWrap, styles.textStrong, translate]);
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
        return (<HeaderWithBackButton_1.default title={translate('common.selectMultiple')} onBackButtonPress={function () {
                clearSelectedTransactions(true);
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
            }}/>);
    }
    var reopenExportedReportWarningText = (<Text_1.default>
            <Text_1.default style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')} </Text_1.default>
            <Text_1.default>{translate('iou.reopenExportedReportConfirmation', { connectionName: integrationNameFromExportMessage !== null && integrationNameFromExportMessage !== void 0 ? integrationNameFromExportMessage : '' })}</Text_1.default>
        </Text_1.default>);
    var onPaymentSelect = function (event, iouPaymentType, triggerKYCFlow) {
        return (0, PaymentUtils_1.selectPaymentType)(event, iouPaymentType, triggerKYCFlow, policy, confirmPayment, isUserValidated, confirmApproval, moneyRequestReport);
    };
    var KYCMoreDropdown = (<KYCWall_1.default onSuccessfulKYC={function (payment) { return confirmPayment(payment); }} enablePaymentsRoute={ROUTES_1.default.ENABLE_PAYMENTS} addBankAccountRoute={bankAccountRoute} isDisabled={isOffline} source={CONST_1.default.KYC_WALL_SOURCE.REPORT} chatReportID={chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID} iouReport={moneyRequestReport} anchorAlignment={{
            horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
            vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
        }}>
            {function (triggerKYCFlow, buttonRef) { return (<ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} onSubItemSelected={function (item, index, event) {
                if (!(0, PaymentUtils_1.isSecondaryActionAPaymentOption)(item)) {
                    return;
                }
                onPaymentSelect(event, item.value, triggerKYCFlow);
            }} buttonRef={buttonRef} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={applicableSecondaryActions} isSplitButton={false} wrapperStyle={shouldDisplayNarrowVersion && [!primaryAction && styles.flex1]} shouldUseModalPaddingStyle={false}/>); }}
        </KYCWall_1.default>);
    return (<react_native_1.View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton_1.default shouldShowReportAvatarWithDisplay shouldShowPinButton={false} report={moneyRequestReport} policy={policy} shouldShowBackButton={shouldShowBackButton} shouldDisplaySearchRouter={shouldDisplaySearchRouter} onBackButtonPress={onBackButtonPress} shouldShowBorderBottom={false} shouldEnableDetailPageNavigation>
                {!shouldDisplayNarrowVersion && (<react_native_1.View style={[styles.flexRow, styles.gap2]}>
                        {!!primaryAction && !shouldShowSelectedTransactionsButton && primaryActionsImplementation[primaryAction]}
                        {!!applicableSecondaryActions.length && !shouldShowSelectedTransactionsButton && KYCMoreDropdown}
                        {shouldShowSelectedTransactionsButton && (<react_native_1.View>
                                <ButtonWithDropdownMenu_1.default onPress={function () { return null; }} options={selectedTransactionsOptions} customText={translate('workspace.common.selected', { count: selectedTransactionIDs.length })} isSplitButton={false} shouldAlwaysShowDropdownMenu/>
                            </react_native_1.View>)}
                    </react_native_1.View>)}
            </HeaderWithBackButton_1.default>
            {shouldDisplayNarrowVersion && !shouldShowSelectedTransactionsButton && (<react_native_1.View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    {!!primaryAction && <react_native_1.View style={[styles.flex1]}>{primaryActionsImplementation[primaryAction]}</react_native_1.View>}
                    {!!applicableSecondaryActions.length && KYCMoreDropdown}
                </react_native_1.View>)}
            {isMoreContentShown && (<react_native_1.View style={[styles.dFlex, styles.flexColumn, shouldAddGapToContents && styles.gap3, styles.pb3, styles.ph5]}>
                    {shouldShowSelectedTransactionsButton && shouldDisplayNarrowVersion && (<react_native_1.View style={[styles.dFlex, styles.w100, styles.pb3]}>
                            <ButtonWithDropdownMenu_1.default onPress={function () { return null; }} options={selectedTransactionsOptions} customText={translate('workspace.common.selected', { count: selectedTransactionIDs.length })} isSplitButton={false} shouldAlwaysShowDropdownMenu wrapperStyle={styles.w100}/>
                        </react_native_1.View>)}
                    {shouldShowNextStep && !!((_g = optimisticNextStep === null || optimisticNextStep === void 0 ? void 0 : optimisticNextStep.message) === null || _g === void 0 ? void 0 : _g.length) && <MoneyReportHeaderStatusBar_1.default nextStep={optimisticNextStep}/>}
                    {shouldShowNextStep && !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline && <MoneyReportHeaderStatusBarSkeleton_1.default />}
                    {!!statusBarProps && (<MoneyRequestHeaderStatusBar_1.default icon={statusBarProps.icon} description={statusBarProps.description}/>)}
                </react_native_1.View>)}
            <LoadingBar_1.default shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout}/>
            {isHoldMenuVisible && requestType !== undefined && (<ProcessMoneyReportHoldMenu_1.default nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined} requestType={requestType} fullAmount={fullAmount} onClose={function () { return setIsHoldMenuVisible(false); }} isVisible={isHoldMenuVisible} paymentType={paymentType} chatReport={chatReport} moneyRequestReport={moneyRequestReport} startAnimation={function () {
                if (requestType === CONST_1.default.IOU.REPORT_ACTION_TYPE.APPROVE) {
                    startApprovedAnimation();
                }
                else {
                    startAnimation();
                }
            }} transactionCount={(_h = transactionIDs === null || transactionIDs === void 0 ? void 0 : transactionIDs.length) !== null && _h !== void 0 ? _h : 0}/>)}
            <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setDownloadErrorModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={downloadErrorModalVisible} onClose={function () { return setDownloadErrorModalVisible(false); }}/>
            <ConfirmModal_1.default title={translate('iou.cancelPayment')} isVisible={isCancelPaymentModalVisible} onConfirm={function () {
            if (!chatReport) {
                return;
            }
            (0, IOU_1.cancelPayment)(moneyRequestReport, chatReport);
            setIsCancelPaymentModalVisible(false);
        }} onCancel={function () { return setIsCancelPaymentModalVisible(false); }} prompt={translate('iou.cancelPaymentConfirmation')} confirmText={translate('iou.cancelPayment')} cancelText={translate('common.dismiss')} danger shouldEnableNewFocusManagement/>
            <ConfirmModal_1.default title={translate('iou.deleteExpense', { count: 1 })} isVisible={isDeleteExpenseModalVisible} onConfirm={function () {
            var goBackRoute;
            setIsDeleteExpenseModalVisible(false);
            if (transactionThreadReportID) {
                if (!requestParentReportAction || !(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)) {
                    throw new Error('Missing data!');
                }
                // it's deleting transaction but not the report which leads to bug (that is actually also on staging)
                // Money request should be deleted when interactions are done, to not show the not found page before navigating to goBackRoute
                react_native_1.InteractionManager.runAfterInteractions(function () { return (0, IOU_1.deleteMoneyRequest)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, requestParentReportAction); });
                goBackRoute = (0, IOU_1.getNavigationUrlOnMoneyRequestDelete)(transaction.transactionID, requestParentReportAction, false);
            }
            if (goBackRoute) {
                Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return (0, ReportUtils_1.navigateOnDeleteExpense)(goBackRoute); });
            }
        }} onCancel={function () { return setIsDeleteExpenseModalVisible(false); }} prompt={translate('iou.deleteConfirmation', { count: 1 })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>
            <ConfirmModal_1.default title={translate('iou.deleteExpense', { count: selectedTransactionIDs.length })} isVisible={hookDeleteModalVisible} onConfirm={handleDeleteTransactions} onCancel={hideDeleteModal} prompt={translate('iou.deleteConfirmation', { count: selectedTransactionIDs.length })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>
            <ConfirmModal_1.default title={translate('iou.deleteReport')} isVisible={isDeleteReportModalVisible} onConfirm={function () {
            setIsDeleteReportModalVisible(false);
            Navigation_1.default.goBack();
            react_native_1.InteractionManager.runAfterInteractions(function () {
                (0, Report_1.deleteAppReport)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
            });
        }} onCancel={function () { return setIsDeleteReportModalVisible(false); }} prompt={translate('iou.deleteReportConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>
            {!!connectedIntegration && (<ConfirmModal_1.default title={translate('workspace.exportAgainModal.title')} onConfirm={confirmExport} onCancel={function () { return setExportModalStatus(null); }} prompt={translate('workspace.exportAgainModal.description', { connectionName: connectedIntegration, reportName: (_j = moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportName) !== null && _j !== void 0 ? _j : '' })} confirmText={translate('workspace.exportAgainModal.confirmText')} cancelText={translate('workspace.exportAgainModal.cancelText')} isVisible={!!exportModalStatus}/>)}
            <ConfirmModal_1.default title={translate('iou.unapproveReport')} isVisible={isUnapproveModalVisible} danger confirmText={translate('iou.unapproveReport')} onConfirm={function () {
            setIsUnapproveModalVisible(false);
            (0, IOU_1.unapproveExpenseReport)(moneyRequestReport);
        }} cancelText={translate('common.cancel')} onCancel={function () { return setIsUnapproveModalVisible(false); }} prompt={unapproveWarningText}/>
            <ConfirmModal_1.default title={translate('iou.reopenReport')} isVisible={isReopenWarningModalVisible} danger confirmText={translate('iou.reopenReport')} onConfirm={function () {
            setIsReopenWarningModalVisible(false);
            (0, IOU_1.reopenReport)(moneyRequestReport);
        }} cancelText={translate('common.cancel')} onCancel={function () { return setIsReopenWarningModalVisible(false); }} 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    prompt={reopenExportedReportWarningText}/>
            <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsDownloadErrorModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isDownloadErrorModalVisible} onClose={function () { return setIsDownloadErrorModalVisible(false); }}/>
            <DecisionModal_1.default title={translate('common.youAppearToBeOffline')} prompt={translate('common.offlinePrompt')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setOfflineModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={offlineModalVisible} onClose={function () { return setOfflineModalVisible(false); }}/>
            <Modal_1.default onClose={function () { return setIsPDFModalVisible(false); }} isVisible={isPDFModalVisible} type={isSmallScreenWidth ? CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST_1.default.MODAL.MODAL_TYPE.CONFIRM} innerContainerStyle={styles.pv0}>
                <react_native_1.View style={[styles.m5]}>
                    <react_native_1.View>
                        <react_native_1.View style={[styles.flexRow, styles.mb4]}>
                            <Header_1.default title={translate('reportDetailsPage.generatingPDF')} containerStyles={[styles.alignItemsCenter]}/>
                        </react_native_1.View>
                        <react_native_1.View>
                            <Text_1.default>{messagePDF}</Text_1.default>
                            {!reportPDFFilename && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} color={theme.textSupporting} style={styles.mt3}/>)}
                        </react_native_1.View>
                    </react_native_1.View>
                    {!!reportPDFFilename && reportPDFFilename !== 'error' && (<Button_1.default isLoading={isDownloadingPDF} style={[styles.mt3, styles.noSelect]} onPress={function () { var _a; return (0, Report_1.downloadReportPDF)(reportPDFFilename !== null && reportPDFFilename !== void 0 ? reportPDFFilename : '', (_a = moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportName) !== null && _a !== void 0 ? _a : ''); }} text={translate('common.download')}/>)}
                    {(!reportPDFFilename || reportPDFFilename === 'error') && (<Button_1.default style={[styles.mt3, styles.noSelect]} onPress={function () { return setIsPDFModalVisible(false); }} text={translate('common.close')}/>)}
                </react_native_1.View>
            </Modal_1.default>
        </react_native_1.View>);
}
MoneyReportHeader.displayName = 'MoneyReportHeader';
exports.default = MoneyReportHeader;
