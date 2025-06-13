import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverUtils} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {
    arePaymentsEnabled as arePaymentsEnabledUtils,
    getConnectedIntegration,
    getCorrectedAutoReportingFrequency,
    getSubmitToAccountID,
    getValidConnectedIntegration,
    hasIntegrationAutoSync,
    isInstantSubmitEnabled,
    isPreferredExporter,
    isSubmitAndClose as isSubmitAndCloseUtils,
} from './PolicyUtils';
import {getIOUActionForReportID, getIOUActionForTransactionID, getOneTransactionThreadReportID, isPayAction} from './ReportActionsUtils';
import {isPrimaryPayAction} from './ReportPrimaryActionUtils';
import {
    canAddTransaction,
    canEditReportPolicy,
    canHoldUnholdReportAction,
    getTransactionDetails,
    hasOnlyHeldExpenses,
    hasReportBeenReopened as hasReportBeenReopenedUtils,
    isArchivedReport,
    isAwaitingFirstLevelApproval,
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
    isSelfDM as isSelfDMReportUtils,
    isSettled,
    isWorkspaceEligibleForReportChange,
} from './ReportUtils';
import {getSession} from './SessionUtils';
import {
    allHavePendingRTERViolation,
    getOriginalTransactionWithSplitInfo,
    hasReceipt as hasReceiptTransactionUtils,
    isCardTransaction as isCardTransactionUtils,
    isDuplicate,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isReceiptBeingScanned,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
} from './TransactionUtils';

function isAddExpenseAction(report: Report, reportTransactions: Transaction[], isReportArchived = false) {
    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);

    if (!isReportSubmitter || reportTransactions.length === 0) {
        return false;
    }

    return canAddTransaction(report, isReportArchived);
}

function isSplitAction(report: Report, reportTransactions: Transaction[], policy?: Policy): boolean {
    if (Number(reportTransactions?.length) !== 1) {
        return false;
    }

    const reportTransaction = reportTransactions.at(0);

    const isScanning = hasReceiptTransactionUtils(reportTransaction) && isReceiptBeingScanned(reportTransaction);
    if (isPending(reportTransaction) || isScanning || !!reportTransaction?.errors) {
        return false;
    }

    const {amount} = getTransactionDetails(reportTransaction) ?? {};
    if (!amount) {
        return false;
    }

    const {isExpenseSplit, isBillSplit} = getOriginalTransactionWithSplitInfo(reportTransaction);
    if (isExpenseSplit || isBillSplit) {
        return false;
    }

    if (!isExpenseReportUtils(report)) {
        return false;
    }

    if (report.stateNum && report.stateNum >= CONST.REPORT.STATE_NUM.APPROVED) {
        return false;
    }

    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = (report.managerID ?? CONST.DEFAULT_NUMBER_ID) === getCurrentUserAccountID();

    return isSubmitter || isAdmin || isManager;
}

function isSubmitAction(
    report: Report,
    reportTransactions: Transaction[],
    policy?: Policy,
    reportNameValuePairs?: ReportNameValuePairs,
    reportActions?: ReportAction[],
    isChatReportArchived = false,
): boolean {
    if (isArchivedReport(reportNameValuePairs) || isChatReportArchived) {
        return false;
    }

    const transactionAreComplete = reportTransactions.every((transaction) => transaction.amount !== 0 || transaction.modifiedAmount !== 0);

    if (!transactionAreComplete) {
        return false;
    }

    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport || report?.total === 0) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);
    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = report.managerID === getCurrentUserAccountID();
    if (!isReportSubmitter && !isReportApprover && !isAdmin && !isManager) {
        return false;
    }

    const isOpenReport = isOpenReportUtils(report);
    if (!isOpenReport) {
        return false;
    }

    const submitToAccountID = getSubmitToAccountID(policy, report);
    if (submitToAccountID === report.ownerAccountID && policy?.preventSelfApproval) {
        return false;
    }

    const hasReportBeenReopened = hasReportBeenReopenedUtils(reportActions);
    if (hasReportBeenReopened && isReportSubmitter) {
        return false;
    }

    if (isAdmin || isManager) {
        return true;
    }

    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);

    const isScheduledSubmitEnabled = policy?.harvesting?.enabled && autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;

    return !!isScheduledSubmitEnabled;
}

