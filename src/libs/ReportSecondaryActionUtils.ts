import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, ExportTemplate, Policy, Report, ReportAction, ReportMetadata, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverUtils} from './actions/Policy/Member';
import {areTransactionsEligibleForMerge} from './MergeTransactionUtils';
import {getLoginByAccountID} from './PersonalDetailsUtils';
import {
    arePaymentsEnabled as arePaymentsEnabledUtils,
    getConnectedIntegration,
    getCorrectedAutoReportingFrequency,
    getSubmitToAccountID,
    getValidConnectedIntegration,
    hasDynamicExternalWorkflow,
    hasIntegrationAutoSync,
    isInstantSubmitEnabled,
    isPaidGroupPolicy,
    isPolicyAdmin,
    isPolicyMember,
    isPreferredExporter,
    isSubmitAndClose,
} from './PolicyUtils';
import {
    getAllReportActions,
    getIOUActionForTransactionID,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getReportAction,
    hasPendingDEWSubmit,
    isPayAction,
} from './ReportActionsUtils';
import {getReportPrimaryAction, isPrimaryPayAction} from './ReportPrimaryActionUtils';
import {
    canAddTransaction,
    canDeleteMoneyRequestReport,
    canEditReportPolicy,
    canHoldUnholdReportAction,
    canRejectReportAction,
    doesReportContainRequestsFromMultipleUsers,
    getTransactionDetails,
    hasExportError as hasExportErrorUtils,
    hasOnlyHeldExpenses,
    hasOnlyNonReimbursableTransactions,
    hasReportBeenReopened as hasReportBeenReopenedUtils,
    hasReportBeenRetracted as hasReportBeenRetractedUtils,
    isArchivedReport,
    isAwaitingFirstLevelApproval,
    isClosedReport as isClosedReportUtils,
    isCurrentUserSubmitter,
    isExpenseReport as isExpenseReportUtils,
    isExported as isExportedUtils,
    isHoldCreator,
    isInvoiceReport as isInvoiceReportUtils,
    isIOUReport as isIOUReportUtils,
    isMoneyRequestReportEligibleForMerge,
    isOpenReport as isOpenReportUtils,
    isPayer as isPayerUtils,
    isProcessingReport as isProcessingReportUtils,
    isReportApproved as isReportApprovedUtils,
    isReportManager as isReportManagerUtils,
    isSelfDM as isSelfDMReportUtils,
    isSettled,
    isWorkspaceEligibleForReportChange,
} from './ReportUtils';
import {
    allHavePendingRTERViolation,
    getOriginalTransactionWithSplitInfo,
    hasReceipt as hasReceiptTransactionUtils,
    hasSmartScanFailedOrNoRouteViolation,
    isDuplicate,
    isManagedCardTransaction as isManagedCardTransactionTransactionUtils,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isReceiptBeingScanned,
    isScanning as isScanningTransactionUtils,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
} from './TransactionUtils';

function isAddExpenseAction(report: Report, reportTransactions: Transaction[], isReportArchived = false) {
    const isReportSubmitter = isCurrentUserSubmitter(report);

    if (!isReportSubmitter) {
        return false;
    }

    return canAddTransaction(report, isReportArchived);
}

