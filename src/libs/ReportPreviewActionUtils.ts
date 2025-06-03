import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, ReportAction, ReportActions, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverMember} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {
    arePaymentsEnabled,
    getCorrectedAutoReportingFrequency,
    getSubmitToAccountID,
    getValidConnectedIntegration,
    hasIntegrationAutoSync,
    isPolicyAdmin,
    isPreferredExporter,
} from './PolicyUtils';
import {isAddExpenseAction} from './ReportPrimaryActionUtils';
import {
    getMoneyRequestSpendBreakdown,
    getParentReport,
    getReportTransactions,
    hasExportError as hasExportErrorUtil,
    hasMissingSmartscanFields,
    hasNoticeTypeViolations,
    hasViolations,
    hasWarningTypeViolations,
    isClosedReport,
    isCurrentUserSubmitter,
    isExpenseReport,
    isExported as isExportedUtil,
    isInvoiceReport,
    isIOUReport,
    isOpenExpenseReport,
    isOpenReport,
    isPayer,
    isProcessingReport,
    isReportApproved,
    isReportManuallyReimbursed,
    isSettled,
} from './ReportUtils';
import {getSession} from './SessionUtils';
import {allHavePendingRTERViolation, isReceiptBeingScanned, shouldShowBrokenConnectionViolationForMultipleTransactions} from './TransactionUtils';

function canSubmit(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, transactions?: Transaction[]) {
    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isOpen = isOpenReport(report);
    const isManager = report.managerID === getCurrentUserAccountID();
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
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

    return isExpense && (isSubmitter || isManager || isAdmin) && isOpen && isManualSubmitEnabled && !hasAnyViolations && !isAnyReceiptBeingScanned;
}

function canApprove(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, transactions?: Transaction[], shouldConsiderViolations = true) {
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

    return isExpense && isApprover && isProcessing && !!isApprovalEnabled && (!hasAnyViolations || !shouldConsiderViolations) && reportTransactions.length > 0 && isCurrentUserManager;
}

function canPay(
    report: Report,
    violations: OnyxCollection<TransactionViolation[]>,
    policy?: Policy,
    isReportArchived = false,
    invoiceReceiverPolicy?: Policy,
    shouldConsiderViolations = true,
) {
    if (isReportArchived) {
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
    const isReportFinished = (isApproved || isClosed) && !report.isWaitingOnBankAccount;
    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const isReimbursed = isSettled(report);

    const hasAnyViolations =
        hasViolations(report.reportID, violations) || hasNoticeTypeViolations(report.reportID, violations, true) || hasWarningTypeViolations(report.reportID, violations, true);

    if (isExpense && isReportPayer && isPaymentsEnabled && isReportFinished && (!hasAnyViolations || !shouldConsiderViolations) && reimbursableSpend > 0) {
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

    return invoiceReceiverPolicy?.role === CONST.POLICY.ROLE.ADMIN;
}

function canExport(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, reportActions?: OnyxEntry<ReportActions> | ReportAction[]) {
    const isExpense = isExpenseReport(report);
    const isExporter = policy ? isPreferredExporter(policy) : false;
    const isReimbursed = isSettled(report);
    const isClosed = isClosedReport(report);
    const isApproved = isReportApproved({report});
    const connectedIntegration = getValidConnectedIntegration(policy);
    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);
    const hasAnyViolations =
        hasViolations(report.reportID, violations) || hasNoticeTypeViolations(report.reportID, violations, true) || hasWarningTypeViolations(report.reportID, violations, true);

    if (!connectedIntegration || !isExpense || !isExporter) {
        return false;
    }

    const isExported = isExportedUtil(reportActions);
    if (isExported) {
        return false;
    }

    const hasExportError = hasExportErrorUtil(reportActions);
    if (syncEnabled && !hasExportError) {
        return false;
    }

    if (report.isWaitingOnBankAccount) {
        return false;
    }

    return (isApproved || isReimbursed || isClosed) && !hasAnyViolations;
}

function canReview(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy, transactions?: Transaction[], isReportArchived = false) {
    const hasAnyViolations =
        hasMissingSmartscanFields(report.reportID, transactions) ||
        hasViolations(report.reportID, violations) ||
        hasNoticeTypeViolations(report.reportID, violations, true) ||
        hasWarningTypeViolations(report.reportID, violations, true);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isOpen = isOpenExpenseReport(report);
    const isReimbursed = isSettled(report);

    if (
        !hasAnyViolations ||
        isReimbursed ||
        (!(isSubmitter && isOpen && policy?.areWorkflowsEnabled) &&
            !canApprove(report, violations, policy, transactions, false) &&
            !canPay(report, violations, policy, isReportArchived, policy, false))
    ) {
        return false;
    }

    // We handle RTER violations independently because those are not configured via policy workflows
    const isAdmin = isPolicyAdmin(policy);
    const transactionIDs = transactions?.map((transaction) => transaction.transactionID) ?? [];
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactionIDs, violations);
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, report, policy, violations);

    if (hasAllPendingRTERViolations || (shouldShowBrokenConnectionViolation && (!isAdmin || isSubmitter) && !isReportApproved({report}) && !isReportManuallyReimbursed(report))) {
        return true;
    }

    if (policy) {
        return !!policy.areWorkflowsEnabled || isSubmitter;
    }

    return true;
}

function getReportPreviewAction(
    violations: OnyxCollection<TransactionViolation[]>,
    report?: Report,
    policy?: Policy,
    transactions?: Transaction[],
    isReportArchived = false,
    reportActions?: OnyxEntry<ReportActions> | ReportAction[],
    invoiceReceiverPolicy?: Policy,
): ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS> {
    if (!report) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
    }
    if (isAddExpenseAction(report, transactions ?? [])) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE;
    }
    if (canSubmit(report, violations, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, violations, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, violations, policy, isReportArchived, invoiceReceiverPolicy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, violations, policy, reportActions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }
    if (canReview(report, violations, policy, transactions, isReportArchived)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW;
    }

    return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}

export default getReportPreviewAction;
