import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApprovedMember} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {hasAccountingConnections, isAutoSyncEnabled, isPrefferedExporter} from './PolicyUtils';
import {
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
} from './ReportUtils';
import {getSession} from './SessionUtils';
import {isDuplicate, isOnHold as isOnHoldTransactionUtils} from './TransactionUtils';

function isSubmitAction(report: Report) {
    const isExpense = isExpenseReport(report);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isOpen = isOpenReport(report); 
    const isManualSubmitEnabled = true; // TODO how to find it?

    return isExpense && isSubmitter && isOpen && isManualSubmitEnabled;
}

function isApproveAction(report: Report, policy: Policy, reportTransactions: Transaction[]) {
    const isExpense = isExpenseReport(report);
    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    const isApprovalEnabled = policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL; // TODO verify

    if (!isExpense || !isApprover || !isApprovalEnabled) {
        return false;
    }

    const isOneExpenseReport = isExpenseReport(report) && reportTransactions.length === 1;
    const isOnHold = reportTransactions.some(isOnHoldTransactionUtils);
    const isProcessing = isProcessingReport(report);
    const isOneExpenseReportOnHold = isOneExpenseReport && isOnHold;

    if (isProcessing || isOneExpenseReportOnHold) {
        return true;
    }

    return false;
}

function isPayAction(report: Report, policy: Policy) {
    const isExpense = isExpenseReport(report);
    const isReportPayer = isPayer(getSession(), report, false, policy);
    const isPaymentsEnabled = true; // TODO
    const isApproved = isReportApproved({report});
    const isClosed = isClosedReport(report);
    const isFinished = isApproved || isClosed;

    if (isReportPayer && isExpense && isPaymentsEnabled && isFinished) {
        return true;
    }

    const isProcessing = isProcessingReport(report);
    const isInvoice = isInvoiceReport(report);
    const isIOU = isIOUReport(report);

    if ((isInvoice || isIOU) && isProcessing) {
        return true;
    }

    return false;
}

function isExportAction(report: Report, policy: Policy) {
    const isExporter = isPrefferedExporter(policy);
    if (!isExporter) {
        return false;
    }

    const syncEnabled = isAutoSyncEnabled(policy);
    if (syncEnabled) {
        return false;
    }

    const hasAccountingConnection = hasAccountingConnections(policy);
    if (!hasAccountingConnection) {
        return false;
    }

    const isReimbursed = report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const isApproved = isReportApproved({report});
    const isClosed = isClosedReport(report);

    if (isApproved || isReimbursed || isClosed) {
        return true;
    }

    return false;
}

function isRemoveHoldAction(report: Report, reportTransactions: Transaction[]) {
    const isOnHold = reportTransactions.some(isOnHoldTransactionUtils);
    const isHolder = reportTransactions.some((transaction) => isHoldCreator(transaction, report.reportID));

    return isOnHold && isHolder;
}

function isReviewDuplicatesAction(report: Report, policy: Policy, reportTransactions: Transaction[]) {
    const hasDuplicates = reportTransactions.some((transaction) => isDuplicate(transaction.transactionID));

    if (!hasDuplicates) {
        return false;
    }

    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isProcessing = isProcessingReport(report);
    const isOpen = isOpenReport(report);

    const isSubmitterOrApprover = isSubmitter || isApprover;
    const isActive = isOpen || isProcessing;

    if (isSubmitterOrApprover && isActive) {
        return true;
    }

    return false;
}

function isMarkAsCashAction(report: Report, violations: TransactionViolation[]) {
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const hasReceiptMatchViolation = violations.some((violation) => violation.name === CONST.VIOLATIONS.CASH_EXPENSE_WITH_NO_RECEIPT); // TODO

    return isSubmitter && hasReceiptMatchViolation;
}

function getPrimaryAction(report: Report, policy: Policy, reportTransactions: Transaction[], violations: TransactionViolation[]): ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | undefined {
    if (isSubmitAction(report)) {
        return CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;
    }

    if (isApproveAction(report, policy, reportTransactions)) {
        return CONST.REPORT.PRIMARY_ACTIONS.APPROVE;
    }

    if (isPayAction(report, policy)) {
        return CONST.REPORT.PRIMARY_ACTIONS.PAY;
    }

    if (isExportAction(report, policy)) {
        return CONST.REPORT.PRIMARY_ACTIONS.EXPORT;
    }

    if (isRemoveHoldAction(report, reportTransactions)) {
        return CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD;
    }

    if (isReviewDuplicatesAction(report, policy, reportTransactions)) {
        return CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES;
    }

    if (isMarkAsCashAction(report, violations)) {
        return CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH;
    }
}

export default getPrimaryAction;