function isSplitAction(
    report: OnyxEntry<Report>,
    reportTransactions: Array<OnyxEntry<Transaction>>,
    originalTransaction: OnyxEntry<Transaction>,
    currentUserLogin: string,
    currentUserAccountID: number,
    policy?: OnyxEntry<Policy>,
): boolean {
    if (Number(reportTransactions?.length) !== 1 || !report) {
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

    const {isBillSplit} = getOriginalTransactionWithSplitInfo(reportTransaction, originalTransaction);
    if (isBillSplit) {
        return false;
    }

    if (!isExpenseReportUtils(report)) {
        return false;
    }

    if (report.statusNum && report.statusNum >= CONST.REPORT.STATUS_NUM.CLOSED) {
        return false;
    }

    if (hasOnlyNonReimbursableTransactions(report.reportID) && isSubmitAndClose(policy) && isInstantSubmitEnabled(policy)) {
        return false;
    }

    const isSubmitter = isCurrentUserSubmitter(report);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = (report.managerID ?? CONST.DEFAULT_NUMBER_ID) === currentUserAccountID;
    const isOpenReport = isOpenReportUtils(report);
    const isPolicyExpenseChat = !!policy?.isPolicyExpenseChatEnabled;
    const userIsPolicyMember = isPolicyMember(policy, currentUserLogin);

    if (!(userIsPolicyMember && isPolicyExpenseChat)) {
        return false;
    }

    if (isOpenReport) {
        return isSubmitter || isAdmin;
    }

    // Hide split option for the submitter if the report is forwarded
    return (isSubmitter && isAwaitingFirstLevelApproval(report)) || isAdmin || isManager;
}

function isSubmitAction({
    report,
    reportTransactions,
    policy,
    reportNameValuePairs,
    reportActions,
    reportMetadata,
    isChatReportArchived = false,
    primaryAction,
    violations,
    currentUserLogin,
    currentUserAccountID,
}: {
    report: Report;
    reportTransactions: Transaction[];
    policy?: Policy;
    reportNameValuePairs?: ReportNameValuePairs;
    reportActions?: ReportAction[];
    reportMetadata?: OnyxEntry<ReportMetadata>;
    isChatReportArchived?: boolean;
    primaryAction?: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';
    violations?: OnyxCollection<TransactionViolation[]>;
    currentUserLogin?: string;
    currentUserAccountID: number;
}): boolean {
    if (isArchivedReport(reportNameValuePairs) || isChatReportArchived) {
        return false;
    }

    if (hasPendingDEWSubmit(reportMetadata, hasDynamicExternalWorkflow(policy))) {
        return false;
    }

    const transactionAreComplete = reportTransactions.every((transaction) => transaction.amount !== 0 || transaction.modifiedAmount !== 0);

    if (!transactionAreComplete) {
        return false;
    }

    const isAnyReceiptBeingScanned = reportTransactions?.some((transaction) => isReceiptBeingScanned(transaction));

    if (isAnyReceiptBeingScanned) {
        return false;
    }

    if (violations && currentUserLogin && currentUserAccountID !== undefined) {
        if (reportTransactions.some((transaction) => hasSmartScanFailedOrNoRouteViolation(transaction, violations, currentUserLogin, currentUserAccountID, report, policy))) {
            return false;
        }
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_RESOLVED) {
        return false;
    }

    if (reportTransactions.length > 0 && reportTransactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport || (report?.total === 0 && reportTransactions.length === 0) || !isPaidGroupPolicy(policy)) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    // For OPEN reports, managerID might be stale. Use getSubmitToAccountID for accurate approver check.
    const submitToAccountID = getSubmitToAccountID(policy, report);
    const isApprover = submitToAccountID === currentUserAccountID;

    if (!isReportSubmitter && !isAdmin && !isApprover) {
        return false;
    }

    const isOpenReport = isOpenReportUtils(report);
    if (!isOpenReport) {
        return false;
    }

    if (submitToAccountID === report.ownerAccountID && policy?.preventSelfApproval) {
        return false;
    }

    const hasReportBeenRetracted = hasReportBeenReopenedUtils(report, reportActions) || hasReportBeenRetractedUtils(report, reportActions);
    const isPrimarySubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;

    if (hasReportBeenRetracted && isReportSubmitter && isPrimarySubmitAction) {
        return false;
    }

    if (hasReportBeenRetracted && isReportSubmitter && !isPrimarySubmitAction) {
        return true;
    }

    if (isAdmin || isApprover) {
        return true;
    }

    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);

    const isScheduledSubmitEnabled = policy?.harvesting?.enabled && autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;

    return !!isScheduledSubmitEnabled || !isPrimarySubmitAction;
}

