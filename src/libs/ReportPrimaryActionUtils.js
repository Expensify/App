"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportPrimaryAction = getReportPrimaryAction;
exports.getTransactionThreadPrimaryAction = getTransactionThreadPrimaryAction;
exports.isAddExpenseAction = isAddExpenseAction;
exports.isPrimaryPayAction = isPrimaryPayAction;
exports.getAllExpensesToHoldIfApplicable = getAllExpensesToHoldIfApplicable;
var CONST_1 = require("@src/CONST");
var Member_1 = require("./actions/Policy/Member");
var Report_1 = require("./actions/Report");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var ReportUtils_1 = require("./ReportUtils");
var SessionUtils_1 = require("./SessionUtils");
var TransactionUtils_1 = require("./TransactionUtils");
function isAddExpenseAction(report, reportTransactions, isChatReportArchived) {
    if (isChatReportArchived === void 0) { isChatReportArchived = false; }
    if (isChatReportArchived) {
        return false;
    }
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var canAddTransaction = (0, ReportUtils_1.canAddTransaction)(report);
    return isExpenseReport && canAddTransaction && isReportSubmitter && reportTransactions.length === 0;
}
function isSubmitAction(report, reportTransactions, policy, reportNameValuePairs, reportActions) {
    if ((0, ReportUtils_1.isArchivedReport)(reportNameValuePairs)) {
        return false;
    }
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var isOpenReport = (0, ReportUtils_1.isOpenReport)(report);
    var isManualSubmitEnabled = (0, PolicyUtils_1.getCorrectedAutoReportingFrequency)(policy) === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    var transactionAreComplete = reportTransactions.every(function (transaction) { return transaction.amount !== 0 || transaction.modifiedAmount !== 0; });
    if (reportTransactions.length > 0 && reportTransactions.every(function (transaction) { return (0, TransactionUtils_1.isPending)(transaction); })) {
        return false;
    }
    var isAnyReceiptBeingScanned = reportTransactions === null || reportTransactions === void 0 ? void 0 : reportTransactions.some(function (transaction) { return (0, TransactionUtils_1.isScanning)(transaction); });
    var hasReportBeenReopened = (0, ReportUtils_1.hasReportBeenReopened)(reportActions);
    if (isAnyReceiptBeingScanned) {
        return false;
    }
    var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, report);
    if (submitToAccountID === report.ownerAccountID && (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval)) {
        return false;
    }
    var baseIsSubmit = isExpenseReport && isReportSubmitter && isOpenReport && reportTransactions.length !== 0 && transactionAreComplete;
    if (hasReportBeenReopened && baseIsSubmit) {
        return true;
    }
    return isManualSubmitEnabled && baseIsSubmit;
}
function isApproveAction(report, reportTransactions, policy) {
    var _a;
    var isAnyReceiptBeingScanned = reportTransactions === null || reportTransactions === void 0 ? void 0 : reportTransactions.some(function (transaction) { return (0, TransactionUtils_1.isScanning)(transaction); });
    if (isAnyReceiptBeingScanned) {
        return false;
    }
    var currentUserAccountID = (0, Report_1.getCurrentUserAccountID)();
    var managerID = (_a = report === null || report === void 0 ? void 0 : report.managerID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var isCurrentUserManager = managerID === currentUserAccountID;
    if (!isCurrentUserManager) {
        return false;
    }
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    var isApprovalEnabled = (policy === null || policy === void 0 ? void 0 : policy.approvalMode) && policy.approvalMode !== CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL;
    if (!isExpenseReport || !isApprovalEnabled || reportTransactions.length === 0) {
        return false;
    }
    var isPreventSelfApprovalEnabled = policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval;
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    if (isPreventSelfApprovalEnabled && isReportSubmitter) {
        return false;
    }
    var isOneExpenseReport = isExpenseReport && reportTransactions.length === 1;
    var isReportOnHold = reportTransactions.some(TransactionUtils_1.isOnHold);
    var isProcessingReport = (0, ReportUtils_1.isProcessingReport)(report);
    var isOneExpenseReportOnHold = isOneExpenseReport && isReportOnHold;
    if (isProcessingReport || isOneExpenseReportOnHold) {
        return true;
    }
    return false;
}
function isPrimaryPayAction(report, policy, reportNameValuePairs, isChatReportArchived, invoiceReceiverPolicy) {
    var _a, _b;
    if ((0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) || isChatReportArchived) {
        return false;
    }
    var isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
    var isReportPayer = (0, ReportUtils_1.isPayer)((0, SessionUtils_1.getSession)(), report, false, policy);
    var arePaymentsEnabled = (0, PolicyUtils_1.arePaymentsEnabled)(policy);
    var isReportApproved = (0, ReportUtils_1.isReportApproved)({ report: report });
    var isReportClosed = (0, ReportUtils_1.isClosedReport)(report);
    var isProcessingReport = (0, ReportUtils_1.isProcessingReport)(report);
    var isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL : false;
    var isSubmittedWithoutApprovalsEnabled = !isApprovalEnabled && isProcessingReport;
    var isReportFinished = (isReportApproved && !report.isWaitingOnBankAccount) || isSubmittedWithoutApprovalsEnabled || isReportClosed;
    var reimbursableSpend = (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(report).reimbursableSpend;
    if (isReportPayer && isExpenseReport && arePaymentsEnabled && isReportFinished && reimbursableSpend > 0) {
        return true;
    }
    if (!isProcessingReport) {
        return false;
    }
    var isIOUReport = (0, ReportUtils_1.isIOUReport)(report);
    if (isIOUReport && isReportPayer && reimbursableSpend > 0) {
        return true;
    }
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(report);
    if (!isInvoiceReport) {
        return false;
    }
    var parentReport = (0, ReportUtils_1.getParentReport)(report);
    if (((_a = parentReport === null || parentReport === void 0 ? void 0 : parentReport.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return ((_b = parentReport === null || parentReport === void 0 ? void 0 : parentReport.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.accountID) === (0, Report_1.getCurrentUserAccountID)();
    }
    return (invoiceReceiverPolicy === null || invoiceReceiverPolicy === void 0 ? void 0 : invoiceReceiverPolicy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
}
function isExportAction(report, policy, reportActions) {
    if (!policy) {
        return false;
    }
    var connectedIntegration = (0, PolicyUtils_1.getValidConnectedIntegration)(policy);
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(report);
    if (!connectedIntegration || isInvoiceReport) {
        return false;
    }
    var isReportExporter = (0, PolicyUtils_1.isPreferredExporter)(policy);
    if (!isReportExporter) {
        return false;
    }
    var syncEnabled = (0, PolicyUtils_1.hasIntegrationAutoSync)(policy, connectedIntegration);
    var isExported = (0, ReportUtils_1.isExported)(reportActions);
    if (isExported) {
        return false;
    }
    var hasExportError = (0, ReportUtils_1.hasExportError)(reportActions);
    if (syncEnabled && !hasExportError) {
        return false;
    }
    if (report.isWaitingOnBankAccount) {
        return false;
    }
    var isReportReimbursed = (0, ReportUtils_1.isSettled)(report);
    var isReportApproved = (0, ReportUtils_1.isReportApproved)({ report: report });
    var isReportClosed = (0, ReportUtils_1.isClosedReport)(report);
    if (isReportApproved || isReportReimbursed || isReportClosed) {
        return true;
    }
    return false;
}
function isRemoveHoldAction(report, chatReport, reportTransactions) {
    var isReportOnHold = reportTransactions.some(TransactionUtils_1.isOnHold);
    if (!isReportOnHold) {
        return false;
    }
    var reportActions = (0, ReportActionsUtils_1.getAllReportActions)(report.reportID);
    var transactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, reportActions);
    if (!transactionThreadReportID) {
        return false;
    }
    // Transaction is attached to expense report but hold action is attached to transaction thread report
    var isHolder = reportTransactions.some(function (transaction) { return (0, ReportUtils_1.isHoldCreator)(transaction, transactionThreadReportID); });
    return isHolder;
}
function isReviewDuplicatesAction(report, reportTransactions, policy) {
    var hasDuplicates = reportTransactions.some(function (transaction) { return (0, TransactionUtils_1.isDuplicate)(transaction); });
    if (!hasDuplicates) {
        return false;
    }
    var isReportApprover = (0, Member_1.isApprover)(policy, (0, Report_1.getCurrentUserAccountID)());
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var isProcessingReport = (0, ReportUtils_1.isProcessingReport)(report);
    var isReportOpen = (0, ReportUtils_1.isOpenReport)(report);
    var isSubmitterOrApprover = isReportSubmitter || isReportApprover;
    var isReportActive = isReportOpen || isProcessingReport;
    if (isSubmitterOrApprover && isReportActive) {
        return true;
    }
    return false;
}
function isMarkAsCashAction(report, reportTransactions, violations, policy) {
    var isOneExpenseReport = (0, ReportUtils_1.isExpenseReport)(report) && reportTransactions.length === 1;
    if (!isOneExpenseReport) {
        return false;
    }
    var transactionIDs = reportTransactions.map(function (t) { return t.transactionID; });
    var hasAllPendingRTERViolations = (0, TransactionUtils_1.allHavePendingRTERViolation)(reportTransactions, violations);
    if (hasAllPendingRTERViolations) {
        return true;
    }
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var isReportApprover = (0, Member_1.isApprover)(policy, (0, Report_1.getCurrentUserAccountID)());
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var shouldShowBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolationForMultipleTransactions)(transactionIDs, report, policy, violations);
    var userControlsReport = isReportSubmitter || isReportApprover || isAdmin;
    return userControlsReport && shouldShowBrokenConnectionViolation;
}
function getAllExpensesToHoldIfApplicable(report, reportActions) {
    if (!report || !reportActions || !(0, ReportUtils_1.hasOnlyHeldExpenses)(report === null || report === void 0 ? void 0 : report.reportID)) {
        return [];
    }
    return reportActions === null || reportActions === void 0 ? void 0 : reportActions.filter(function (action) { return (0, ReportActionsUtils_1.isMoneyRequestAction)(action) && action.childType === CONST_1.default.REPORT.TYPE.CHAT && (0, ReportUtils_1.canHoldUnholdReportAction)(action).canUnholdRequest; });
}
function getReportPrimaryAction(params) {
    var report = params.report, reportTransactions = params.reportTransactions, violations = params.violations, policy = params.policy, reportNameValuePairs = params.reportNameValuePairs, reportActions = params.reportActions, isChatReportArchived = params.isChatReportArchived, chatReport = params.chatReport, invoiceReceiverPolicy = params.invoiceReceiverPolicy;
    var isPayActionWithAllExpensesHeld = isPrimaryPayAction(report, policy, reportNameValuePairs, isChatReportArchived) && (0, ReportUtils_1.hasOnlyHeldExpenses)(report === null || report === void 0 ? void 0 : report.reportID);
    if (isAddExpenseAction(report, reportTransactions, isChatReportArchived)) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.ADD_EXPENSE;
    }
    if (isMarkAsCashAction(report, reportTransactions, violations, policy)) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH;
    }
    if (isReviewDuplicatesAction(report, reportTransactions, policy)) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES;
    }
    if (isRemoveHoldAction(report, chatReport, reportTransactions) || isPayActionWithAllExpensesHeld) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD;
    }
    if (isSubmitAction(report, reportTransactions, policy, reportNameValuePairs, reportActions)) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.SUBMIT;
    }
    if (isApproveAction(report, reportTransactions, policy)) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.APPROVE;
    }
    if (isPrimaryPayAction(report, policy, reportNameValuePairs, isChatReportArchived, invoiceReceiverPolicy)) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.PAY;
    }
    if (isExportAction(report, policy, reportActions)) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING;
    }
    if (getAllExpensesToHoldIfApplicable(report, reportActions).length) {
        return CONST_1.default.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD;
    }
    return '';
}
function isMarkAsCashActionForTransaction(parentReport, violations, policy) {
    var hasPendingRTERViolation = (0, TransactionUtils_1.hasPendingRTERViolation)(violations);
    if (hasPendingRTERViolation) {
        return true;
    }
    var shouldShowBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolation)(parentReport, policy, violations);
    if (!shouldShowBrokenConnectionViolation) {
        return false;
    }
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(parentReport.reportID);
    var isReportApprover = (0, Member_1.isApprover)(policy, (0, Report_1.getCurrentUserAccountID)());
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    return isReportSubmitter || isReportApprover || isAdmin;
}
function getTransactionThreadPrimaryAction(transactionThreadReport, parentReport, reportTransaction, violations, policy) {
    if ((0, ReportUtils_1.isHoldCreator)(reportTransaction, transactionThreadReport.reportID)) {
        return CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD;
    }
    if (isReviewDuplicatesAction(parentReport, [reportTransaction], policy)) {
        return CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES;
    }
    if (isMarkAsCashActionForTransaction(parentReport, violations, policy)) {
        return CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH;
    }
    return '';
}
