import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy, Report, ReportAction, ReportMetadata, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import {isApprover as isApproverUtils} from './actions/Policy/Member';
import {getCurrentUserAccountID} from './actions/Report';
import {
    arePaymentsEnabled as arePaymentsEnabledUtils,
    getSubmitToAccountID,
    getValidConnectedIntegration,
    hasDynamicExternalWorkflow,
    hasIntegrationAutoSync,
    isPaidGroupPolicy,
    isPolicyAdmin as isPolicyAdminPolicyUtils,
    isPreferredExporter,
} from './PolicyUtils';
import {getAllReportActions, getOneTransactionThreadReportID, getOriginalMessage, getReportAction, hasPendingDEWSubmit, isMoneyRequestAction} from './ReportActionsUtils';
import {
    canAddTransaction as canAddTransactionUtil,
    canHoldUnholdReportAction,
    getMoneyRequestSpendBreakdown,
    getParentReport,
    hasExportError as hasExportErrorUtil,
    hasOnlyHeldExpenses,
    isArchivedReport,
    isClosedReport as isClosedReportUtils,
    isCurrentUserSubmitter,
    isExpenseReport as isExpenseReportUtils,
    isExported as isExportedUtil,
    isHoldCreator,
    isInvoiceReport as isInvoiceReportUtils,
    isIOUReport as isIOUReportUtils,
    isOpenReport as isOpenReportUtils,
    isPayer,
    isProcessingReport as isProcessingReportUtils,
    isReportApproved as isReportApprovedUtils,
    isReportManager,
    isSettled,
} from './ReportUtils';
import {
    allHavePendingRTERViolation,
    getTransactionViolations,
    hasPendingRTERViolation as hasPendingRTERViolationTransactionUtils,
    hasSmartScanFailedViolation,
    isDuplicate,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isScanning,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
    shouldShowBrokenConnectionViolation as shouldShowBrokenConnectionViolationTransactionUtils,
} from './TransactionUtils';

type GetReportPrimaryActionParams = {
    currentUserLogin: string;
    currentUserAccountID: number;
    report: Report | undefined;
    chatReport: OnyxEntry<Report>;
    reportTransactions: Transaction[];
    violations: OnyxCollection<TransactionViolation[]>;
    bankAccountList: OnyxEntry<BankAccountList>;
    policy?: Policy;
    reportNameValuePairs?: ReportNameValuePairs;
    reportActions?: ReportAction[];
    reportMetadata?: OnyxEntry<ReportMetadata>;
    isChatReportArchived: boolean;
    invoiceReceiverPolicy?: Policy;
    isPaidAnimationRunning?: boolean;
    isApprovedAnimationRunning?: boolean;
    isSubmittingAnimationRunning?: boolean;
};

function isAddExpenseAction(report: Report, reportTransactions: Transaction[], isChatReportArchived: boolean) {
    if (isChatReportArchived) {
        return false;
    }

    const isExpenseReport = isExpenseReportUtils(report);
    const canAddTransaction = canAddTransactionUtil(report);

    return isExpenseReport && canAddTransaction && reportTransactions.length === 0;
}