function isApproveAction(
    currentUserLogin: string,
    currentUserAccountID: number,
    report: Report,
    reportTransactions: Transaction[],
    violations: OnyxCollection<TransactionViolation[]>,
    policy?: Policy,
): boolean {
    const isAnyReceiptBeingScanned = reportTransactions?.some((transaction) => isReceiptBeingScanned(transaction));

    if (isAnyReceiptBeingScanned) {
        return false;
    }

    const managerID = report?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserManager = managerID === currentUserAccountID;
    if (!isCurrentUserManager) {
        return false;
    }
    const isProcessingReport = isProcessingReportUtils(report);
    if (!isProcessingReport) {
        return false;
    }

    const isPreventSelfApprovalEnabled = policy?.preventSelfApproval;
    const isReportSubmitter = isCurrentUserSubmitter(report);

    if (isPreventSelfApprovalEnabled && isReportSubmitter) {
        return false;
    }
    const isExpenseReport = isExpenseReportUtils(report);
    const reportHasDuplicatedTransactions = reportTransactions.some((transaction) =>
        isDuplicate(transaction, currentUserLogin, currentUserAccountID, report, policy, violations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID]),
    );

    if (isExpenseReport && isProcessingReport && reportHasDuplicatedTransactions) {
        return true;
    }

    if (reportTransactions.length > 0 && reportTransactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const hasAllPendingRTERViolations = allHavePendingRTERViolation(reportTransactions, violations, currentUserLogin, currentUserAccountID, report, policy);

    if (hasAllPendingRTERViolations) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(
        reportTransactions,
        report,
        policy,
        violations,
        currentUserLogin,
        currentUserAccountID,
    );
    const isReportApprover = isApproverUtils(policy, currentUserLogin);
    const userControlsReport = isReportApprover || isAdmin;
    return userControlsReport && shouldShowBrokenConnectionViolation;
}

function isUnapproveAction(currentUserLogin: string, currentUserAccountID: number, report: Report, policy?: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportApprover = isApproverUtils(policy, currentUserLogin);
    const isReportApproved = isReportApprovedUtils({report});
    const isReportSettled = isSettled(report);
    const isPaymentProcessing = report.isWaitingOnBankAccount && report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED;
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = report.managerID === currentUserAccountID;

    if (isReportSettled || !isExpenseReport || !isReportApproved || isPaymentProcessing) {
        return false;
    }

    if (report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED) {
        return isManager || isAdmin;
    }

    return isReportApprover;
}

function isCancelPaymentAction(
    currentAccountID: number,
    currentUserEmail: string,
    report: Report,
    reportTransactions: Transaction[],
    bankAccountList: OnyxEntry<BankAccountList>,
    policy?: Policy,
): boolean {
    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isPayer = isPayerUtils(currentAccountID, currentUserEmail, report, bankAccountList, policy, false);

    if (!isAdmin || !isPayer) {
        return false;
    }

    // Get all report actions for this report and filter for pay actions
    // Pay actions are at the report level, not per transaction
    const allReportActions = getAllReportActions(report.reportID);
    const allActionsArray = Object.values(allReportActions);
    const payActions = allActionsArray.filter((action): action is ReportAction => !!action && isPayAction(action));

    // Check if payment was made via bank account (not elsewhere)
    // If no pay actions exist, we can't determine the payment type, so we assume it was NOT a bank payment
    const isPaidViaBankAccount =
        payActions.length > 0 &&
        payActions.every((action) => {
            const originalMessage = getOriginalMessage(action);
            return originalMessage && 'paymentType' in originalMessage && originalMessage.paymentType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
        });

    // For reports marked as paid elsewhere or when we can't determine payment type, show cancel button
    if (report.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED && !isPaidViaBankAccount) {
        return true;
    }

    // Bank payment is processing when:
    // 1. In BILLING state (ACH batch submitted), OR
    // 2. In APPROVED + REIMBURSED state (immediately after paying via bank, before batch is sent), OR
    // 3. In AUTOREIMBURSED state (automatically reimbursed)
    const isInBillingState = report.stateNum === CONST.REPORT.STATE_NUM.BILLING && report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const isApprovedAndReimbursed = report.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const isAutoReimbursed = report.stateNum === CONST.REPORT.STATE_NUM.AUTOREIMBURSED && report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const isBankProcessing = isPaidViaBankAccount && (isInBillingState || isApprovedAndReimbursed || isAutoReimbursed);
    const isPaymentProcessing = (!!report.isWaitingOnBankAccount && report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED) || isBankProcessing;

    const hasDailyNachaCutoffPassed = payActions.some((action) => {
        const now = new Date();
        const paymentDatetime = new Date(action.created);
        const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
        const cutoffTimeUTC = new Date(Date.UTC(paymentDatetime.getUTCFullYear(), paymentDatetime.getUTCMonth(), paymentDatetime.getUTCDate(), 23, 45, 0));
        return nowUTC.getTime() > cutoffTimeUTC.getTime();
    });

    return isPaymentProcessing && !hasDailyNachaCutoffPassed;
}

