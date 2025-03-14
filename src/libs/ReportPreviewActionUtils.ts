import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApprovedMember} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {arePaymentsEnabled, getCorrectedAutoReportingFrequency, hasAccountingConnections, isAutoSyncEnabled, isPrefferedExporter} from './PolicyUtils';
import {
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

function canSubmit(report: Report, policy: Policy, violations: OnyxCollection<TransactionViolation[]>) {
    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isOpen = isOpenReport(report);
    const isManualSubmitEnabled = getCorrectedAutoReportingFrequency(policy) === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
    const hasViolations = hasAnyViolations(report.reportID, violations);

    return isExpense && isSubmitter && isOpen && isManualSubmitEnabled && !hasViolations;
}

function canApprove(report: Report, policy: Policy, violations: OnyxCollection<TransactionViolation[]>) {
    const isExpense = isExpenseReport(report);
    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    const isProcessing = isProcessingReport(report);
    const isApprovalEnabled = policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const hasViolations = hasAnyViolations(report.reportID, violations);

    return isExpense && isApprover && isProcessing && isApprovalEnabled && !hasViolations;
}

function canPay(report: Report, policy: Policy, violations: OnyxCollection<TransactionViolation[]>) {
    const isReportPayer = isPayer(getSession(), report, false, policy);
    const isExpense = isExpenseReport(report);
    const isPaymentsEnabled = arePaymentsEnabled(policy);
    const isApproved = isReportApproved({report});
    const isClosed = isClosedReport(report);
    const hasViolations = hasAnyViolations(report.reportID, violations);
    const isInvoice = isInvoiceReport(report);
    const isIOU = isIOUReport(report);
    const isProcessing = isProcessingReport(report);

    return isReportPayer && ((isExpense && isPaymentsEnabled && (isApproved || isClosed) && !hasViolations) || ((isInvoice || isIOU) && isProcessing));
}

function canExport(report: Report, policy: Policy, violations: OnyxCollection<TransactionViolation[]>) {
    const isExpense = isExpenseReport(report);
    const isExporter = isPrefferedExporter(policy);
    const isApproved = isReportApproved({report});
    const isReimbursed = isSettled(report);
    const isClosed = isClosedReport(report);
    const hasAccountingConnection = hasAccountingConnections(policy);
    const syncEnabled = isAutoSyncEnabled(policy);
    const hasViolations = hasAnyViolations(report.reportID, violations);

    return isExpense && isExporter && (isApproved || isReimbursed || isClosed) && hasAccountingConnection && !syncEnabled && !hasViolations;
}


function canReview(report: Report, policy: Policy, violations: OnyxCollection<TransactionViolation[]>) {
    const hasViolations = hasAnyViolations(report.reportID, violations);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    const areWorkflowsEnabled = policy.areWorkflowsEnabled;
    return hasViolations && (isSubmitter || isApprover) && areWorkflowsEnabled;
}

function getReportPreviewAction(
    report: Report,
    policy: Policy,
    reportTransactions: Transaction[],
    violations: OnyxCollection<TransactionViolation[]>,
): ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS> {
    if (canSubmit(report, policy, violations)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, policy, violations)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, policy, violations)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, policy, violations)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }
    if (canReview(report, policy, violations)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW;
    }

    return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}

export {getReportPreviewAction, canSubmit, canApprove, canPay, canExport, canReview, hasAnyViolations};
