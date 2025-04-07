import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverUtils} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {
    arePaymentsEnabled as arePaymentsEnabledUtils,
    getCorrectedAutoReportingFrequency,
    hasAccountingConnections,
    hasNoPolicyOtherThanPersonalType,
    isAutoSyncEnabled,
    isPrefferedExporter,
} from './PolicyUtils';
import {getIOUActionForReportID, getReportActions, isPayAction} from './ReportActionsUtils';
import {
    isClosedReport as isClosedReportUtils,
    isCurrentUserSubmitter,
    isExpenseReport as isExpenseReportUtils,
    isExported as isExportedUtils,
    isInvoiceReport as isInvoiceReportUtils,
    isIOUReport as isIOUReportUtils,
    isOpenReport as isOpenReportUtils,
    isPayer as isPayerUtils,
    isProcessingReport as isProcessingReportUtils,
    isReportApproved as isReportApprovedUtils,
    isReportManager as isReportManagerUtils,
    isSettled,
} from './ReportUtils';
import {getSession} from './SessionUtils';
import {allHavePendingRTERViolation, isDuplicate, isOnHold as isOnHoldTransactionUtils, shouldShowBrokenConnectionViolationForMultipleTransactions} from './TransactionUtils';

function isSubmitAction(report: Report, policy: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);
    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());

    if (!isReportSubmitter && !isReportApprover) {
        return false;
    }

    const isOpenReport = isOpenReportUtils(report);

    if (!isOpenReport) {
        return false;
    }

    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);

    const isScheduledSubmitEnabled = policy?.harvesting?.enabled && autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;

    return !!isScheduledSubmitEnabled;
}

function isApproveAction(report: Report, policy: Policy, reportTransactions: Transaction[], violations: OnyxCollection<TransactionViolation[]>): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());
    const isProcessingReport = isProcessingReportUtils(report);
    const reportHasDuplicatedTransactions = reportTransactions.some((transaction) => isDuplicate(transaction.transactionID));

    if (isExpenseReport && isReportApprover && isProcessingReport && reportHasDuplicatedTransactions) {
        return true;
    }

    const transactionIDs = reportTransactions.map((t) => t.transactionID);

    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactionIDs, violations);

    if (hasAllPendingRTERViolations) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, report, policy, violations);

    const userControlsReport = isReportApprover || isAdmin;
    return userControlsReport && shouldShowBrokenConnectionViolation;
}

function isUnapproveAction(report: Report, policy: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());
    const isReportApproved = isReportApprovedUtils({report});

    return isExpenseReport && isReportApprover && isReportApproved;
}

function isCancelPaymentAction(report: Report, reportTransactions: Transaction[]): boolean {
    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isReportPaidElsewhere = report.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;

    if (isReportPaidElsewhere) {
        return true;
    }

    const isPaymentProcessing = isSettled(report);

    const payActions = reportTransactions.reduce((acc, transaction) => {
        const action = getIOUActionForReportID(report.reportID, transaction.transactionID);
        if (action && isPayAction(action)) {
            acc.push(action);
        }
        return acc;
    }, [] as ReportAction[]);

    const hasDailyNachaCutoffPassed = payActions.some((action) => {
        const now = new Date();
        const paymentDatetime = new Date(action.created);
        const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
        const cutoffTimeUTC = new Date(Date.UTC(paymentDatetime.getUTCFullYear(), paymentDatetime.getUTCMonth(), paymentDatetime.getUTCDate(), 23, 45, 0));
        return nowUTC.getTime() < cutoffTimeUTC.getTime();
    });
    return isPaymentProcessing && !hasDailyNachaCutoffPassed;
}

function isExportAction(report: Report, policy: Policy): boolean {
    const isInvoiceReport = isInvoiceReportUtils(report);
    const isReportSender = isCurrentUserSubmitter(report.reportID);

    if (isInvoiceReport && isReportSender) {
        return true;
    }

    const isExpenseReport = isExpenseReportUtils(report);

    const hasAccountingConnection = hasAccountingConnections(policy);

    if (!isExpenseReport || !hasAccountingConnection) {
        return false;
    }

    const isReportApproved = isReportApprovedUtils({report});
    const isReportPayer = isPayerUtils(getSession(), report, false, policy);
    const arePaymentsEnabled = arePaymentsEnabledUtils(policy);
    const isReportClosed = isClosedReportUtils(report);

    if (isReportPayer && arePaymentsEnabled && (isReportApproved || isReportClosed)) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isReportReimbursed = report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const syncEnabled = isAutoSyncEnabled(policy);
    const isReportExported = isExportedUtils(getReportActions(report));
    const isReportFinished = isReportApproved || isReportReimbursed || isReportClosed;

    return isAdmin && isReportFinished && syncEnabled && !isReportExported;
}