function isExportAction(currentAccountID: number, currentUserLogin: string, report: Report, bankAccountList: OnyxEntry<BankAccountList>, policy?: Policy): boolean {
    if (!policy) {
        return false;
    }

    const hasAccountingConnection = !!getValidConnectedIntegration(policy);
    if (!hasAccountingConnection) {
        return false;
    }

    const isInvoiceReport = isInvoiceReportUtils(report);

    // We don't allow export to accounting for invoice reports in OD so we want to align with that here.
    if (isInvoiceReport) {
        return false;
    }

    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isReportApproved = isReportApprovedUtils({report});
    const isReportPayer = isPayerUtils(currentAccountID, currentUserLogin, report, bankAccountList, policy, false);
    const arePaymentsEnabled = arePaymentsEnabledUtils(policy);
    const isReportClosed = isClosedReportUtils(report);

    const isReportSettled = isSettled(report);
    if (isReportPayer && arePaymentsEnabled && (isReportApproved || isReportClosed || isReportSettled)) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isReportReimbursed = report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const connectedIntegration = getConnectedIntegration(policy);
    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);
    const isReportFinished = isReportApproved || isReportReimbursed || isReportClosed;

    return isAdmin && isReportFinished && syncEnabled;
}

function isMarkAsExportedAction(currentAccountID: number, currentUserLogin: string, report: Report, bankAccountList: OnyxEntry<BankAccountList>, policy?: Policy): boolean {
    if (!policy) {
        return false;
    }

    const hasAccountingConnection = !!getValidConnectedIntegration(policy);
    if (!hasAccountingConnection) {
        return false;
    }

    const isInvoiceReport = isInvoiceReportUtils(report);
    const isReportSender = isCurrentUserSubmitter(report);

    if (isInvoiceReport && isReportSender) {
        return true;
    }

    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport) {
        return false;
    }

    const isReportPayer = isPayerUtils(currentAccountID, currentUserLogin, report, bankAccountList, policy, false);
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

    const isExporter = isPreferredExporter(policy, currentUserLogin);

    return (isAdmin && syncEnabled) || (isExporter && !syncEnabled);
}

function isHoldAction(report: Report, chatReport: OnyxEntry<Report>, reportTransactions: Transaction[], reportActions: ReportAction[] | undefined, policy: OnyxEntry<Policy>): boolean {
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions);
    const isOneExpenseReport = reportTransactions.length === 1;
    const transaction = reportTransactions.at(0);

    if ((!!reportActions && !transactionThreadReportID) || !isOneExpenseReport || !transaction) {
        return false;
    }

    const action = !!reportActions && getIOUActionForTransactionID(reportActions, transaction.transactionID);
    return !!action && isHoldActionForTransaction(report, transaction, action, policy);
}

function isHoldActionForTransaction(report: Report, reportTransaction: Transaction, reportAction: ReportAction, policy: OnyxEntry<Policy>): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isIOUReport = isIOUReportUtils(report);
    const iouOrExpenseReport = isExpenseReport || isIOUReport;
    const holdReportAction = getReportAction(reportAction?.childReportID, `${reportTransaction?.comment?.hold ?? ''}`);
    const {canHoldRequest} = canHoldUnholdReportAction(report, reportAction, holdReportAction, reportTransaction, policy);

    if (!iouOrExpenseReport || !canHoldRequest) {
        return false;
    }

    const isReportOnHold = isOnHoldTransactionUtils(reportTransaction);

    if (isReportOnHold) {
        return false;
    }

    const isOpenReport = isOpenReportUtils(report);
    const isSubmitter = isCurrentUserSubmitter(report);
    const isReportManager = isReportManagerUtils(report);

    if (isIOUReport) {
        return (isSubmitter || isReportManager) && !isSettled(report);
    }

    if (isOpenReport && (isSubmitter || isReportManager)) {
        return true;
    }

    const isProcessingReport = isProcessingReportUtils(report);

    return isProcessingReport;
}

