import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverMember} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {
    arePaymentsEnabled,
    getConnectedIntegration,
    getCorrectedAutoReportingFrequency,
    getSubmitToAccountID,
    hasAccountingConnections,
    hasIntegrationAutoSync,
    isPrefferedExporter,
} from './PolicyUtils';
import {
    getMoneyRequestSpendBreakdown,
    getParentReport,
    getReportTransactions,
    hasMissingSmartscanFields,
    hasNoticeTypeViolations,
    hasViolations,
    hasWarningTypeViolations,
    isArchivedReport,
    isClosedReport,
    isCurrentUserSubmitter,
    isExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isOpenReport,
    isPayer,
    isProcessingReport,
    isReportApproved,
    isSettled,
} from './ReportUtils';
import {getSession} from './SessionUtils';
import {isReceiptBeingScanned} from './TransactionUtils';

function canSubmit(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, transactions?: Transaction[]) {
    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isOpen = isOpenReport(report);
    const isManualSubmitEnabled = getCorrectedAutoReportingFrequency(policy) === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    const hasAnyViolations =
        hasMissingSmartscanFields(report.reportID, transactions) ||
        hasViolations(report.reportID, violations) ||
        hasNoticeTypeViolations(report.reportID, violations, true) ||
        hasWarningTypeViolations(report.reportID, violations, true);
    const isAnyReceiptBeingScanned = transactions?.some((transaction) => isReceiptBeingScanned(transaction));

    const submitToAccountID = getSubmitToAccountID(policy, report);

    if (submitToAccountID === report.ownerAccountID && policy?.preventSelfApproval) {
        return false;
    }

    return isExpense && isSubmitter && isOpen && isManualSubmitEnabled && !hasAnyViolations && !isAnyReceiptBeingScanned;
}

function canApprove(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, transactions?: Transaction[]) {
    const currentUserID = getCurrentUserAccountID();
    const isExpense = isExpenseReport(report);
    const isApprover = isApproverMember(policy, currentUserID);
    const isProcessing = isProcessingReport(report);
    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
    const managerID = report?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserManager = managerID === currentUserID;
    const hasAnyViolations =
        hasMissingSmartscanFields(report.reportID, transactions) ||
        hasViolations(report.reportID, violations) ||
        hasNoticeTypeViolations(report.reportID, violations, true) ||
        hasWarningTypeViolations(report.reportID, violations, true);
    const reportTransactions = transactions ?? getReportTransactions(report?.reportID);

    const isPreventSelfApprovalEnabled = policy?.preventSelfApproval;
    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);

    if (isPreventSelfApprovalEnabled && isReportSubmitter) {
        return false;
    }

    return isExpense && isApprover && isProcessing && isApprovalEnabled && !hasAnyViolations && reportTransactions.length > 0 && isCurrentUserManager;
}

function canPay(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, reportNameValuePairs?: ReportNameValuePairs) {
    const isChatReportArchived = isArchivedReport(reportNameValuePairs);

    if (isChatReportArchived) {
        return false;
    }

    const isReportPayer = isPayer(getSession(), report, false, policy);
    const isExpense = isExpenseReport(report);
    const isPaymentsEnabled = arePaymentsEnabled(policy);
    const isProcessing = isProcessingReport(report);
    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
    const isSubmittedWithoutApprovalsEnabled = !isApprovalEnabled && isProcessing;
    const isApproved = isReportApproved({report}) || isSubmittedWithoutApprovalsEnabled;
    const isClosed = isClosedReport(report);
    const isReportFinished = isApproved || isClosed;
    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const isReimbursed = isSettled(report);

    const hasAnyViolations =
        hasViolations(report.reportID, violations) || hasNoticeTypeViolations(report.reportID, violations, true) || hasWarningTypeViolations(report.reportID, violations, true);

    if (isExpense && isReportPayer && isPaymentsEnabled && isReportFinished && !hasAnyViolations && reimbursableSpend > 0) {
        return true;
    }

    if (!isProcessing) {
        return false;
    }

    const isIOU = isIOUReport(report);

    if (isIOU && isReportPayer && !isReimbursed && reimbursableSpend > 0) {
        return true;
    }

    const isInvoice = isInvoiceReport(report);

    if (!isInvoice) {
        return false;
    }

    const parentReport = getParentReport(report);
    if (parentReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return parentReport?.invoiceReceiver?.accountID === getCurrentUserAccountID();
    }

    return policy?.role === CONST.POLICY.ROLE.ADMIN;
}

function canExport(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy) {
    const isExpense = isExpenseReport(report);
    const isExporter = policy ? isPrefferedExporter(policy) : false;
    const isReimbursed = isSettled(report);
    const isClosed = isClosedReport(report);
    const isApproved = isReportApproved({report});
    const hasAccountingConnection = hasAccountingConnections(policy);
    const connectedIntegration = getConnectedIntegration(policy);
    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);
    const hasAnyViolations =
        hasViolations(report.reportID, violations) || hasNoticeTypeViolations(report.reportID, violations, true) || hasWarningTypeViolations(report.reportID, violations, true);

    if (!hasAccountingConnection || !isExpense || !isExporter) {
        return false;
    }

    if (syncEnabled) {
        return false;
    }

    return (isApproved || isReimbursed || isClosed) && !hasAnyViolations;
}

function canReview(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, transactions?: Transaction[]) {
    const hasAnyViolations =
        hasMissingSmartscanFields(report.reportID, transactions) ||
        hasViolations(report.reportID, violations) ||
        hasNoticeTypeViolations(report.reportID, violations, true) ||
        hasWarningTypeViolations(report.reportID, violations, true);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isReimbursed = isSettled(report);
    const isApprover = isApproverMember(policy, getCurrentUserAccountID());

    if (!hasAnyViolations || !(isSubmitter || isApprover) || isReimbursed) {
        return false;
    }

    if (policy) {
        return !!policy.areWorkflowsEnabled;
    }

    return true;
}

function getReportPreviewAction(
    violations: OnyxCollection<TransactionViolation[]>,
    report?: Report,
    policy?: Policy,
    transactions?: Transaction[],
    reportNameValuePairs?: ReportNameValuePairs,
): ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS> {
    if (!report) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
    }
    if (canSubmit(report, violations, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, violations, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, violations, policy, reportNameValuePairs)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, violations, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }
    if (canReview(report, violations, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW;
    }

    return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}

export default getReportPreviewAction;
