import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {BankAccountList, Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import {arePaymentsEnabled, getSubmitToAccountID, getValidConnectedIntegration, hasIntegrationAutoSync, isPreferredExporter} from './PolicyUtils';
import {isAddExpenseAction} from './ReportPrimaryActionUtils';
import {
    getMoneyRequestSpendBreakdown,
    getParentReport,
    getReportTransactions,
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
import {hasSmartScanFailedOrNoRouteViolation, isPending, isScanning} from './TransactionUtils';

function canSubmit(
    report: Report,
    isReportArchived: boolean,
    currentUserAccountID: number,
    currentUserEmail: string,
    violations?: OnyxCollection<TransactionViolation[]>,
    policy?: Policy,
    transactions?: Transaction[],
) {
    if (isReportArchived) {
        return false;
    }

    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report);
    const isOpen = isOpenReport(report);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    // For OPEN reports, managerID might be stale. Use getSubmitToAccountID for accurate approver check.
    const submitToAccountID = getSubmitToAccountID(policy, report);
    const isApprover = submitToAccountID === currentUserAccountID;

    if (!!transactions && transactions?.length > 0 && transactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const isAnyReceiptBeingScanned = transactions?.some((transaction) => isScanning(transaction));

    if (transactions?.some((transaction) => hasSmartScanFailedOrNoRouteViolation(transaction, violations, currentUserEmail, currentUserAccountID, report, policy))) {
        return false;
    }

    if (submitToAccountID === report.ownerAccountID && policy?.preventSelfApproval) {
        return false;
    }

    return isExpense && (isSubmitter || isApprover || isAdmin) && isOpen && !isAnyReceiptBeingScanned && !!transactions && transactions.length > 0;
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

function canPay(
    report: Report,
    isReportArchived: boolean,
    currentUserAccountID: number,
    currentUserLogin: string,
    bankAccountList: OnyxEntry<BankAccountList>,
    policy?: Policy,
    invoiceReceiverPolicy?: Policy,
) {
    if (isReportArchived) {
        return false;
    }

    const isReportPayer = isPayer(currentUserAccountID, currentUserLogin, report, bankAccountList, policy, false);
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

    const isExported = report.isExportedToIntegration ?? false;
    const hasExportError = report?.hasExportError ?? false;
    const didExportFail = !isExported && hasExportError;

    if (isExpense && isReportPayer && isPaymentsEnabled && isReportFinished && reimbursableSpend !== 0) {
        return !didExportFail;
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
        return parentReport?.invoiceReceiver?.accountID === currentUserAccountID;
    }

    return invoiceReceiverPolicy?.role === CONST.POLICY.ROLE.ADMIN && reimbursableSpend > 0;
}

function canExport(report: Report, currentUserLogin: string, policy?: Policy) {
    const isExpense = isExpenseReport(report);
    const isExporter = policy ? isPreferredExporter(policy, currentUserLogin) : false;
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

function getReportPreviewAction({
    isReportArchived,
    currentUserAccountID,
    currentUserLogin,
    report,
    policy,
    transactions,
    bankAccountList,
    invoiceReceiverPolicy,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    isSubmittingAnimationRunning,
    isDEWSubmitPending,
    violationsData,
}: {
    isReportArchived: boolean;
    currentUserAccountID: number;
    currentUserLogin: string;
    report: Report | undefined;
    policy: Policy | undefined;
    transactions: Transaction[];
    bankAccountList: OnyxEntry<BankAccountList>;
    invoiceReceiverPolicy?: Policy;
    isPaidAnimationRunning?: boolean;
    isApprovedAnimationRunning?: boolean;
    isSubmittingAnimationRunning?: boolean;
    isDEWSubmitPending?: boolean;
    violationsData?: OnyxCollection<TransactionViolation[]>;
}): ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS> {
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

    if (isDEWSubmitPending && isOpenReport(report)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
    }

    if (canSubmit(report, isReportArchived, currentUserAccountID, currentUserLogin, violationsData, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT;
    }
    if (canApprove(report, currentUserAccountID, policy, transactions)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE;
    }
    if (canPay(report, isReportArchived, currentUserAccountID, currentUserLogin, bankAccountList, policy, invoiceReceiverPolicy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY;
    }
    if (canExport(report, currentUserLogin, policy)) {
        return CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING;
    }

    return CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW;
}

export default getReportPreviewAction;