function isChangeWorkspaceAction(report: Report, policies: OnyxCollection<Policy>, reportActions?: ReportAction[]): boolean {
    // We can't move the iou report to the workspace if both users from the iou report create the expense
    if (isIOUReportUtils(report) && doesReportContainRequestsFromMultipleUsers(report)) {
        return false;
    }

    const isSubmitter = isCurrentUserSubmitter(report);
    const isManager = isReportManagerUtils(report);

    if (isIOUReportUtils(report) && !isSubmitter && !isManager) {
        return false;
    }

    const submitterEmail = getLoginByAccountID(report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID);
    const availablePolicies = Object.values(policies ?? {}).filter((newPolicy) => isWorkspaceEligibleForReportChange(submitterEmail, newPolicy, report));
    let hasAvailablePolicies = availablePolicies.length > 1;
    if (!hasAvailablePolicies && availablePolicies.length === 1) {
        hasAvailablePolicies = !report.policyID || report.policyID !== availablePolicies?.at(0)?.id;
    }
    const reportPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    return hasAvailablePolicies && canEditReportPolicy(report, reportPolicy) && !isExportedUtils(reportActions);
}

function isDeleteAction(report: Report, reportTransactions: Transaction[], reportActions: ReportAction[]): boolean {
    return canDeleteMoneyRequestReport(report, reportTransactions, reportActions);
}

function isRetractAction(report: Report, policy?: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);

    // This should be removed after we change how instant submit works
    const isInstantSubmit = isInstantSubmitEnabled(policy);

    if (!isExpenseReport || isInstantSubmit) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report);
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

/**
 * Checks whether the supplied report supports merging transactions from it.
 */
function isMergeAction(parentReport: Report, reportTransactions: Transaction[], policy?: Policy): boolean {
    // Do not show merge action if there are more than 2 transactions
    if (reportTransactions.length > 2) {
        return false;
    }

    // Merging IOUs is currently not planned
    if (isIOUReportUtils(parentReport)) {
        return false;
    }

    const isAnyReceiptBeingScanned = reportTransactions?.some((transaction) => isReceiptBeingScanned(transaction));

    if (isAnyReceiptBeingScanned) {
        return false;
    }

    if (isSelfDMReportUtils(parentReport)) {
        return true;
    }

    if (hasOnlyNonReimbursableTransactions(parentReport.reportID) && isSubmitAndClose(policy) && isInstantSubmitEnabled(policy)) {
        return false;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    return isMoneyRequestReportEligibleForMerge(parentReport.reportID, isAdmin);
}

function isMergeActionForSelectedTransactions(transactions: Transaction[], reports: Report[], policies: Policy[], currentUserAccountID?: number) {
    if ([transactions, reports, policies].some((collection) => collection?.length > 2)) {
        return false;
    }

    // Prevent Merge from showing for admins/managers when selecting transactions
    // belonging to different users
    if (transactions.length === 2) {
        const transactionReportData = transactions.map((transaction) => ({
            transaction,
            report: reports.find((r) => r.reportID === transaction.reportID),
            isUnreported: transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID,
        }));

        const [first, second] = transactionReportData;

        // Check if both transactions are unreported (in this case they must belong to current user)
        const areBothUnreported = first.isUnreported && second.isUnreported;

        // Check if both reports have the same owner accountID (when both are reported)
        const haveSameOwner = !first.isUnreported && !second.isUnreported && first.report?.ownerAccountID === second.report?.ownerAccountID;

        // Check if it's a mix of reported/unreported and the reported transaction belongs to current user
        const isMixedAndValid =
            (first.isUnreported && !second.isUnreported && second.report?.ownerAccountID === currentUserAccountID) ||
            (!first.isUnreported && second.isUnreported && first.report?.ownerAccountID === currentUserAccountID);

        if (!areBothUnreported && !haveSameOwner && !isMixedAndValid) {
            return false;
        }
    }

    // All reports must be in an editable state by the current user to allow merging
    const policyMap = new Map(policies.map((p) => [p?.id, p]));
    const allReportsEligible = reports.every((report) => {
        if (!report) {
            return true;
        }
        if (!report?.policyID) {
            return true;
        }

        const policy = policyMap.get(report.policyID);
        if (hasOnlyNonReimbursableTransactions(report.reportID) && isSubmitAndClose(policy) && isInstantSubmitEnabled(policy)) {
            return false;
        }
        return isMoneyRequestReportEligibleForMerge(report, policy?.role === CONST.POLICY.ROLE.ADMIN);
    });

    return allReportsEligible && (transactions.length === 1 || areTransactionsEligibleForMerge(transactions.at(0), transactions.at(1)));
}

function isRemoveHoldAction(
    report: Report,
    chatReport: OnyxEntry<Report>,
    reportTransactions: Transaction[],
    reportActions?: ReportAction[],
    policy?: Policy,
    primaryAction?: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '',
): boolean {
    const isClosedReport = isClosedReportUtils(report);
    if (isClosedReport) {
        return false;
    }

    const isReportOnHold = reportTransactions.some(isOnHoldTransactionUtils);

    if (!isReportOnHold) {
        return false;
    }

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions);

    if (!transactionThreadReportID) {
        return false;
    }

    const isHolder = reportTransactions.some((transaction) => isHoldCreator(transaction, transactionThreadReportID));
    const isPrimaryActionRemoveHold = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD;

    if (isHolder) {
        return !isPrimaryActionRemoveHold;
    }

    return policy?.role === CONST.POLICY.ROLE.ADMIN;
}