function isApproveAction(report: Report, reportTransactions: Transaction[], violations: OnyxCollection<TransactionViolation[]>, policy?: Policy): boolean {
    const isAnyReceiptBeingScanned = reportTransactions?.some((transaction) => isReceiptBeingScanned(transaction));

    if (isAnyReceiptBeingScanned) {
        return false;
    }

    const currentUserAccountID = getCurrentUserAccountID();
    const managerID = report?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserManager = managerID === currentUserAccountID;
    if (!isCurrentUserManager) {
        return false;
    }
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportApprover = isApproverUtils(policy, currentUserAccountID);
    const isProcessingReport = isProcessingReportUtils(report);
    const reportHasDuplicatedTransactions = reportTransactions.some((transaction) => isDuplicate(transaction.transactionID));

    const isPreventSelfApprovalEnabled = policy?.preventSelfApproval;
    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);

    if (isPreventSelfApprovalEnabled && isReportSubmitter) {
        return false;
    }

    if (isExpenseReport && isProcessingReport && reportHasDuplicatedTransactions) {
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

function isUnapproveAction(report: Report, policy?: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportApprover = isApproverUtils(policy, getCurrentUserAccountID());
    const isReportApproved = isReportApprovedUtils({report});
    const isReportSettled = isSettled(report);
    const isPaymentProcessing = report.isWaitingOnBankAccount && report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED;

    if (isReportSettled || isPaymentProcessing) {
        return false;
    }

    return isExpenseReport && isReportApprover && isReportApproved;
}

function isCancelPaymentAction(report: Report, reportTransactions: Transaction[], policy?: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isPayer = isPayerUtils(getSession(), report, false, policy);

    if (!isAdmin || !isPayer) {
        return false;
    }

    const isReportPaidElsewhere = report.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;

    if (isReportPaidElsewhere) {
        return true;
    }

    const isPaymentProcessing = !!report.isWaitingOnBankAccount && report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED;

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

function isExportAction(report: Report, policy?: Policy, reportActions?: ReportAction[]): boolean {
    if (!policy) {
        return false;
    }

    const hasAccountingConnection = !!getValidConnectedIntegration(policy);
    if (!hasAccountingConnection) {
        return false;
    }

    const isInvoiceReport = isInvoiceReportUtils(report);
    const isReportSender = isCurrentUserSubmitter(report.reportID);

    if (isInvoiceReport && isReportSender) {
        return true;
    }

    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
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
    const connectedIntegration = getConnectedIntegration(policy);
    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);
    const isReportExported = isExportedUtils(reportActions);
    const isReportFinished = isReportApproved || isReportReimbursed || isReportClosed;

    return isAdmin && isReportFinished && syncEnabled && !isReportExported;
}

function isMarkAsExportedAction(report: Report, policy?: Policy): boolean {
    if (!policy) {
        return false;
    }

    const hasAccountingConnection = !!getValidConnectedIntegration(policy);
    if (!hasAccountingConnection) {
        return false;
    }

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

    const isReportReimbursed = isSettled(report);
    const connectedIntegration = getConnectedIntegration(policy);
    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);
    const isReportFinished = isReportClosedOrApproved || isReportReimbursed;

    if (!isReportFinished) {
        return false;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const isExporter = isPreferredExporter(policy);

    return (isAdmin && syncEnabled) || (isExporter && !syncEnabled);
}

function isHoldAction(report: Report, chatReport: OnyxEntry<Report>, reportTransactions: Transaction[], reportActions?: ReportAction[]): boolean {
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions);
    const isOneExpenseReport = reportTransactions.length === 1;
    const transaction = reportTransactions.at(0);

    if ((!!reportActions && !transactionThreadReportID) || !isOneExpenseReport || !transaction) {
        return false;
    }

    return !!reportActions && isHoldActionForTransaction(report, transaction, reportActions);
}

function isHoldActionForTransaction(report: Report, reportTransaction: Transaction, reportActions: ReportAction[]): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isIOUReport = isIOUReportUtils(report);
    const iouOrExpenseReport = isExpenseReport || isIOUReport;
    const action = getIOUActionForTransactionID(reportActions, reportTransaction.transactionID);
    const {canHoldRequest} = canHoldUnholdReportAction(action);

    if (!iouOrExpenseReport || !canHoldRequest) {
        return false;
    }

    const isReportOnHold = isOnHoldTransactionUtils(reportTransaction);

    if (isReportOnHold) {
        return false;
    }

    const isOpenReport = isOpenReportUtils(report);
    const isSubmitter = isCurrentUserSubmitter(report.reportID);
    const isReportManager = isReportManagerUtils(report);

    if (isOpenReport && (isSubmitter || isReportManager)) {
        return true;
    }

    const isProcessingReport = isProcessingReportUtils(report);

    return isProcessingReport;
}

function isChangeWorkspaceAction(report: Report, policies: OnyxCollection<Policy>): boolean {
    const availablePolicies = Object.values(policies ?? {}).filter((newPolicy) => isWorkspaceEligibleForReportChange(newPolicy, report, policies));
    let hasAvailablePolicies = availablePolicies.length > 1;
    if (!hasAvailablePolicies && availablePolicies.length === 1) {
        hasAvailablePolicies = !report.policyID || report.policyID !== availablePolicies?.at(0)?.id;
    }
    const reportPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    return hasAvailablePolicies && canEditReportPolicy(report, reportPolicy);
}

