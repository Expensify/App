import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import {getCurrentUserAccountID} from './actions/Report';
import {arePaymentsEnabled, getSubmitToAccountID, getValidConnectedIntegration, hasIntegrationAutoSync, isPolicyAdmin, isPreferredExporter} from './PolicyUtils';
import {isAddExpenseAction} from './ReportPrimaryActionUtils';
import {
    getMoneyRequestSpendBreakdown,
    getParentReport,
    getReportTransactions,
    hasAnyViolations as hasAnyViolationsUtil,
    hasMissingSmartscanFields,
    isClosedReport,
    isCurrentUserSubmitter,
    isExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isOpenExpenseReport,
    isOpenReport,
    isPayer,
    isProcessingReport,
    isReportApproved,
    isReportManuallyReimbursed,
    isSettled,
    shouldBlockSubmitDueToStrictPolicyRules,
} from './ReportUtils';
import {getSession} from './SessionUtils';
import {allHavePendingRTERViolation, isPending, isScanning, shouldShowBrokenConnectionViolationForMultipleTransactions} from './TransactionUtils';
import ViolationsUtils from './Violations/ViolationsUtils';

function canSubmit(report: Report, violations: OnyxCollection<TransactionViolation[]>, isReportArchived: boolean, policy?: Policy, transactions?: Transaction[]) {
    if (isReportArchived) {
        return false;
    }

    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report);
    const isOpen = isOpenReport(report);
    const isManager = report.managerID === getCurrentUserAccountID();
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    if (!!transactions && transactions?.length > 0 && transactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const hasAnyViolations = hasMissingSmartscanFields(report.reportID, transactions) || hasAnyViolationsUtil(report.reportID, violations);

    const isAnyReceiptBeingScanned = transactions?.some((transaction) => isScanning(transaction));

    const submitToAccountID = getSubmitToAccountID(policy, report);

    if (submitToAccountID === report.ownerAccountID && policy?.preventSelfApproval) {
        return false;
    }

    return isExpense && (isSubmitter || isManager || isAdmin) && isOpen && !hasAnyViolations && !isAnyReceiptBeingScanned && !!transactions && transactions.length > 0;
}