function isRemoveHoldActionForTransaction(report: Report, reportTransaction: Transaction, policy?: Policy): boolean {
    return isOnHoldTransactionUtils(reportTransaction) && policy?.role === CONST.POLICY.ROLE.ADMIN && !isHoldCreator(reportTransaction, report.reportID);
}

/**
 * Checks if the report should show the "Report layout" option
 * Only shows for expense reports (not IOU reports) with 2 or more transactions
 */
function isReportLayoutAction(report: Report, reportTransactions: Transaction[]): boolean {
    if (!isExpenseReportUtils(report)) {
        return false;
    }

    // Exclude IOU reports - only show for workspace expense reports
    if (isIOUReportUtils(report)) {
        return false;
    }

    // Only show if report has 2 or more transactions
    return reportTransactions.length >= 2;
}

function isDuplicateAction(report: Report, reportTransactions: Transaction[]): boolean {
    // Only single transactions are supported for now
    if (reportTransactions.length !== 1) {
        return false;
    }

    const reportTransaction = reportTransactions.at(0);

    // Per diem and distance requests will be handled separately in a follow-up
    if (isPerDiemRequestTransactionUtils(reportTransaction)) {
        return false;
    }

    if (isScanningTransactionUtils(reportTransaction)) {
        return false;
    }

    if (!isCurrentUserSubmitter(report)) {
        return false;
    }

    if (isManagedCardTransactionTransactionUtils(reportTransaction)) {
        return false;
    }

    return true;
}

