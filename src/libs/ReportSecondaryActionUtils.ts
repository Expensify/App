import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApprovedMember} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {arePaymentsEnabled, getCorrectedAutoReportingFrequency, hasAccountingConnections, isAutoSyncEnabled, isPrefferedExporter} from './PolicyUtils';
import {getReportActions, getReportActionsLength} from './ReportActionsUtils';
import {
    isClosedReport,
    isCurrentUserSubmitter,
    isExpenseReport,
    isExported,
    isHoldCreator,
    isInvoiceReport,
    isIOUReport,
    isOpenReport,
    isPayer,
    isProcessingReport,
    isReportApproved,
} from './ReportUtils';
import {getSession} from './SessionUtils';
import {allHavePendingRTERViolation, isDuplicate, isOnHold as isOnHoldTransactionUtils, shouldShowBrokenConnectionViolationForMultipleTransactions} from './TransactionUtils';

function isSubmitAction(report: Report, policy: Policy): boolean {
    const isExpense = isExpenseReport(report);

    if (!isExpense) {
        return false;
    }

    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    if (!isSubmitter && !isApprover) {
        return false;
    }
    const isOpen = isOpenReport(report);
    if (!isOpen) {
        return false;
    }

    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);

    const isScheduledSubmitEnabled = policy?.harvesting?.enabled && autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;

    return !!isScheduledSubmitEnabled;
}

function isApproveAction(report: Report, policy: Policy, reportTransactions: Transaction[], violations: OnyxCollection<TransactionViolation[]>): boolean {
    const isExpense = isExpenseReport(report);
    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    const isProcessing = isProcessingReport(report);
    const hasDuplicates = reportTransactions.some((transaction) => isDuplicate(transaction.transactionID));

    if (isExpense && isApprover && isProcessing && hasDuplicates) {
        return true;
    }

    const transactionIDs = reportTransactions.map((t) => t.transactionID);

    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactionIDs, violations);

    if (hasAllPendingRTERViolations) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, report, policy, violations);

    const userControllsReport = isApprover || isAdmin;
    return userControllsReport && shouldShowBrokenConnectionViolation;
}

function isUnapproveAction(report: Report, policy: Policy): boolean {
    const isExpense = isExpenseReport(report);
    const isApprover = isApprovedMember(policy, getCurrentUserAccountID());
    const isApproved = isReportApproved({report});

    return isExpense && isApprover && isApproved;
}

function isCancelPaymentAction(report: Report, policy: Policy, reportTransactions: Transaction[], violations: OnyxCollection<TransactionViolation[]>): boolean {
    const isExpense = isExpenseReport(report);
    if (!isExpense) {
        return false;
    }

    const isPaidElsewhere = report.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;

    if (isPaidElsewhere) {
        return true;
    }

    const isPaymentProcessing = true; // TODO
    const hasDailyNachaCutoffPassed = false; // TODO
    return isPaymentProcessing && !hasDailyNachaCutoffPassed;
}

function isExportAction(report: Report, policy: Policy): boolean {
    const isInvoice = isInvoiceReport(report);
    const isSender = true; // TODO is sender the same as submitter?
    if (isInvoice && isSender) {
        return true;
    }

    const isExpense = isExpenseReport(report);

    const hasAccountingConnection = hasAccountingConnections(policy);

    if (!isExpense || !hasAccountingConnection) {
        return false;
    }

    const isApproved = isReportApproved({report});
    const isReportPayer = isPayer(getSession(), report, false, policy);
    const isPaymentsEnabled = arePaymentsEnabled(policy);
    const isClosed = isClosedReport(report);

    if (isReportPayer && isPaymentsEnabled && (isApproved || isClosed)) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isReimbursed = report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const syncEnabled = isAutoSyncEnabled(policy);
    const isReportExported = isExported(getReportActions(report));
    const isFinished = isApproved || isReimbursed || isClosed;

    return isAdmin && isFinished && syncEnabled && !isReportExported;
}

function isMarkAsExportedAction(report: Report, policy: Policy, reportTransactions: Transaction[], violations: OnyxCollection<TransactionViolation[]>): boolean {
    return false;
}

function isHoldAction(report: Report, policy: Policy, reportTransactions: Transaction[]): boolean {
    const isExpense = isExpenseReport(report);
    if (!isExpense) {
        return false;
    }

    const isOnHold = reportTransactions.some(isOnHoldTransactionUtils);

    if (isOnHold) {
        return false;
    }

    const isOpen = isOpenReport(report);
    const isProcessing = isProcessingReport(report);
    const isApproved = isReportApproved({report});

    return isOpen || isProcessing || isApproved;
}


function getSecondaryAction(
    report: Report,
    policy: Policy,
    reportTransactions: Transaction[],
    violations: OnyxCollection<TransactionViolation[]>,
): Array<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> {
    const options: Array<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> = [];
    options.push(CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD);
    options.push(CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS);

    if (isSubmitAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    }

    if (isApproveAction(report, policy, reportTransactions, violations)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    }

    if (isUnapproveAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE);
    }

    if (isCancelPaymentAction(report, policy, reportTransactions, violations)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
    }

    if (isExportAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING);
    }

    if (isMarkAsExportedAction(report, policy, reportTransactions, violations)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED);
    }

    if (isHoldAction(report, policy, reportTransactions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.HOLD);
    }

    if (isChangeWorkspaceAction(report, policy, reportTransactions, violations)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE);
    }

    return options;
}

export default getSecondaryAction;
