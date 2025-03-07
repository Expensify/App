import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApprovedMember} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {arePaymentsEnabled, getCorrectedAutoReportingFrequency, hasAccountingConnections, isAutoSyncEnabled, isPrefferedExporter} from './PolicyUtils';
import {
    hasReportViolations,
    isClosedReport,
    isCurrentUserSubmitter,
    isExpenseReport,
    isHoldCreator,
    isInvoiceReport,
    isIOUReport,
    isOpenReport,
    isPayer,
    isProcessingReport,
    isReportApproved,
    isSettled,
} from './ReportUtils';
import {getSession} from './SessionUtils';

function canSubmit(report: Report, policy: Policy) {
    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isOpen = isOpenReport(report);
    const isManualSubmitEnabled = getCorrectedAutoReportingFrequency(policy) === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    const hasViolations = hasReportViolations(report.reportID);

    return isExpense && isSubmitter && isOpen && isManualSubmitEnabled && !hasViolations;
}

function canApprove(report: Report, policy: Policy) {
    const isExpense = isExpenseReport(report);
    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    const isProcessing = isProcessingReport(report);
    const isApprovalEnabled = policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const hasViolations = hasReportViolations(report.reportID);

    return isExpense && isApprover && isProcessing && isApprovalEnabled && !hasViolations;
}

function canPay(report: Report, policy: Policy) {
    const isReportPayer = isPayer(getSession(), report, false, policy);
    const isExpense = isExpenseReport(report);
    const isPaymentsEnabled = arePaymentsEnabled(policy);
    const isApproved = isReportApproved({report});
    const isClosed = isClosedReport(report);
    const hasViolations = hasReportViolations(report.reportID);
    const isInvoice = isInvoiceReport(report);
    const isIOU = isIOUReport(report);
    const isProcessing = isProcessingReport(report);

    return isReportPayer && ((isExpense && isPaymentsEnabled && (isApproved || isClosed) && !hasViolations) || ((isInvoice || isIOU) && isReportPayer && isProcessing));
}

function canExport(report: Report, policy: Policy) {
    const isExpense = isExpenseReport(report);
    const isExporter = isPrefferedExporter(policy);
    const isApproved = isReportApproved({report});
    const isReimbursed = isSettled(report);
    const isClosed = isClosedReport(report);
    const hasAccountingConnection = hasAccountingConnections(policy);
    const syncEnabled = isAutoSyncEnabled(policy);
    const hasViolations = hasReportViolations(report.reportID);

    return isExpense && isExporter && (isApproved || isReimbursed || isClosed) && hasAccountingConnection && !syncEnabled && !hasViolations;
}

function canRemoveHold(report: Report, policy: Policy, reportTransactions: Transaction[]) {
    const isExpense = isExpenseReport(report);
    const isHolder = reportTransactions.some((transaction) => isHoldCreator(transaction, report.reportID));
    const isOpen = isOpenReport(report);
    const isProcessing = isProcessingReport(report);
    const isApproved = isReportApproved({report});
    const hasViolations = hasReportViolations(report.reportID);

    return isExpense && isHolder && (isOpen || isProcessing || isApproved) && !hasViolations;
}

function canReview(report: Report, policy: Policy) {
    const hasViolations = hasReportViolations(report.reportID);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    const areWorkflowsEnabled = policy.areWorkflowsEnabled;

    return hasViolations && (isSubmitter || isApprover) && areWorkflowsEnabled;
}

function getReportPreviewAction(report: Report, policy: Policy, reportTransactions: Transaction[], violations: TransactionViolation[]): ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS> {
    if (canSubmit(report, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }
    if (canRemoveHold(report, policy, reportTransactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.REMOVE_HOLD;
    }
    if (canReview(report, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW;
    }

    return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}

export default getReportPreviewAction;