function getSecondaryReportActions({
    currentUserLogin,
    currentUserAccountID,
    report,
    chatReport,
    reportTransactions,
    originalTransaction,
    violations,
    bankAccountList,
    policy,
    reportNameValuePairs,
    reportActions,
    reportMetadata,
    policies,
    isChatReportArchived = false,
}: {
    currentUserLogin: string;
    currentUserAccountID: number;
    report: Report;
    chatReport: OnyxEntry<Report>;
    reportTransactions: Transaction[];
    originalTransaction: OnyxEntry<Transaction>;
    violations: OnyxCollection<TransactionViolation[]>;
    bankAccountList: OnyxEntry<BankAccountList>;
    policy?: Policy;
    reportNameValuePairs?: ReportNameValuePairs;
    reportActions?: ReportAction[];
    reportMetadata?: OnyxEntry<ReportMetadata>;
    policies?: OnyxCollection<Policy>;
    canUseNewDotSplits?: boolean;
    isChatReportArchived?: boolean;
}): Array<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> {
    const options: Array<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> = [];

    const isExported = isExportedUtils(reportActions);
    const hasExportError = hasExportErrorUtils(reportActions, report);
    const didExportFail = !isExported && hasExportError;

    if (
        isPrimaryPayAction(report, currentUserAccountID, currentUserLogin, bankAccountList, policy, reportNameValuePairs, isChatReportArchived, undefined, reportActions, true) &&
        (hasOnlyHeldExpenses(report?.reportID) || didExportFail)
    ) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.PAY);
    }

    if (isAddExpenseAction(report, reportTransactions, isChatReportArchived || isArchivedReport(reportNameValuePairs))) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE);
    }

    const primaryAction = getReportPrimaryAction({
        currentUserLogin,
        currentUserAccountID,
        report,
        chatReport,
        reportTransactions,
        violations,
        bankAccountList,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        isChatReportArchived,
    });

    if (
        isSubmitAction({
            report,
            reportTransactions,
            policy,
            reportNameValuePairs,
            reportActions,
            reportMetadata,
            isChatReportArchived,
            primaryAction,
            violations,
            currentUserLogin,
            currentUserAccountID,
        })
    ) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    }

    if (isApproveAction(currentUserLogin, currentUserAccountID, report, reportTransactions, violations, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    }

    if (isUnapproveAction(currentUserLogin, currentUserAccountID, report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE);
    }

    if (isCancelPaymentAction(currentUserAccountID, currentUserLogin, report, reportTransactions, bankAccountList, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
    }

    if (isRetractAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.RETRACT);
    }

    if (isReopenAction(report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.REOPEN);
    }

    if (isHoldAction(report, chatReport, reportTransactions, reportActions, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.HOLD);
    }

    if (isRemoveHoldAction(report, chatReport, reportTransactions, reportActions, policy, primaryAction)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);
    }

    if (canRejectReportAction(currentUserLogin, report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.REJECT);
    }

    if (isSplitAction(report, reportTransactions, originalTransaction, currentUserLogin, currentUserAccountID, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.SPLIT);
    }

    if (reportTransactions?.length === 1 && isMergeAction(report, reportTransactions, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.MERGE);
    }

    if (isDuplicateAction(report, reportTransactions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE);
    }

    options.push(CONST.REPORT.SECONDARY_ACTIONS.EXPORT);

    options.push(CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF);

    if (isChangeWorkspaceAction(report, policies, reportActions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE);
    }

    const isApprovalEnabled = policy?.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    if (isExpenseReportUtils(report) && isProcessingReportUtils(report) && isPolicyAdmin(policy) && isApprovalEnabled) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER);
    }

    options.push(CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS);

    if (isReportLayoutAction(report, reportTransactions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT);
    }

    if (isDeleteAction(report, reportTransactions, reportActions ?? [])) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.DELETE);
    }

    return options;
}

function getSecondaryExportReportActions(
    currentUserAccountID: number,
    currentUserLogin: string,
    report: Report,
    bankAccountList: OnyxEntry<BankAccountList>,
    policy?: Policy,
    exportTemplates: ExportTemplate[] = [],
): Array<ValueOf<string>> {
    const options: Array<ValueOf<string>> = [];
    if (isExportAction(currentUserAccountID, currentUserLogin, report, bankAccountList, policy)) {
        options.push(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
    }

    if (isMarkAsExportedAction(currentUserAccountID, currentUserLogin, report, bankAccountList, policy)) {
        options.push(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
    }

    options.push(CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV);

    // Add any custom IS templates that have been added to the user's account as export options
    for (const template of exportTemplates) {
        options.push(template.name);
    }

    return options;
}

function getSecondaryTransactionThreadActions(
    currentUserLogin: string,
    currentUserAccountID: number,
    parentReport: Report,
    reportTransaction: Transaction,
    reportAction: ReportAction | undefined,
    originalTransaction: OnyxEntry<Transaction>,
    policy: OnyxEntry<Policy>,
    transactionThreadReport?: OnyxEntry<Report>,
): Array<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>> {
    const options: Array<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>> = [];

    if (!!reportAction && isHoldActionForTransaction(parentReport, reportTransaction, reportAction, policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
    }

    if (transactionThreadReport && isRemoveHoldActionForTransaction(transactionThreadReport, reportTransaction, policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REMOVE_HOLD);
    }

    if (canRejectReportAction(currentUserLogin, parentReport, policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
    }

    if (isSplitAction(parentReport, [reportTransaction], originalTransaction, currentUserLogin, currentUserAccountID, policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT);
    }

    if (isMergeAction(parentReport, [reportTransaction], policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MERGE);
    }

    if (isDuplicateAction(parentReport, [reportTransaction])) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DUPLICATE);
    }

    options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS);

    if (isDeleteAction(parentReport, [reportTransaction], reportAction ? [reportAction] : [])) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE);
    }

    return options;
}
export {getSecondaryReportActions, getSecondaryTransactionThreadActions, isMergeAction, isMergeActionForSelectedTransactions, getSecondaryExportReportActions, isSplitAction};