function canApprove(
    report: Report,
    violations: OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    policy: Policy | undefined,
    transactions: Transaction[],
    shouldConsiderViolations = true,
) {
    const currentUserID = getCurrentUserAccountID();
    const isExpense = isExpenseReport(report);
    const isProcessing = isProcessingReport(report);
    const isApprovalEnabled = policy?.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const managerID = report.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserManager = managerID === currentUserID;

    // We should consider only visible violations for the approver, invisible violations should not block approval
    const reportTransactions = transactions.length ? transactions : getReportTransactions(report?.reportID);
    const hasAnyVisibleViolations =
        hasMissingSmartscanFields(report.reportID, reportTransactions) || ViolationsUtils.hasVisibleViolationsForUser(report, violations, currentUserEmail, policy, reportTransactions);
    const isAnyReceiptBeingScanned = reportTransactions?.some((transaction) => isScanning(transaction));

    if (isAnyReceiptBeingScanned) {
        return false;
    }

    if (reportTransactions.length > 0 && reportTransactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const isPreventSelfApprovalEnabled = policy?.preventSelfApproval;
    const isReportSubmitter = isCurrentUserSubmitter(report);

    if (isPreventSelfApprovalEnabled && isReportSubmitter) {
        return false;
    }

    return isExpense && isProcessing && !!isApprovalEnabled && (!hasAnyVisibleViolations || !shouldConsiderViolations) && reportTransactions.length > 0 && isCurrentUserManager;
}

function canPay(
    report: Report,
    violations: OnyxCollection<TransactionViolation[]>,
    isReportArchived: boolean,
    policy?: Policy,
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

    const hasAnyViolations = hasAnyViolationsUtil(report.reportID, violations);

    if (isExpense && isReportPayer && isPaymentsEnabled && isReportFinished && (!hasAnyViolations || !shouldConsiderViolations) && reimbursableSpend !== 0) {
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
    if (parentReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL && reimbursableSpend > 0) {
        return parentReport?.invoiceReceiver?.accountID === getCurrentUserAccountID();
    }

    return invoiceReceiverPolicy?.role === CONST.POLICY.ROLE.ADMIN && reimbursableSpend > 0;
}

function canExport(report: Report, violations: OnyxCollection<TransactionViolation[]>, policy?: Policy) {
    const isExpense = isExpenseReport(report);
    const isExporter = policy ? isPreferredExporter(policy) : false;
    const isReimbursed = isSettled(report);
    const isClosed = isClosedReport(report);
    const isApproved = isReportApproved({report});
    const connectedIntegration = getValidConnectedIntegration(policy);
    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);
    const hasAnyViolations = hasAnyViolationsUtil(report.reportID, violations);

    if (!connectedIntegration || !isExpense || !isExporter) {
        return false;
    }

    const isExported = report.isExportedToIntegration ?? false;
    if (isExported) {
        return false;
    }

    const hasExportError = report.hasExportError ?? false;
    if (syncEnabled && !hasExportError) {
        return false;
    }

    if (report.isWaitingOnBankAccount) {
        return false;
    }

    return (isApproved || isReimbursed || isClosed) && !hasAnyViolations;
}

function canReview(
    report: Report,
    violations: OnyxCollection<TransactionViolation[]>,
    isReportArchived: boolean,
    currentUserEmail: string,
    policy: Policy | undefined,
    transactions: Transaction[],
) {
    const hasAnyViolations = hasMissingSmartscanFields(report.reportID, transactions) || hasAnyViolationsUtil(report.reportID, violations);
    const hasVisibleViolations = hasAnyViolations && ViolationsUtils.hasVisibleViolationsForUser(report, violations, currentUserEmail, policy, transactions);
    const isSubmitter = isCurrentUserSubmitter(report);
    const isOpen = isOpenExpenseReport(report);
    const isReimbursed = isSettled(report);

    if (
        !hasVisibleViolations ||
        isReimbursed ||
        (!(isSubmitter && isOpen && policy?.areWorkflowsEnabled) &&
            !canApprove(report, violations, currentUserEmail, policy, transactions, false) &&
            !canPay(report, violations, isReportArchived, policy, policy, false))
    ) {
        return false;
    }

    // We handle RTER violations independently because those are not configured via policy workflows
    const isAdmin = isPolicyAdmin(policy);
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactions, violations, currentUserEmail, report, policy);
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactions, report, policy, violations, currentUserEmail);

    if (hasAllPendingRTERViolations || (shouldShowBrokenConnectionViolation && (!isAdmin || isSubmitter) && !isReportApproved({report}) && !isReportManuallyReimbursed(report))) {
        return true;
    }

    if (policy) {
        return !!policy.areWorkflowsEnabled || isSubmitter;
    }

    return true;
}

// eslint-disable-next-line @typescript-eslint/max-params
function getReportPreviewAction(
    violations: OnyxCollection<TransactionViolation[]>,
    isReportArchived: boolean,
    currentUserEmail: string,
    report: Report | undefined,
    policy: Policy | undefined,
    transactions: Transaction[],
    invoiceReceiverPolicy?: Policy,
    isPaidAnimationRunning?: boolean,
    isApprovedAnimationRunning?: boolean,
    isSubmittingAnimationRunning?: boolean,
    areStrictPolicyRulesEnabled?: boolean,
): ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS> {
    if (!report) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
    }

    // We want to have action displayed for either paid or approved animations
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (isPaidAnimationRunning || isApprovedAnimationRunning) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }

    if (isSubmittingAnimationRunning) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (isAddExpenseAction(report, transactions, isReportArchived)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE;
    }

    // When strict policy rules are enabled and there are violations, show REVIEW button instead of SUBMIT
    const shouldBlockSubmit = shouldBlockSubmitDueToStrictPolicyRules(report.reportID, violations, areStrictPolicyRulesEnabled ?? false, transactions);
    if (shouldBlockSubmit && canReview(report, violations, isReportArchived, currentUserEmail, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW;
    }

    if (canSubmit(report, violations, isReportArchived, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, violations, currentUserEmail, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, violations, isReportArchived, policy, invoiceReceiverPolicy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, violations, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }
    if (canReview(report, violations, isReportArchived, currentUserEmail, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW;
    }

    return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}

export {canReview, getReportPreviewAction};