function isSubmitAction(
    report: Report,
    reportTransactions: Transaction[],
    policy?: Policy,
    reportNameValuePairs?: ReportNameValuePairs,
    violations?: OnyxCollection<TransactionViolation[]>,
    currentUserEmail?: string,
    currentUserAccountID?: number,
    reportMetadata?: OnyxEntry<ReportMetadata>,
) {
    if (isArchivedReport(reportNameValuePairs)) {
        return false;
    }

    const isExpenseReport = isExpenseReportUtils(report);
    const isReportSubmitter = isCurrentUserSubmitter(report);
    const isOpenReport = isOpenReportUtils(report);

    if (hasPendingDEWSubmit(reportMetadata, hasDynamicExternalWorkflow(policy))) {
        return false;
    }
    const transactionAreComplete = reportTransactions.every((transaction) => transaction.amount !== 0 || transaction.modifiedAmount !== 0);

    if (reportTransactions.length > 0 && reportTransactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    const isAnyReceiptBeingScanned = reportTransactions?.some((transaction) => isScanning(transaction));

    if (isAnyReceiptBeingScanned) {
        return false;
    }

    if (violations && currentUserEmail && currentUserAccountID !== undefined) {
        if (reportTransactions.some((transaction) => hasSmartScanFailedViolation(transaction, violations, currentUserEmail, currentUserAccountID, report, policy))) {
            return false;
        }
    }

    const submitToAccountID = getSubmitToAccountID(policy, report);

    if (submitToAccountID === report.ownerAccountID && policy?.preventSelfApproval && !isReportSubmitter) {
        return false;
    }

    return isExpenseReport && isReportSubmitter && isOpenReport && reportTransactions.length !== 0 && transactionAreComplete;
}

function isApproveAction(report: Report, reportTransactions: Transaction[], policy?: Policy) {
    const isAnyReceiptBeingScanned = reportTransactions?.some((transaction) => isScanning(transaction));

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
    const isApprovalEnabled = policy?.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;

    if (!isExpenseReport || !isApprovalEnabled || reportTransactions.length === 0) {
        return false;
    }

    if (reportTransactions.length > 0 && reportTransactions.every((transaction) => isPending(transaction))) {
        return false;
    }

    return isProcessingReportUtils(report);
}

function isPrimaryPayAction(
    report: Report,
    currentUserAccountID: number,
    currentUserLogin: string,
    bankAccountList: OnyxEntry<BankAccountList>,
    policy?: Policy,
    reportNameValuePairs?: ReportNameValuePairs,
    isChatReportArchived?: boolean,
    invoiceReceiverPolicy?: Policy,
    reportActions?: ReportAction[],
    isSecondaryAction?: boolean,
) {
    if (isArchivedReport(reportNameValuePairs) || isChatReportArchived) {
        return false;
    }
    const isExpenseReport = isExpenseReportUtils(report);
    const isReportPayer = isPayer(currentUserAccountID, currentUserLogin, report, bankAccountList, policy, false);
    const arePaymentsEnabled = arePaymentsEnabledUtils(policy);
    const isReportApproved = isReportApprovedUtils({report});
    const isReportClosed = isClosedReportUtils(report);
    const isProcessingReport = isProcessingReportUtils(report);
    const isExported = isExportedUtil(reportActions);
    const hasExportError = hasExportErrorUtil(reportActions, report);
    const didExportFail = !isExported && hasExportError;

    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
    const isSubmittedWithoutApprovalsEnabled = !isApprovalEnabled && isProcessingReport;

    const isReportFinished = (isReportApproved && !report.isWaitingOnBankAccount) || isSubmittedWithoutApprovalsEnabled || isReportClosed;
    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(report);

    if (isReportPayer && isExpenseReport && arePaymentsEnabled && isReportFinished && reimbursableSpend !== 0) {
        return isSecondaryAction ?? !didExportFail;
    }

    if (!isProcessingReport) {
        return false;
    }

    const isIOUReport = isIOUReportUtils(report);

    if (isIOUReport && isReportPayer && reimbursableSpend > 0) {
        return true;
    }

    const isInvoiceReport = isInvoiceReportUtils(report);

    if (!isInvoiceReport) {
        return false;
    }

    const parentReport = getParentReport(report);
    if (parentReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL && reimbursableSpend > 0) {
        return parentReport?.invoiceReceiver?.accountID === getCurrentUserAccountID();
    }

    return invoiceReceiverPolicy?.role === CONST.POLICY.ROLE.ADMIN && reimbursableSpend > 0;
}

function isExportAction(report: Report, currentUserLogin: string, policy?: Policy, reportActions?: ReportAction[]) {
    if (!policy) {
        return false;
    }

    const connectedIntegration = getValidConnectedIntegration(policy);
    const isInvoiceReport = isInvoiceReportUtils(report);

    if (!connectedIntegration || isInvoiceReport) {
        return false;
    }

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const isReportExporter = isPreferredExporter(policy, currentUserLogin);
    if (!isReportExporter && !isAdmin) {
        return false;
    }

    const syncEnabled = hasIntegrationAutoSync(policy, connectedIntegration);
    const isExported = isExportedUtil(reportActions);
    if (isExported) {
        return false;
    }

    const hasExportError = hasExportErrorUtil(reportActions);
    if (syncEnabled && !hasExportError) {
        return false;
    }

    if (report.isWaitingOnBankAccount) {
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

function isRemoveHoldAction(report: Report, chatReport: OnyxEntry<Report>, reportTransactions: Transaction[]) {
    const isClosedReport = isClosedReportUtils(report);
    if (isClosedReport) {
        return false;
    }

    const isReportOnHold = reportTransactions.some(isOnHoldTransactionUtils);

    if (!isReportOnHold) {
        return false;
    }

    const reportActions = getAllReportActions(report.reportID);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions);

    if (!transactionThreadReportID) {
        return false;
    }

    // Transaction is attached to expense report but hold action is attached to transaction thread report
    const isHolder = reportTransactions.some((transaction) => isHoldCreator(transaction, transactionThreadReportID));

    return isHolder;
}

function isReviewDuplicatesAction(
    report: Report,
    reportTransactions: Transaction[],
    currentUserEmail: string,
    currentUserAccountID: number,
    policy: Policy | undefined,
    violations: OnyxCollection<TransactionViolation[]>,
) {
    const hasDuplicates = reportTransactions.some((transaction) =>
        isDuplicate(transaction, currentUserEmail, currentUserAccountID, report, policy, violations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID]),
    );

    if (!hasDuplicates) {
        return false;
    }

    const isReportApprover = isReportManager(report);
    const isReportSubmitter = isCurrentUserSubmitter(report);
    const isProcessingReport = isProcessingReportUtils(report);
    const isReportOpen = isOpenReportUtils(report);

    const isSubmitterOrApprover = isReportSubmitter || isReportApprover;
    const isReportActive = isReportOpen || isProcessingReport;

    if (isSubmitterOrApprover && isReportActive) {
        return true;
    }

    return false;
}

function isMarkAsCashAction(
    currentUserEmail: string,
    currentUserAccountID: number,
    report: Report,
    reportTransactions: Transaction[],
    violations: OnyxCollection<TransactionViolation[]>,
    policy?: Policy,
) {
    const isOneExpenseReport = isExpenseReportUtils(report) && reportTransactions.length === 1;

    if (!isOneExpenseReport) {
        return false;
    }

    const hasAllPendingRTERViolations = allHavePendingRTERViolation(reportTransactions, violations, currentUserEmail, currentUserAccountID, report, policy);

    if (hasAllPendingRTERViolations) {
        return true;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report);
    const isReportApprover = isApproverUtils(policy, currentUserEmail);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(
        reportTransactions,
        report,
        policy,
        violations,
        currentUserEmail,
        currentUserAccountID,
    );
    const userControlsReport = isReportSubmitter || isReportApprover || isAdmin;
    return userControlsReport && shouldShowBrokenConnectionViolation;
}

function isMarkAsResolvedAction(report?: Report, violations?: TransactionViolation[], policy?: Policy) {
    if (!report || !violations) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(report);
    const isAdmin = isPolicyAdminPolicyUtils(policy);
    if (!isReportSubmitter && !isAdmin) {
        return false;
    }

    return violations?.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
}

function isPrimaryMarkAsResolvedAction(
    currentUserEmail: string,
    currentUserAccountID: number,
    report?: Report,
    reportTransactions?: Transaction[],
    violations?: OnyxCollection<TransactionViolation[]>,
    policy?: Policy,
) {
    if (!reportTransactions || reportTransactions.length !== 1) {
        return false;
    }

    const transactionViolations = getTransactionViolations(reportTransactions.at(0), violations, currentUserEmail, currentUserAccountID, report, policy);
    return isExpenseReportUtils(report) && isMarkAsResolvedAction(report, transactionViolations, policy);
}

function getAllExpensesToHoldIfApplicable(report: Report | undefined, reportActions: ReportAction[] | undefined, reportTransactions: Transaction[], policy: OnyxEntry<Policy>) {
    if (!report || !reportActions || !hasOnlyHeldExpenses(report?.reportID)) {
        return [];
    }

    return reportActions?.filter((action) => {
        if (!isMoneyRequestAction(action) || action.childType !== CONST.REPORT.TYPE.CHAT) {
            return false;
        }

        const transactionID = getOriginalMessage(action)?.IOUTransactionID;
        const transaction = reportTransactions.find((reportTransaction) => reportTransaction.transactionID === transactionID);
        const holdReportAction = getReportAction(action?.childReportID, `${transaction?.comment?.hold ?? ''}`);
        return canHoldUnholdReportAction(report, action, holdReportAction, transaction, policy).canUnholdRequest;
    });
}

function getReportPrimaryAction(params: GetReportPrimaryActionParams): ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '' {
    const {
        currentUserLogin,
        currentUserAccountID,
        report,
        reportTransactions,
        violations,
        bankAccountList,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        isChatReportArchived,
        chatReport,
        invoiceReceiverPolicy,
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        isSubmittingAnimationRunning,
    } = params;

    // The expense report of personal policy shouldn't have any action
    if (isExpenseReportUtils(report) && !isPaidGroupPolicy(policy)) {
        return '';
    }

    // We want to have action displayed for either paid or approved animations
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (isPaidAnimationRunning || isApprovedAnimationRunning) {
        return CONST.REPORT.PRIMARY_ACTIONS.PAY;
    }
    if (isSubmittingAnimationRunning) {
        return CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;
    }
    if (!report) {
        return '';
    }

    const isPayActionWithAllExpensesHeld =
        isPrimaryPayAction(report, currentUserAccountID, currentUserLogin, bankAccountList, policy, reportNameValuePairs, isChatReportArchived, invoiceReceiverPolicy, reportActions) &&
        hasOnlyHeldExpenses(report?.reportID);
    const expensesToHold = getAllExpensesToHoldIfApplicable(report, reportActions, reportTransactions, policy);

    if (isMarkAsCashAction(currentUserLogin, currentUserAccountID, report, reportTransactions, violations, policy)) {
        return CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH;
    }

    if (isReviewDuplicatesAction(report, reportTransactions, currentUserLogin, currentUserAccountID, policy, violations)) {
        return CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES;
    }

    if (isApproveAction(report, reportTransactions, policy)) {
        return CONST.REPORT.PRIMARY_ACTIONS.APPROVE;
    }

    if (isRemoveHoldAction(report, chatReport, reportTransactions) || (isPayActionWithAllExpensesHeld && expensesToHold.length)) {
        return CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD;
    }

    if (isPrimaryMarkAsResolvedAction(currentUserLogin, currentUserAccountID, report, reportTransactions, violations, policy)) {
        return CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_RESOLVED;
    }

    if (isSubmitAction(report, reportTransactions, policy, reportNameValuePairs, violations, currentUserLogin, currentUserAccountID, reportMetadata)) {
        return CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;
    }

    if (isPrimaryPayAction(report, currentUserAccountID, currentUserLogin, bankAccountList, policy, reportNameValuePairs, isChatReportArchived, invoiceReceiverPolicy, reportActions)) {
        return CONST.REPORT.PRIMARY_ACTIONS.PAY;
    }

    if (isExportAction(report, currentUserLogin, policy, reportActions)) {
        return CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING;
    }

    if (expensesToHold.length) {
        return CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD;
    }

    return '';
}

function isMarkAsCashActionForTransaction(currentUserLogin: string, parentReport: Report, violations: TransactionViolation[], policy?: Policy): boolean {
    const hasPendingRTERViolation = hasPendingRTERViolationTransactionUtils(violations);

    if (hasPendingRTERViolation) {
        return true;
    }

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationTransactionUtils(parentReport, policy, violations);

    if (!shouldShowBrokenConnectionViolation) {
        return false;
    }

    const isReportSubmitter = isCurrentUserSubmitter(parentReport);
    const isReportApprover = isApproverUtils(policy, currentUserLogin);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    return isReportSubmitter || isReportApprover || isAdmin;
}

function getTransactionThreadPrimaryAction(
    currentUserLogin: string,
    currentUserAccountID: number,
    transactionThreadReport: Report,
    parentReport: Report,
    reportTransaction: Transaction,
    violations: TransactionViolation[],
    policy: OnyxEntry<Policy>,
    isFromReviewDuplicates: boolean,
): ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '' {
    if (isMarkAsResolvedAction(parentReport, violations, policy)) {
        return CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_RESOLVED;
    }

    if (isHoldCreator(reportTransaction, transactionThreadReport.reportID)) {
        return CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD;
    }

    const transactionViolations: OnyxCollection<TransactionViolation[]> = {
        [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${reportTransaction.transactionID}`]: violations,
    };

    if (isReviewDuplicatesAction(parentReport, [reportTransaction], currentUserLogin, currentUserAccountID, policy, transactionViolations)) {
        return isFromReviewDuplicates ? CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.KEEP_THIS_ONE : CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES;
    }

    if (isMarkAsCashActionForTransaction(currentUserLogin, parentReport, violations, policy)) {
        return CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH;
    }

    return '';
}

export {
    getReportPrimaryAction,
    getTransactionThreadPrimaryAction,
    isAddExpenseAction,
    isPrimaryPayAction,
    isExportAction,
    isApproveAction,
    isSubmitAction,
    isMarkAsResolvedAction,
    isPrimaryMarkAsResolvedAction,
    getAllExpensesToHoldIfApplicable,
    isReviewDuplicatesAction,
};