function isMarkAsExportedAction(report: Report, policy: Policy): boolean {
    const isInvoiceReport = isInvoiceReportUtils(report);
    const isReportSender = isCurrentUserSubmitter(report.reportID);

    if (isInvoiceReport && isReportSender) {
        return true;
    }

    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isReportPayer = isPayerUtils(getSession(), report, false, policy);
    const arePaymentsEnabled = arePaymentsEnabledUtils(policy);
    const isReportApproved = isReportApprovedUtils({report});
    const isReportClosed = isClosedReportUtils(report);
    const isReportClosedOrApproved = isReportClosed || isReportApproved;

    if (isReportPayer && arePaymentsEnabled && isReportClosedOrApproved) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isReportReimbursed = isSettled(report);
    const hasAccountingConnection = hasAccountingConnections(policy);
    const syncEnabled = isAutoSyncEnabled(policy);
    const isReportFinished = isReportClosedOrApproved || isReportReimbursed;

    if (isAdmin && isReportFinished && hasAccountingConnection && syncEnabled) {
        return true;
    }

    const isExporter = isPrefferedExporter(policy);

    if (isExporter && isReportFinished && hasAccountingConnection && !syncEnabled) {
        return true;
    }

    return false;
}

function isHoldAction(report: Report, reportTransactions: Transaction[]): boolean {
    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isReportOnHold = reportTransactions.some(isOnHoldTransactionUtils);

    if (isReportOnHold) {
        return false;
    }

    const isOpenReport = isOpenReportUtils(report);
    const isProcessingReport = isProcessingReportUtils(report);
    const isReportApproved = isReportApprovedUtils({report});

    return isOpenReport || isProcessingReport || isReportApproved;
}

function isChangeWorkspaceAction(report: Report, policy: Policy, reportTransactions: Transaction[], violations: OnyxCollection<TransactionViolation[]>): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);
    const areWorkflowsEnabled = policy.areWorkflowsEnabled;
    const isClosedReport = isClosedReportUtils(report);

    if (isExpenseReport && isReportSubmitter && !areWorkflowsEnabled && isClosedReport) {
        return true;
    }

    const isOpenReport = isOpenReportUtils(report);
    const isProcessingReport = isProcessingReportUtils(report);

    if (isReportSubmitter && (isOpenReport || isProcessingReport)) {
        return true;
    }

    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());

    if (isReportApprover && isProcessingReport) {
        return true;
    }

    const isReportPayer = isPayerUtils(getSession(), report, false, policy);
    const isReportApproved = isReportApprovedUtils({report});

    if (isReportPayer && (isReportApproved || isClosedReport)) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isReportReimbursed = isSettled(report);
    const transactionIDs = reportTransactions.map((t) => t.transactionID);
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactionIDs, violations);

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, report, policy, violations);

    const userControlsReport = isReportSubmitter || isReportApprover || isAdmin;
    const hasReceiptMatchViolation = hasAllPendingRTERViolations || (userControlsReport && shouldShowBrokenConnectionViolation);
    const isReportExported = isExportedUtils(getReportActions(report));
    const isReportFinished = isReportApproved || isReportReimbursed || isClosedReport;

    if (isAdmin && ((!isReportExported && isReportFinished) || hasReceiptMatchViolation)) {
        return true;
    }

    const isIOUReport = isIOUReportUtils(report);
    const hasOnlyPersonalWorkspace = hasNoPolicyOtherThanPersonalType();
    const isReportReceiver = isReportManagerUtils(report);

    if (isIOUReport && !hasOnlyPersonalWorkspace && isReportReceiver && isReportReimbursed) {
        return true;
    }

    return false;
}

function isDeleteAction(report: Report): boolean {
    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);

    if (!isReportSubmitter) {
        return false;
    }

    const isReportOpen = isOpenReportUtils(report);
    const isProcessingReport = isProcessingReportUtils(report);
    const isReportApproved = isReportApprovedUtils({report});

    return isReportOpen || isProcessingReport || isReportApproved;
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

    if (isCancelPaymentAction(report, reportTransactions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
    }

    if (isExportAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING);
    }

    if (isMarkAsExportedAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED);
    }

    if (isHoldAction(report, reportTransactions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.HOLD);
    }

    if (isChangeWorkspaceAction(report, policy, reportTransactions, violations)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE);
    }

    if (isDeleteAction(report)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.DELETE);
    }

    return options;
}

export default getSecondaryAction;
