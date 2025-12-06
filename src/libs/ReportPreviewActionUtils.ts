import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import {getSubmitToAccountID, getValidConnectedIntegration, hasIntegrationAutoSync, isPreferredExporter} from './PolicyUtils';
import {canPayReport, isAddExpenseAction} from './ReportPrimaryActionUtils';
import {getReportTransactions, isClosedReport, isCurrentUserSubmitter, isExpenseReport, isIOUReport, isOpenReport, isProcessingReport, isReportApproved, isSettled} from './ReportUtils';
import {getSession} from './SessionUtils';
import {isPending, isScanning} from './TransactionUtils';

function canSubmit(report: Report, isReportArchived: boolean, currentUserAccountID: number, policy?: Policy, transactions?: Transaction[]) {
    if (isReportArchived) {
        return false;
    }

    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report);
    const isOpen = isOpenReport(report);
    const isManager = report.managerID === currentUserAccountID;
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    if (!!transactions && transactions?.length > 0 && transactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const isAnyReceiptBeingScanned = transactions?.some((transaction) => isScanning(transaction));

    const submitToAccountID = getSubmitToAccountID(policy, report);

    if (submitToAccountID === report.ownerAccountID && policy?.preventSelfApproval) {
        return false;
    }

    return isExpense && (isSubmitter || isManager || isAdmin) && isOpen && !isAnyReceiptBeingScanned && !!transactions && transactions.length > 0;
}

function canApprove(report: Report, currentUserAccountID: number, policy?: Policy, transactions?: Transaction[]) {
    const isExpense = isExpenseReport(report);
    const isProcessing = isProcessingReport(report);
    const isApprovalEnabled = policy?.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const managerID = report.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserManager = managerID === currentUserAccountID;
    const reportTransactions = transactions ?? getReportTransactions(report?.reportID);
    const isAnyReceiptBeingScanned = transactions?.some((transaction) => isScanning(transaction));

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

    return isExpense && isProcessing && !!isApprovalEnabled && reportTransactions.length > 0 && isCurrentUserManager;
}

function canPay(report: Report, isReportArchived: boolean, currentUserAccountID: number, policy?: Policy, invoiceReceiverPolicy?: Policy) {
    if (isIOUReport(report) && isSettled(report)) {
        return false;
    }

    return canPayReport({
        report,
        policy,
        session: getSession(),
        currentUserAccountID,
        invoiceReceiverPolicy,
        isArchived: isReportArchived,
    });
}

function canExport(report: Report, policy?: Policy) {
    const isExpense = isExpenseReport(report);
    const isExporter = policy ? isPreferredExporter(policy) : false;
    const isReimbursed = isSettled(report);
    const isClosed = isClosedReport(report);
    const isApproved = isReportApproved({report});
    const connectedIntegration = getValidConnectedIntegration(policy);
    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);

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

    return isApproved || isReimbursed || isClosed;
}

function getReportPreviewAction(
    isReportArchived: boolean,
    currentUserAccountID: number,
    report: Report | undefined,
    policy: Policy | undefined,
    transactions: Transaction[],
    invoiceReceiverPolicy?: Policy,
    isPaidAnimationRunning?: boolean,
    isApprovedAnimationRunning?: boolean,
    isSubmittingAnimationRunning?: boolean,
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
    if (isAddExpenseAction(report, transactions ?? [], isReportArchived)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE;
    }

    if (canSubmit(report, isReportArchived, currentUserAccountID, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, currentUserAccountID, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, isReportArchived, currentUserAccountID, policy, invoiceReceiverPolicy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }

    return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}

export default getReportPreviewAction;
