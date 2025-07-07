"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecondaryReportActions = getSecondaryReportActions;
exports.getSecondaryTransactionThreadActions = getSecondaryTransactionThreadActions;
exports.isDeleteAction = isDeleteAction;
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Member_1 = require("./actions/Policy/Member");
var Report_1 = require("./actions/Report");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var ReportPrimaryActionUtils_1 = require("./ReportPrimaryActionUtils");
var ReportUtils_1 = require("./ReportUtils");
var SessionUtils_1 = require("./SessionUtils");
var TransactionUtils_1 = require("./TransactionUtils");
function isAddExpenseAction(report, reportTransactions, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    if (!isReportSubmitter || reportTransactions.length === 0) {
        return false;
    }
    return (0, ReportUtils_1.canAddTransaction)(report, isReportArchived);
}
function isSplitAction(report, reportTransactions, policy) {
    var _a, _b;
    if (Number(reportTransactions === null || reportTransactions === void 0 ? void 0 : reportTransactions.length) !== 1) {
        return false;
    }
    var reportTransaction = reportTransactions.at(0);
    var isScanning = (0, TransactionUtils_1.hasReceipt)(reportTransaction) && (0, TransactionUtils_1.isReceiptBeingScanned)(reportTransaction);
    if ((0, TransactionUtils_1.isPending)(reportTransaction) || isScanning || !!(reportTransaction === null || reportTransaction === void 0 ? void 0 : reportTransaction.errors)) {
        return false;
    }
    var amount = ((_a = (0, ReportUtils_1.getTransactionDetails)(reportTransaction)) !== null && _a !== void 0 ? _a : {}).amount;
    if (!amount) {
        return false;
    }
    var _c = (0, TransactionUtils_1.getOriginalTransactionWithSplitInfo)(reportTransaction), isExpenseSplit = _c.isExpenseSplit, isBillSplit = _c.isBillSplit;
    if (isExpenseSplit || isBillSplit) {
        return false;
    }
    if (!(0, ReportUtils_1.isExpenseReport)(report)) {
        return false;
    }
    if (report.stateNum && report.stateNum >= CONST_1.default.REPORT.STATE_NUM.APPROVED) {
        return false;
    }
    var isSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isManager = ((_b = report.managerID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID) === (0, Report_1.getCurrentUserAccountID)();
    return isSubmitter || isAdmin || isManager;
}
function isSubmitAction(report, reportTransactions, policy, reportNameValuePairs, reportActions, isChatReportArchived) {
    var _a;
    if (isChatReportArchived === void 0) { isChatReportArchived = false; }
    if ((0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) || isChatReportArchived) {
        return false;
    }
    var transactionAreComplete = reportTransactions.every(function (transaction) { return transaction.amount !== 0 || transaction.modifiedAmount !== 0; });
    if (!transactionAreComplete) {
        return false;
    }
    if (reportTransactions.length > 0 && reportTransactions.every(function (transaction) { return (0, TransactionUtils_1.isPending)(transaction); })) {
        return false;
    }
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    if (!isExpenseReport || (report === null || report === void 0 ? void 0 : report.total) === 0) {
        return false;
    }
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var isReportApprover = (0, Member_1.isApprover)(policy, (0, Report_1.getCurrentUserAccountID)());
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isManager = report.managerID === (0, Report_1.getCurrentUserAccountID)();
    if (!isReportSubmitter && !isReportApprover && !isAdmin && !isManager) {
        return false;
    }
    var isOpenReport = (0, ReportUtils_1.isOpenReport)(report);
    if (!isOpenReport) {
        return false;
    }
    var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, report);
    if (submitToAccountID === report.ownerAccountID && (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval)) {
        return false;
    }
    var hasReportBeenReopened = (0, ReportUtils_1.hasReportBeenReopened)(reportActions);
    if (hasReportBeenReopened && isReportSubmitter) {
        return false;
    }
    if (isAdmin || isManager) {
        return true;
    }
    var autoReportingFrequency = (0, PolicyUtils_1.getCorrectedAutoReportingFrequency)(policy);
    var isScheduledSubmitEnabled = ((_a = policy === null || policy === void 0 ? void 0 : policy.harvesting) === null || _a === void 0 ? void 0 : _a.enabled) && autoReportingFrequency !== CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    return !!isScheduledSubmitEnabled;
}
function isApproveAction(report, reportTransactions, violations, policy) {
    var _a;
    var isAnyReceiptBeingScanned = reportTransactions === null || reportTransactions === void 0 ? void 0 : reportTransactions.some(function (transaction) { return (0, TransactionUtils_1.isReceiptBeingScanned)(transaction); });
    if (isAnyReceiptBeingScanned) {
        return false;
    }
    var currentUserAccountID = (0, Report_1.getCurrentUserAccountID)();
    var managerID = (_a = report === null || report === void 0 ? void 0 : report.managerID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var isCurrentUserManager = managerID === currentUserAccountID;
    if (!isCurrentUserManager) {
        return false;
    }
    var isProcessingReport = (0, ReportUtils_1.isProcessingReport)(report);
    if (!isProcessingReport) {
        return false;
    }
    var isPreventSelfApprovalEnabled = policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval;
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    if (isPreventSelfApprovalEnabled && isReportSubmitter) {
        return false;
    }
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    var reportHasDuplicatedTransactions = reportTransactions.some(function (transaction) { return (0, TransactionUtils_1.isDuplicate)(transaction); });
    if (isExpenseReport && isProcessingReport && reportHasDuplicatedTransactions) {
        return true;
    }
    var transactionIDs = reportTransactions.map(function (t) { return t.transactionID; });
    var hasAllPendingRTERViolations = (0, TransactionUtils_1.allHavePendingRTERViolation)(reportTransactions, violations);
    if (hasAllPendingRTERViolations) {
        return true;
    }
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var shouldShowBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolationForMultipleTransactions)(transactionIDs, report, policy, violations);
    var isReportApprover = (0, Member_1.isApprover)(policy, currentUserAccountID);
    var userControlsReport = isReportApprover || isAdmin;
    return userControlsReport && shouldShowBrokenConnectionViolation;
}
function isUnapproveAction(report, policy) {
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    var isReportApprover = (0, Member_1.isApprover)(policy, (0, Report_1.getCurrentUserAccountID)());
    var isReportApproved = (0, ReportUtils_1.isReportApproved)({ report: report });
    var isReportSettled = (0, ReportUtils_1.isSettled)(report);
    var isPaymentProcessing = report.isWaitingOnBankAccount && report.statusNum === CONST_1.default.REPORT.STATUS_NUM.APPROVED;
    if (isReportSettled || isPaymentProcessing) {
        return false;
    }
    return isExpenseReport && isReportApprover && isReportApproved;
}
function isCancelPaymentAction(report, reportTransactions, policy) {
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    if (!isExpenseReport) {
        return false;
    }
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isPayer = (0, ReportUtils_1.isPayer)((0, SessionUtils_1.getSession)(), report, false, policy);
    if (!isAdmin || !isPayer) {
        return false;
    }
    var isReportPaidElsewhere = report.stateNum === CONST_1.default.REPORT.STATE_NUM.APPROVED && report.statusNum === CONST_1.default.REPORT.STATUS_NUM.REIMBURSED;
    if (isReportPaidElsewhere) {
        return true;
    }
    var isPaymentProcessing = !!report.isWaitingOnBankAccount && report.statusNum === CONST_1.default.REPORT.STATUS_NUM.APPROVED;
    var payActions = reportTransactions.reduce(function (acc, transaction) {
        var action = (0, ReportActionsUtils_1.getIOUActionForReportID)(report.reportID, transaction.transactionID);
        if (action && (0, ReportActionsUtils_1.isPayAction)(action)) {
            acc.push(action);
        }
        return acc;
    }, []);
    var hasDailyNachaCutoffPassed = payActions.some(function (action) {
        var now = new Date();
        var paymentDatetime = new Date(action.created);
        var nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
        var cutoffTimeUTC = new Date(Date.UTC(paymentDatetime.getUTCFullYear(), paymentDatetime.getUTCMonth(), paymentDatetime.getUTCDate(), 23, 45, 0));
        return nowUTC.getTime() < cutoffTimeUTC.getTime();
    });
    return isPaymentProcessing && !hasDailyNachaCutoffPassed;
}
function isExportAction(report, policy, reportActions) {
    if (!policy) {
        return false;
    }
    var hasAccountingConnection = !!(0, PolicyUtils_1.getValidConnectedIntegration)(policy);
    if (!hasAccountingConnection) {
        return false;
    }
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(report);
    // We don't allow export to accounting for invoice reports in OD so we want to align with that here.
    if (isInvoiceReport) {
        return false;
    }
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    if (!isExpenseReport) {
        return false;
    }
    var isReportApproved = (0, ReportUtils_1.isReportApproved)({ report: report });
    var isReportPayer = (0, ReportUtils_1.isPayer)((0, SessionUtils_1.getSession)(), report, false, policy);
    var arePaymentsEnabled = (0, PolicyUtils_1.arePaymentsEnabled)(policy);
    var isReportClosed = (0, ReportUtils_1.isClosedReport)(report);
    if (isReportPayer && arePaymentsEnabled && (isReportApproved || isReportClosed)) {
        return true;
    }
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isReportReimbursed = report.statusNum === CONST_1.default.REPORT.STATUS_NUM.REIMBURSED;
    var connectedIntegration = (0, PolicyUtils_1.getConnectedIntegration)(policy);
    var syncEnabled = (0, PolicyUtils_1.hasIntegrationAutoSync)(policy, connectedIntegration);
    var isReportExported = (0, ReportUtils_1.isExported)(reportActions);
    var isReportFinished = isReportApproved || isReportReimbursed || isReportClosed;
    return isAdmin && isReportFinished && syncEnabled && !isReportExported;
}
function isMarkAsExportedAction(report, policy) {
    if (!policy) {
        return false;
    }
    var hasAccountingConnection = !!(0, PolicyUtils_1.getValidConnectedIntegration)(policy);
    if (!hasAccountingConnection) {
        return false;
    }
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(report);
    var isReportSender = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    if (isInvoiceReport && isReportSender) {
        return true;
    }
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    if (!isExpenseReport) {
        return false;
    }
    var isReportPayer = (0, ReportUtils_1.isPayer)((0, SessionUtils_1.getSession)(), report, false, policy);
    var arePaymentsEnabled = (0, PolicyUtils_1.arePaymentsEnabled)(policy);
    var isReportApproved = (0, ReportUtils_1.isReportApproved)({ report: report });
    var isReportClosed = (0, ReportUtils_1.isClosedReport)(report);
    var isReportClosedOrApproved = isReportClosed || isReportApproved;
    if (isReportPayer && arePaymentsEnabled && isReportClosedOrApproved) {
        return true;
    }
    var isReportReimbursed = (0, ReportUtils_1.isSettled)(report);
    var connectedIntegration = (0, PolicyUtils_1.getConnectedIntegration)(policy);
    var syncEnabled = (0, PolicyUtils_1.hasIntegrationAutoSync)(policy, connectedIntegration);
    var isReportFinished = isReportClosedOrApproved || isReportReimbursed;
    if (!isReportFinished) {
        return false;
    }
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isExporter = (0, PolicyUtils_1.isPreferredExporter)(policy);
    return (isAdmin && syncEnabled) || (isExporter && !syncEnabled);
}
function isHoldAction(report, chatReport, reportTransactions, reportActions) {
    var transactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, reportActions);
    var isOneExpenseReport = reportTransactions.length === 1;
    var transaction = reportTransactions.at(0);
    if ((!!reportActions && !transactionThreadReportID) || !isOneExpenseReport || !transaction) {
        return false;
    }
    return !!reportActions && isHoldActionForTransaction(report, transaction, reportActions);
}
function isHoldActionForTransaction(report, reportTransaction, reportActions) {
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    var isIOUReport = (0, ReportUtils_1.isIOUReport)(report);
    var iouOrExpenseReport = isExpenseReport || isIOUReport;
    var action = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, reportTransaction.transactionID);
    var canHoldRequest = (0, ReportUtils_1.canHoldUnholdReportAction)(action).canHoldRequest;
    if (!iouOrExpenseReport || !canHoldRequest) {
        return false;
    }
    var isReportOnHold = (0, TransactionUtils_1.isOnHold)(reportTransaction);
    if (isReportOnHold) {
        return false;
    }
    var isOpenReport = (0, ReportUtils_1.isOpenReport)(report);
    var isSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var isReportManager = (0, ReportUtils_1.isReportManager)(report);
    if (isOpenReport && (isSubmitter || isReportManager)) {
        return true;
    }
    var isProcessingReport = (0, ReportUtils_1.isProcessingReport)(report);
    return isProcessingReport;
}
function isChangeWorkspaceAction(report, policies) {
    var _a;
    var availablePolicies = Object.values(policies !== null && policies !== void 0 ? policies : {}).filter(function (newPolicy) { return (0, ReportUtils_1.isWorkspaceEligibleForReportChange)(newPolicy, report, policies); });
    var hasAvailablePolicies = availablePolicies.length > 1;
    if (!hasAvailablePolicies && availablePolicies.length === 1) {
        hasAvailablePolicies = !report.policyID || report.policyID !== ((_a = availablePolicies === null || availablePolicies === void 0 ? void 0 : availablePolicies.at(0)) === null || _a === void 0 ? void 0 : _a.id);
    }
    var reportPolicy = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report.policyID)];
    return hasAvailablePolicies && (0, ReportUtils_1.canEditReportPolicy)(report, reportPolicy);
}
function isDeleteAction(report, reportTransactions, reportActions, policy) {
    var _a, _b;
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    var isIOUReport = (0, ReportUtils_1.isIOUReport)(report);
    var isUnreported = (0, ReportUtils_1.isSelfDM)(report);
    var transaction = reportTransactions.at(0);
    var transactionID = transaction === null || transaction === void 0 ? void 0 : transaction.transactionID;
    var isOwner = transactionID ? ((_a = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, transactionID)) === null || _a === void 0 ? void 0 : _a.actorAccountID) === (0, Report_1.getCurrentUserAccountID)() : false;
    var isReportOpenOrProcessing = (0, ReportUtils_1.isOpenReport)(report) || (0, ReportUtils_1.isProcessingReport)(report);
    var isSingleTransaction = reportTransactions.length === 1;
    if (isUnreported) {
        return isOwner;
    }
    // Users cannot delete a report in the unreported or IOU cases, but they can delete individual transactions.
    // So we check if the reportTransactions length is 1 which means they're viewing a single transaction and thus can delete it.
    if (isIOUReport) {
        return isSingleTransaction && isOwner && isReportOpenOrProcessing;
    }
    if (isExpenseReport) {
        var isCardTransactionWithCorporateLiability = isSingleTransaction && (0, TransactionUtils_1.isCardTransaction)(transaction) && ((_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.liabilityType) === CONST_1.default.TRANSACTION.LIABILITY_TYPE.RESTRICT;
        if (isCardTransactionWithCorporateLiability) {
            return false;
        }
        var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
        var isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL : false;
        var isForwarded = (0, ReportUtils_1.isProcessingReport)(report) && isApprovalEnabled && !(0, ReportUtils_1.isAwaitingFirstLevelApproval)(report);
        return isReportSubmitter && isReportOpenOrProcessing && !isForwarded;
    }
    return false;
}
function isRetractAction(report, policy) {
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    // This should be removed after we change how instant submit works
    var isInstantSubmit = (0, PolicyUtils_1.isInstantSubmitEnabled)(policy);
    if (!isExpenseReport || isInstantSubmit) {
        return false;
    }
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    if (!isReportSubmitter) {
        return false;
    }
    var isProcessingReport = (0, ReportUtils_1.isProcessingReport)(report);
    if (!isProcessingReport) {
        return false;
    }
    return true;
}
function isReopenAction(report, policy) {
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    if (!isExpenseReport) {
        return false;
    }
    var isClosedReport = (0, ReportUtils_1.isClosedReport)(report);
    if (!isClosedReport) {
        return false;
    }
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    if (!isAdmin) {
        return false;
    }
    return true;
}
function getSecondaryReportActions(_a) {
    var report = _a.report, chatReport = _a.chatReport, reportTransactions = _a.reportTransactions, violations = _a.violations, policy = _a.policy, reportNameValuePairs = _a.reportNameValuePairs, reportActions = _a.reportActions, policies = _a.policies, _b = _a.isChatReportArchived, isChatReportArchived = _b === void 0 ? false : _b;
    var options = [];
    if ((0, ReportPrimaryActionUtils_1.isPrimaryPayAction)(report, policy, reportNameValuePairs) && (0, ReportUtils_1.hasOnlyHeldExpenses)(report === null || report === void 0 ? void 0 : report.reportID)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.PAY);
    }
    if (isAddExpenseAction(report, reportTransactions, isChatReportArchived || (0, ReportUtils_1.isArchivedReport)(reportNameValuePairs))) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE);
    }
    if (isSubmitAction(report, reportTransactions, policy, reportNameValuePairs, reportActions, isChatReportArchived)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.SUBMIT);
    }
    if (isApproveAction(report, reportTransactions, violations, policy)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE);
    }
    if (isUnapproveAction(report, policy)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.UNAPPROVE);
    }
    if (isCancelPaymentAction(report, reportTransactions, policy)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
    }
    if (isExportAction(report, policy, reportActions)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING);
    }
    if (isMarkAsExportedAction(report, policy)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED);
    }
    if (isRetractAction(report, policy)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.RETRACT);
    }
    if (isReopenAction(report, policy)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.REOPEN);
    }
    if (isHoldAction(report, chatReport, reportTransactions, reportActions)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.HOLD);
    }
    if (isSplitAction(report, reportTransactions, policy)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.SPLIT);
    }
    options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_CSV);
    options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF);
    if (isChangeWorkspaceAction(report, policies)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE);
    }
    options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS);
    if (isDeleteAction(report, reportTransactions, reportActions !== null && reportActions !== void 0 ? reportActions : [], policy)) {
        options.push(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE);
    }
    return options;
}
function getSecondaryTransactionThreadActions(parentReport, reportTransaction, reportActions, policy) {
    var options = [];
    if (isHoldActionForTransaction(parentReport, reportTransaction, reportActions)) {
        options.push(CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
    }
    if (isSplitAction(parentReport, [reportTransaction], policy)) {
        options.push(CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT);
    }
    options.push(CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS);
    if (isDeleteAction(parentReport, [reportTransaction], reportActions !== null && reportActions !== void 0 ? reportActions : [])) {
        options.push(CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE);
    }
    return options;
}
