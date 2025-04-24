import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverUtils} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {arePaymentsEnabled as arePaymentsEnabledUtils, getCorrectedAutoReportingFrequency, hasAccountingConnections, isAutoSyncEnabled, isPrefferedExporter} from './PolicyUtils';
import {
    isClosedReport as isClosedReportUtils,
    isCurrentUserSubmitter,
    isExpenseReport as isExpenseReportUtils,
    isHoldCreator,
    isInvoiceReport as isInvoiceReportUtils,
    isIOUReport as isIOUReportUtils,
    isOpenReport as isOpenReportUtils,
    isPayer,
    isProcessingReport as isProcessingReportUtils,
    isReportApproved as isReportApprovedUtils,
    isSettled,
} from './ReportUtils';
import {getSession} from './SessionUtils';
import {allHavePendingRTERViolation, isDuplicate, isOnHold as isOnHoldTransactionUtils, shouldShowBrokenConnectionViolationForMultipleTransactions} from './TransactionUtils';

function isSubmitAction(report: Report, policy: Policy) {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);
    const isOpenReport = isOpenReportUtils(report);
    const isManualSubmitEnabled = getCorrectedAutoReportingFrequency(policy) === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;

    return isExpenseReport && isReportSubmitter && isOpenReport && isManualSubmitEnabled;
}

function isApproveAction(report: Report, policy: Policy, reportTransactions: Transaction[]) {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());
    const isApprovalEnabled = policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;

    if (!isExpenseReport || !isReportApprover || !isApprovalEnabled) {
        return false;
    }

    const isOneExpenseReport = isExpenseReport && reportTransactions.length === 1;
    const isReportOnHold = reportTransactions.some(isOnHoldTransactionUtils);
    const isProcessingReport = isProcessingReportUtils(report);
    const isOneExpenseReportOnHold = isOneExpenseReport && isReportOnHold;

    if (isProcessingReport || isOneExpenseReportOnHold) {
        return true;
    }

    return false;
}

function isPayAction(report: Report, policy: Policy) {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportPayer = isPayer(getSession(), report, false, policy);
    const arePaymentsEnabled = arePaymentsEnabledUtils(policy);
    const isReportApproved = isReportApprovedUtils({report});
    const isReportClosed = isClosedReportUtils(report);
    const isReportFinished = isReportApproved || isReportClosed;

    if (isReportPayer && isExpenseReport && arePaymentsEnabled && isReportFinished) {
        return true;
    }

    const isProcessingReport = isProcessingReportUtils(report);
    const isInvoiceReport = isInvoiceReportUtils(report);
    const isIOUReport = isIOUReportUtils(report);

    if ((isInvoiceReport || isIOUReport) && isProcessingReport) {
        return true;
    }

    return false;
}

function isExportAction(report: Report, policy: Policy) {
    const hasAccountingConnection = hasAccountingConnections(policy);
    if (!hasAccountingConnection) {
        return false;
    }

    const isReportExporter = isPrefferedExporter(policy);
    if (!isReportExporter) {
        return false;
    }

    const syncEnabled = isAutoSyncEnabled(policy);
    if (syncEnabled) {
        return false;
    }

    const isReportReimbursed = isSettled(report);
    const isReportApproved = isReportApprovedUtils({report});
    const isReportClosed = isClosedReportUtils(report);

    if (isReportApproved || isReportReimbursed || isReportClosed) {
        return true;
    }

    return false;
}

function isRemoveHoldAction(report: Report, reportTransactions: Transaction[]) {
    const isReportOnHold = reportTransactions.some(isOnHoldTransactionUtils);
    const isHolder = reportTransactions.some((transaction) => isHoldCreator(transaction, report.reportID));

    return isReportOnHold && isHolder;
}

function isReviewDuplicatesAction(report: Report, policy: Policy, reportTransactions: Transaction[]) {
    const hasDuplicates = reportTransactions.some((transaction) => isDuplicate(transaction.transactionID));

    if (!hasDuplicates) {
        return false;
    }

    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());
    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);
    const isProcessingReport = isProcessingReportUtils(report);
    const isReportOpen = isOpenReportUtils(report);

    const isSubmitterOrApprover = isReportSubmitter || isReportApprover;
    const isReportActive = isReportOpen || isProcessingReport;

    if (isSubmitterOrApprover && isReportActive) {
        return true;
    }

    return false;
}

function isMarkAsCashAction(report: Report, policy: Policy, reportTransactions: Transaction[], violations: OnyxCollection<TransactionViolation[]>) {
    const transactionIDs = reportTransactions.map((t) => t.transactionID);
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactionIDs, violations);

    if (hasAllPendingRTERViolations) {
        return true;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);
    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, report, policy, violations);

    const userControlsReport = isReportSubmitter || isReportApprover || isAdmin;
    return userControlsReport && shouldShowBrokenConnectionViolation;
}

function getPrimaryAction(
    report: Report,
    policy: Policy,
    reportTransactions: Transaction[],
    violations: OnyxCollection<TransactionViolation[]>,
): ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '' {
    if (isSubmitAction(report, policy)) {
        return CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;
    }

    if (isApproveAction(report, policy, reportTransactions)) {
        return CONST.REPORT.PRIMARY_ACTIONS.APPROVE;
    }

    if (isPayAction(report, policy)) {
        return CONST.REPORT.PRIMARY_ACTIONS.PAY;
    }

    if (isExportAction(report, policy)) {
        return CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING;
    }

    if (isRemoveHoldAction(report, reportTransactions)) {
        return CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD;
    }

    if (isReviewDuplicatesAction(report, policy, reportTransactions)) {
        return CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES;
    }

    if (isMarkAsCashAction(report, policy, reportTransactions, violations)) {
        return CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH;
    }

    return '';
}

export default getPrimaryAction;
