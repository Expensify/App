"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canReview = canReview;
exports.getReportPreviewAction = getReportPreviewAction;
var CONST_1 = require("@src/CONST");
var Report_1 = require("./actions/Report");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportPrimaryActionUtils_1 = require("./ReportPrimaryActionUtils");
var ReportUtils_1 = require("./ReportUtils");
var SessionUtils_1 = require("./SessionUtils");
var TransactionUtils_1 = require("./TransactionUtils");
function canSubmit(report, violations, reportActions, policy, transactions, isReportArchived) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (isReportArchived) {
        return false;
    }
    var isExpense = (0, ReportUtils_1.isExpenseReport)(report);
    var isSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var isOpen = (0, ReportUtils_1.isOpenReport)(report);
    var isManager = report.managerID === (0, Report_1.getCurrentUserAccountID)();
    var isAdmin = (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var hasBeenReopened = (0, ReportUtils_1.hasReportBeenReopened)(reportActions);
    var isManualSubmitEnabled = (0, PolicyUtils_1.getCorrectedAutoReportingFrequency)(policy) === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    if (!!transactions && (transactions === null || transactions === void 0 ? void 0 : transactions.length) > 0 && transactions.every(function (transaction) { return (0, TransactionUtils_1.isPending)(transaction); })) {
        return false;
    }
    var hasAnyViolations = (0, ReportUtils_1.hasMissingSmartscanFields)(report.reportID, transactions) ||
        (0, ReportUtils_1.hasViolations)(report.reportID, violations) ||
        (0, ReportUtils_1.hasNoticeTypeViolations)(report.reportID, violations, true) ||
        (0, ReportUtils_1.hasWarningTypeViolations)(report.reportID, violations, true);
    var isAnyReceiptBeingScanned = transactions === null || transactions === void 0 ? void 0 : transactions.some(function (transaction) { return (0, TransactionUtils_1.isScanning)(transaction); });
    var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, report);
    if (submitToAccountID === report.ownerAccountID && (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval)) {
        return false;
    }
    var baseCanSubmit = isExpense && (isSubmitter || isManager || isAdmin) && isOpen && !hasAnyViolations && !isAnyReceiptBeingScanned;
    // If a report has been reopened, we allow submission regardless of the auto reporting frequency.
    if (baseCanSubmit && hasBeenReopened) {
        return true;
    }
    return baseCanSubmit && isManualSubmitEnabled;
}
function canApprove(report, violations, policy, transactions, shouldConsiderViolations) {
    var _a;
    if (shouldConsiderViolations === void 0) { shouldConsiderViolations = true; }
    var currentUserID = (0, Report_1.getCurrentUserAccountID)();
    var isExpense = (0, ReportUtils_1.isExpenseReport)(report);
    var isProcessing = (0, ReportUtils_1.isProcessingReport)(report);
    var isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL : false;
    var managerID = (_a = report === null || report === void 0 ? void 0 : report.managerID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    var isCurrentUserManager = managerID === currentUserID;
    var hasAnyViolations = (0, ReportUtils_1.hasMissingSmartscanFields)(report.reportID, transactions) ||
        (0, ReportUtils_1.hasViolations)(report.reportID, violations) ||
        (0, ReportUtils_1.hasNoticeTypeViolations)(report.reportID, violations, true) ||
        (0, ReportUtils_1.hasWarningTypeViolations)(report.reportID, violations, true);
    var reportTransactions = transactions !== null && transactions !== void 0 ? transactions : (0, ReportUtils_1.getReportTransactions)(report === null || report === void 0 ? void 0 : report.reportID);
    var isAnyReceiptBeingScanned = transactions === null || transactions === void 0 ? void 0 : transactions.some(function (transaction) { return (0, TransactionUtils_1.isScanning)(transaction); });
    if (isAnyReceiptBeingScanned) {
        return false;
    }
    var isPreventSelfApprovalEnabled = policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval;
    var isReportSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    if (isPreventSelfApprovalEnabled && isReportSubmitter) {
        return false;
    }
    return isExpense && isProcessing && !!isApprovalEnabled && (!hasAnyViolations || !shouldConsiderViolations) && reportTransactions.length > 0 && isCurrentUserManager;
}
function canPay(report, violations, policy, isReportArchived, invoiceReceiverPolicy, shouldConsiderViolations) {
    var _a, _b;
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (shouldConsiderViolations === void 0) { shouldConsiderViolations = true; }
    if (isReportArchived) {
        return false;
    }
    var isReportPayer = (0, ReportUtils_1.isPayer)((0, SessionUtils_1.getSession)(), report, false, policy);
    var isExpense = (0, ReportUtils_1.isExpenseReport)(report);
    var isPaymentsEnabled = (0, PolicyUtils_1.arePaymentsEnabled)(policy);
    var isProcessing = (0, ReportUtils_1.isProcessingReport)(report);
    var isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL : false;
    var isSubmittedWithoutApprovalsEnabled = !isApprovalEnabled && isProcessing;
    var isApproved = (0, ReportUtils_1.isReportApproved)({ report: report }) || isSubmittedWithoutApprovalsEnabled;
    var isClosed = (0, ReportUtils_1.isClosedReport)(report);
    var isReportFinished = (isApproved || isClosed) && !report.isWaitingOnBankAccount;
    var reimbursableSpend = (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(report).reimbursableSpend;
    var isReimbursed = (0, ReportUtils_1.isSettled)(report);
    var hasAnyViolations = (0, ReportUtils_1.hasViolations)(report.reportID, violations) || (0, ReportUtils_1.hasNoticeTypeViolations)(report.reportID, violations, true) || (0, ReportUtils_1.hasWarningTypeViolations)(report.reportID, violations, true);
    if (isExpense && isReportPayer && isPaymentsEnabled && isReportFinished && (!hasAnyViolations || !shouldConsiderViolations) && reimbursableSpend > 0) {
        return true;
    }
    if (!isProcessing) {
        return false;
    }
    var isIOU = (0, ReportUtils_1.isIOUReport)(report);
    if (isIOU && isReportPayer && !isReimbursed && reimbursableSpend > 0) {
        return true;
    }
    var isInvoice = (0, ReportUtils_1.isInvoiceReport)(report);
    if (!isInvoice) {
        return false;
    }
    var parentReport = (0, ReportUtils_1.getParentReport)(report);
    if (((_a = parentReport === null || parentReport === void 0 ? void 0 : parentReport.invoiceReceiver) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return ((_b = parentReport === null || parentReport === void 0 ? void 0 : parentReport.invoiceReceiver) === null || _b === void 0 ? void 0 : _b.accountID) === (0, Report_1.getCurrentUserAccountID)();
    }
    return (invoiceReceiverPolicy === null || invoiceReceiverPolicy === void 0 ? void 0 : invoiceReceiverPolicy.role) === CONST_1.default.POLICY.ROLE.ADMIN;
}
function canExport(report, violations, policy, reportActions) {
    var isExpense = (0, ReportUtils_1.isExpenseReport)(report);
    var isExporter = policy ? (0, PolicyUtils_1.isPreferredExporter)(policy) : false;
    var isReimbursed = (0, ReportUtils_1.isSettled)(report);
    var isClosed = (0, ReportUtils_1.isClosedReport)(report);
    var isApproved = (0, ReportUtils_1.isReportApproved)({ report: report });
    var connectedIntegration = (0, PolicyUtils_1.getValidConnectedIntegration)(policy);
    var syncEnabled = (0, PolicyUtils_1.hasIntegrationAutoSync)(policy, connectedIntegration);
    var hasAnyViolations = (0, ReportUtils_1.hasViolations)(report.reportID, violations) || (0, ReportUtils_1.hasNoticeTypeViolations)(report.reportID, violations, true) || (0, ReportUtils_1.hasWarningTypeViolations)(report.reportID, violations, true);
    if (!connectedIntegration || !isExpense || !isExporter) {
        return false;
    }
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
    return (isApproved || isReimbursed || isClosed) && !hasAnyViolations;
}
function canReview(report, violations, policy, transactions, isReportArchived) {
    var _a;
    if (isReportArchived === void 0) { isReportArchived = false; }
    var hasAnyViolations = (0, ReportUtils_1.hasMissingSmartscanFields)(report.reportID, transactions) ||
        (0, ReportUtils_1.hasViolations)(report.reportID, violations) ||
        (0, ReportUtils_1.hasNoticeTypeViolations)(report.reportID, violations, true) ||
        (0, ReportUtils_1.hasWarningTypeViolations)(report.reportID, violations, true);
    var isSubmitter = (0, ReportUtils_1.isCurrentUserSubmitter)(report.reportID);
    var isOpen = (0, ReportUtils_1.isOpenExpenseReport)(report);
    var isReimbursed = (0, ReportUtils_1.isSettled)(report);
    if (!hasAnyViolations ||
        isReimbursed ||
        (!(isSubmitter && isOpen && (policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled)) &&
            !canApprove(report, violations, policy, transactions, false) &&
            !canPay(report, violations, policy, isReportArchived, policy, false))) {
        return false;
    }
    // We handle RTER violations independently because those are not configured via policy workflows
    var isAdmin = (0, PolicyUtils_1.isPolicyAdmin)(policy);
    var transactionIDs = (_a = transactions === null || transactions === void 0 ? void 0 : transactions.map(function (transaction) { return transaction.transactionID; })) !== null && _a !== void 0 ? _a : [];
    var hasAllPendingRTERViolations = (0, TransactionUtils_1.allHavePendingRTERViolation)(transactions, violations);
    var shouldShowBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolationForMultipleTransactions)(transactionIDs, report, policy, violations);
    if (hasAllPendingRTERViolations || (shouldShowBrokenConnectionViolation && (!isAdmin || isSubmitter) && !(0, ReportUtils_1.isReportApproved)({ report: report }) && !(0, ReportUtils_1.isReportManuallyReimbursed)(report))) {
        return true;
    }
    if (policy) {
        return !!policy.areWorkflowsEnabled || isSubmitter;
    }
    return true;
}
function getReportPreviewAction(violations, report, policy, transactions, isReportArchived, reportActions, invoiceReceiverPolicy) {
    if (isReportArchived === void 0) { isReportArchived = false; }
    if (!report) {
        return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
    }
    if ((0, ReportPrimaryActionUtils_1.isAddExpenseAction)(report, transactions !== null && transactions !== void 0 ? transactions : [], isReportArchived)) {
        return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE;
    }
    if (canSubmit(report, violations, reportActions, policy, transactions, isReportArchived)) {
        return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, violations, policy, transactions)) {
        return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, violations, policy, isReportArchived, invoiceReceiverPolicy)) {
        return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, violations, policy, reportActions)) {
        return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }
    if (canReview(report, violations, policy, transactions, isReportArchived)) {
        return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW;
    }
    return CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}