function isDeleteAction(report: Report, reportTransactions: Transaction[], reportActions: ReportAction[], policy?: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isIOUReport = isIOUReportUtils(report);
    const isUnreported = isSelfDMReportUtils(report);
    const transaction = reportTransactions.at(0);
    const transactionID = transaction?.transactionID;
    const isOwner = transactionID ? getIOUActionForTransactionID(reportActions, transactionID)?.actorAccountID === getCurrentUserAccountID() : false;
    const isReportOpenOrProcessing = isOpenReportUtils(report) || isProcessingReportUtils(report);
    const isSingleTransaction = reportTransactions.length === 1;

    if (isUnreported) {
        return isOwner;
    }

    // Users cannot delete a report in the unreported or IOU cases, but they can delete individual transactions.
    // So we check if the reportTransactions length is 1 which means they're viewing a single transaction and thus can delete it.
    if (isIOUReport) {
        return isSingleTransaction && isOwner && isReportOpenOrProcessing;
    }

    if (isExpenseReport) {
        const isCardTransactionWithCorporateLiability =
            isSingleTransaction && isCardTransactionUtils(transaction) && transaction?.comment?.liabilityType === CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT;

        if (isCardTransactionWithCorporateLiability) {
            return false;
        }

        const isReportSubmitter = isCurrentUserSubmitter(report.reportID);
        const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
        const isForwarded = isProcessingReportUtils(report) && isApprovalEnabled && !isAwaitingFirstLevelApproval(report);

        return isReportSubmitter && isReportOpenOrProcessing && !isForwarded;
    }

    return false;
}

function isRetractAction(report: Report, policy?: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isSubmitAndClose = isSubmitAndCloseUtils(policy);

    // This should be removed after we change how instant submit works
    const isInstantSubmit = isInstantSubmitEnabled(policy);

    if (!isExpenseReport || isSubmitAndClose || isInstantSubmit) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report.reportID);
    if (!isReportSubmitter) {
        return false;
    }

    const isProcessingReport = isProcessingReportUtils(report);
    if (!isProcessingReport) {
        return false;
    }

    return true;
}

function isReopenAction(report: Report, policy?: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    if (!isExpenseReport) {
        return false;
    }

    const isClosedReport = isClosedReportUtils(report);
    if (!isClosedReport) {
        return false;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    if (!isAdmin) {
        return false;
    }

    return true;
}

function getSecondaryReportActions({
    report,
    chatReport,
    reportTransactions,
    violations,
    policy,
    reportNameValuePairs,
    reportActions,
    policies,
    canUseRetractNewDot,
    isChatReportArchived = false,
}: {
    report: Report;
    chatReport: OnyxEntry<Report>;
    reportTransactions: Transaction[];
    violations: OnyxCollection<TransactionViolation[]>;
    policy?: Policy;
    reportNameValuePairs?: ReportNameValuePairs;
    reportActions?: ReportAction[];
    policies?: OnyxCollection<Policy>;
    canUseRetractNewDot?: boolean;
    canUseNewDotSplits?: boolean;
    isChatReportArchived?: boolean;
}): Array<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> {
    const options: Array<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> = [];

    if (isPrimaryPayAction(report, policy, reportNameValuePairs) && hasOnlyHeldExpenses(report?.reportID)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.PAY);
    }

    if (isAddExpenseAction(report, reportTransactions, isChatReportArchived || isArchivedReport(reportNameValuePairs))) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE);
    }

    if (isSubmitAction(report, reportTransactions, policy, reportNameValuePairs, reportActions, isChatReportArchived)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    }

    if (isApproveAction(report, reportTransactions, violations, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    }

    if (isUnapproveAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE);
    }

    if (isCancelPaymentAction(report, reportTransactions, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
    }

    if (isExportAction(report, policy, reportActions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING);
    }

    if (isMarkAsExportedAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED);
    }

    if (canUseRetractNewDot && isRetractAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.RETRACT);
    }

    if (canUseRetractNewDot && isReopenAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.REOPEN);
    }

    if (isHoldAction(report, chatReport, reportTransactions, reportActions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.HOLD);
    }

    if (isSplitAction(report, reportTransactions, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.SPLIT);
    }

    options.push(CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_CSV);

    options.push(CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF);

    if (isChangeWorkspaceAction(report, policies)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE);
    }

    options.push(CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS);

    if (isDeleteAction(report, reportTransactions, reportActions ?? [], policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.DELETE);
    }

    return options;
}

function getSecondaryTransactionThreadActions(
    parentReport: Report,
    reportTransaction: Transaction,
    reportActions: ReportAction[],
    policy: OnyxEntry<Policy>,
): Array<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>> {
    const options: Array<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>> = [];

    if (isHoldActionForTransaction(parentReport, reportTransaction, reportActions)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
    }

    if (isSplitAction(parentReport, [reportTransaction], policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT);
    }

    options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS);

    if (isDeleteAction(parentReport, [reportTransaction], reportActions ?? [])) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE);
    }

    return options;
}
export {getSecondaryReportActions, getSecondaryTransactionThreadActions, isDeleteAction};
