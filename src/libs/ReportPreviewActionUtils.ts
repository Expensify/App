import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverMember} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {arePaymentsEnabled, getConnectedIntegration, getCorrectedAutoReportingFrequency, hasAccountingConnections, hasIntegrationAutoSync, isPrefferedExporter} from './PolicyUtils';
import {
    getReportTransactions,
    hasViolations as hasAnyViolations,
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

function canSubmit(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy) {
    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isOpen = isOpenReport(report);
    const isManualSubmitEnabled = getCorrectedAutoReportingFrequency(policy) === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    const hasViolations = hasAnyViolations(report.reportID, violations);
    return isExpense && isSubmitter && isOpen && isManualSubmitEnabled && !hasViolations;
}

function canApprove(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, transactions?: Transaction[]) {
    const isExpense = isExpenseReport(report);
    const isApprover = isApproverMember(policy, getCurrentUserAccountID());
    const isProcessing = isProcessingReport(report);
    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
    const hasViolations = hasAnyViolations(report.reportID, violations);
    const reportTransactions = transactions ?? getReportTransactions(report?.reportID);
    return isExpense && isApprover && isProcessing && isApprovalEnabled && !hasViolations && reportTransactions.length > 0;
}

function canPay(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy) {
    const isReportPayer = isPayer(getSession(), report, false, policy);
    const isExpense = isExpenseReport(report);
    const isPaymentsEnabled = arePaymentsEnabled(policy);
    const isProcessing = isProcessingReport(report);
    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
    const isSubmittedWithoutApprovalsEnabled = !isApprovalEnabled && isProcessing;
    const isApproved = isReportApproved({report}) || isSubmittedWithoutApprovalsEnabled;
    const isClosed = isClosedReport(report);
    const hasViolations = hasAnyViolations(report.reportID, violations);
    const isInvoice = isInvoiceReport(report);
    const isIOU = isIOUReport(report);

    if (!isReportPayer) {
        return false;
    }
    return (isExpense && isPaymentsEnabled && (isApproved || isClosed) && !hasViolations) || ((isInvoice || isIOU) && isProcessing);
}

function canExport(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy) {
    const isExpense = isExpenseReport(report);
    const isExporter = policy ? isPrefferedExporter(policy) : false;
    const isApproved = isReportApproved({report});
    const isReimbursed = isSettled(report);
    const isClosed = isClosedReport(report);
    const hasAccountingConnection = hasAccountingConnections(policy);
    const connectedIntegration = getConnectedIntegration(policy);
    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);
    const hasViolations = hasAnyViolations(report.reportID, violations);
    if (isExpense && isExporter && hasAccountingConnection && !syncEnabled && !hasViolations) {
        return isApproved || isReimbursed || isClosed;
    }
    return false;
}

function canReview(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy) {
    const hasViolations = hasAnyViolations(report.reportID, violations);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isApprover = isApproverMember(policy, getCurrentUserAccountID());
    const areWorkflowsEnabled = policy ? policy.areWorkflowsEnabled : false;
    return hasViolations && (isSubmitter || isApprover) && areWorkflowsEnabled;
}

function getReportPreviewAction(
    violations: OnyxCollection<TransactionViolation[]>,
    report?: Report,
    policy?: Policy,
    transactions?: Transaction[],
): ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS> {
    if (!report) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
    }
    if (canSubmit(report, violations, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, violations, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, violations, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, violations, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }
    if (canReview(report, violations, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW;
    }

    return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}

export default getReportPreviewAction;
