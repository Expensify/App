import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate, Policy, Report, ReportAction, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverUtils} from './actions/Policy/Member';
import {getCurrentUserAccountID, getCurrentUserEmail} from './actions/Report';
import {getLoginByAccountID} from './PersonalDetailsUtils';
import {
    arePaymentsEnabled as arePaymentsEnabledUtils,
    getConnectedIntegration,
    getCorrectedAutoReportingFrequency,
    getSubmitToAccountID,
    getValidConnectedIntegration,
    hasIntegrationAutoSync,
    isInstantSubmitEnabled,
    isPolicyAdmin,
    isPolicyMember,
    isPreferredExporter,
    isSubmitAndClose,
} from './PolicyUtils';
import {getIOUActionForReportID, getIOUActionForTransactionID, getOneTransactionThreadReportID, getReportAction, isPayAction} from './ReportActionsUtils';
import {getReportPrimaryAction, isPrimaryPayAction} from './ReportPrimaryActionUtils';
import {
    canAddTransaction,
    canDeleteMoneyRequestReport,
    canEditReportPolicy,
    canHoldUnholdReportAction,
    canRejectReportAction,
    doesReportContainRequestsFromMultipleUsers,
    getTransactionDetails,
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
import {getSession} from './SessionUtils';
import {
    allHavePendingRTERViolation,
    getOriginalTransactionWithSplitInfo,
    hasReceipt as hasReceiptTransactionUtils,
    isDuplicate,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isReceiptBeingScanned,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
} from './TransactionUtils';

function isAddExpenseAction(report: Report, reportTransactions: Transaction[], isReportArchived = false) {
    const isReportSubmitter = isCurrentUserSubmitter(report);

    if (!isReportSubmitter) {
        return false;
    }

    return canAddTransaction(report, isReportArchived);
}

function isSplitAction(report: Report, reportTransactions: Transaction[], originalTransaction: OnyxEntry<Transaction>, policy?: Policy): boolean {
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
    const isManager = (report.managerID ?? CONST.DEFAULT_NUMBER_ID) === getCurrentUserAccountID();
    const isOpenReport = isOpenReportUtils(report);
    const isPolicyExpenseChat = !!policy?.isPolicyExpenseChatEnabled;
    const currentUserEmail = getCurrentUserEmail();
    const userIsPolicyMember = isPolicyMember(policy, currentUserEmail);

    if (!(userIsPolicyMember && isPolicyExpenseChat)) {
        return false;
    }

    if (isOpenReport) {
        return isSubmitter || isAdmin;
    }

    // Hide split option for the submitter if the report is forwarded
    return (isSubmitter && isAwaitingFirstLevelApproval(report)) || isAdmin || isManager;
}

function isSubmitAction(
    report: Report,
    reportTransactions: Transaction[],
    policy?: Policy,
    reportNameValuePairs?: ReportNameValuePairs,
    reportActions?: ReportAction[],
    isChatReportArchived = false,
    primaryAction?: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '',
): boolean {
    if (isArchivedReport(reportNameValuePairs) || isChatReportArchived) {
        return false;
    }

    const transactionAreComplete = reportTransactions.every((transaction) => transaction.amount !== 0 || transaction.modifiedAmount !== 0);

    if (!transactionAreComplete) {
        return false;
    }

    if (primaryAction === CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_RESOLVED) {
        return false;
    }

    if (reportTransactions.length > 0 && reportTransactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const isExpenseReport = isExpenseReportUtils(report);

    if (!isExpenseReport || (report?.total === 0 && reportTransactions.length === 0)) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = report.managerID === getCurrentUserAccountID();
    if (!isReportSubmitter && !isAdmin && !isManager) {
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

    const hasReportBeenRetracted = hasReportBeenReopenedUtils(report, reportActions) || hasReportBeenRetractedUtils(report, reportActions);
    const isPrimarySubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;

    if (hasReportBeenRetracted && isReportSubmitter && isPrimarySubmitAction) {
        return false;
    }

    if (hasReportBeenRetracted && isReportSubmitter && !isPrimarySubmitAction) {
        return true;
    }

    if (isAdmin || isManager) {
        return true;
    }

    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);

    const isScheduledSubmitEnabled = policy?.harvesting?.enabled && autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;

    return !!isScheduledSubmitEnabled || !isPrimarySubmitAction;
}

function isApproveAction(currentUserLogin: string, report: Report, reportTransactions: Transaction[], violations: OnyxCollection<TransactionViolation[]>, policy?: Policy): boolean {
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
    const reportHasDuplicatedTransactions = reportTransactions.some((transaction) => isDuplicate(transaction, currentUserLogin, report, policy));

    if (isExpenseReport && isProcessingReport && reportHasDuplicatedTransactions) {
        return true;
    }

    if (reportTransactions.length > 0 && reportTransactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const hasAllPendingRTERViolations = allHavePendingRTERViolation(reportTransactions, violations, currentUserLogin, report, policy);

    if (hasAllPendingRTERViolations) {
        return true;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(reportTransactions, report, policy, violations, currentUserLogin);
    const isReportApprover = isApproverUtils(policy, currentUserLogin);
    const userControlsReport = isReportApprover || isAdmin;
    return userControlsReport && shouldShowBrokenConnectionViolation;
}

function isUnapproveAction(currentUserLogin: string, report: Report, policy?: Policy): boolean {
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportApprover = isApproverUtils(policy, currentUserLogin);
    const isReportApproved = isReportApprovedUtils({report});
    const isReportSettled = isSettled(report);
    const isPaymentProcessing = report.isWaitingOnBankAccount && report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED;
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = report.managerID === getCurrentUserAccountID();

    if (isReportSettled || !isExpenseReport || !isReportApproved || isPaymentProcessing) {
        return false;
    }

    if (report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED) {
        return isManager || isAdmin;
    }

    return isReportApprover;
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

function isExportAction(report: Report, policy?: Policy): boolean {
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
    const isReportPayer = isPayerUtils(getSession(), report, false, policy);
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

function isMarkAsExportedAction(report: Report, policy?: Policy): boolean {
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
    const availablePolicies = Object.values(policies ?? {}).filter((newPolicy) => isWorkspaceEligibleForReportChange(submitterEmail, newPolicy));
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
    // Do not show merge action if there are multiple transactions
    if (reportTransactions.length !== 1) {
        return false;
    }

    // Temporary disable merge action for IOU reports
    // See: https://github.com/Expensify/App/issues/70329#issuecomment-3277062003
    if (isIOUReportUtils(parentReport)) {
        return false;
    }

    // Do not show merge action for transactions with negative amounts
    const transactionDetails = getTransactionDetails(reportTransactions.at(0));
    if (transactionDetails) {
        const transactionAmount = transactionDetails?.amount;
        if (transactionAmount < 0) {
            return false;
        }
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

function isRemoveHoldAction(
    report: Report,
    chatReport: OnyxEntry<Report>,
    reportTransactions: Transaction[],
    reportActions?: ReportAction[],
    policy?: Policy,
    primaryAction?: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '',
): boolean {
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

function getSecondaryReportActions({
    currentUserEmail,
    report,
    chatReport,
    reportTransactions,
    originalTransaction,
    violations,
    policy,
    reportNameValuePairs,
    reportActions,
    policies,
    isChatReportArchived = false,
}: {
    currentUserEmail: string;
    report: Report;
    chatReport: OnyxEntry<Report>;
    reportTransactions: Transaction[];
    originalTransaction: OnyxEntry<Transaction>;
    violations: OnyxCollection<TransactionViolation[]>;
    policy?: Policy;
    reportNameValuePairs?: ReportNameValuePairs;
    reportActions?: ReportAction[];
    policies?: OnyxCollection<Policy>;
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

    const primaryAction = getReportPrimaryAction({
        currentUserEmail,
        report,
        chatReport,
        reportTransactions,
        violations,
        policy,
        reportNameValuePairs,
        reportActions,
        isChatReportArchived,
    });

    if (isSubmitAction(report, reportTransactions, policy, reportNameValuePairs, reportActions, isChatReportArchived, primaryAction)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    }

    if (isApproveAction(currentUserEmail, report, reportTransactions, violations, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    }

    if (isUnapproveAction(currentUserEmail, report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE);
    }

    if (isCancelPaymentAction(report, reportTransactions, policy)) {
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

    if (canRejectReportAction(currentUserEmail, report, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.REJECT);
    }

    if (isSplitAction(report, reportTransactions, originalTransaction, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.SPLIT);
    }

    if (isMergeAction(report, reportTransactions, policy)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.MERGE);
    }

    options.push(CONST.REPORT.SECONDARY_ACTIONS.EXPORT);

    options.push(CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF);

    if (isChangeWorkspaceAction(report, policies, reportActions)) {
        options.push(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE);
    }

    if (isExpenseReportUtils(report) && isProcessingReportUtils(report) && isPolicyAdmin(policy)) {
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

function getSecondaryExportReportActions(report: Report, policy?: Policy, exportTemplates: ExportTemplate[] = []): Array<ValueOf<string>> {
    const options: Array<ValueOf<string>> = [];
    if (isExportAction(report, policy)) {
        options.push(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
    }

    if (isMarkAsExportedAction(report, policy)) {
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
    currentUserEmail: string,
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

    if (canRejectReportAction(currentUserEmail, parentReport, policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
    }

    if (isSplitAction(parentReport, [reportTransaction], originalTransaction, policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT);
    }

    if (isMergeAction(parentReport, [reportTransaction], policy)) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MERGE);
    }

    options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS);

    if (isDeleteAction(parentReport, [reportTransaction], reportAction ? [reportAction] : [])) {
        options.push(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE);
    }

    return options;
}
export {getSecondaryReportActions, getSecondaryTransactionThreadActions, isMergeAction, getSecondaryExportReportActions, isSplitAction};
