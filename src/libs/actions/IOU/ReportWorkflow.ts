import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {
    AddReportApproverParams,
    ApproveMoneyRequestParams,
    AssignReportToMeParams,
    ReopenReportParams,
    RetractReportParams,
    SubmitReportParams,
    UnapproveExpenseReportParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIsOffline} from '@libs/NetworkState';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import {getAccountIDsByLogins} from '@libs/PersonalDetailsUtils';
import {arePaymentsEnabled, getSubmitToAccountID, hasDynamicExternalWorkflow, isPaidGroupPolicy, isPolicyAdmin, isSubmitAndClose} from '@libs/PolicyUtils';
import {getAllReportActions, getReportActionHtml, getReportActionText, hasPendingDEWApprove, isCreatedAction, isDeletedAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticApprovedReportAction,
    buildOptimisticChangeApproverReportAction,
    buildOptimisticReopenedReportAction,
    buildOptimisticRetractedReportAction,
    buildOptimisticSubmittedReportAction,
    buildOptimisticUnapprovedReportAction,
    canBeAutoReimbursed,
    canSubmitAndIsAwaitingForCurrentUser,
    getAllHeldTransactions as getAllHeldTransactionsReportUtils,
    getApprovalChain,
    getMoneyRequestSpendBreakdown,
    getNextApproverAccountID,
    getReportOrDraftReport,
    getReportTransactions,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyNonReimbursableTransactions,
    hasOutstandingChildRequest,
    isArchivedReport,
    isClosedReport as isClosedReportUtil,
    isExpenseReport,
    isInvoiceReport as isInvoiceReportReportUtils,
    isIOUReport,
    isOpenExpenseReport as isOpenExpenseReportReportUtils,
    isOpenInvoiceReport as isOpenInvoiceReportReportUtils,
    isPayAtEndExpenseReport as isPayAtEndExpenseReportReportUtils,
    isPayer as isPayerReportUtils,
    isProcessingReport,
    isReportApproved,
    isReportManager,
    isSettled,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {
    allHavePendingRTERViolation,
    hasAnyTransactionWithoutRTERViolation,
    hasDuplicateTransactions,
    hasSmartScanFailedWithMissingFields,
    hasSubmissionBlockingViolations,
    isDuplicate,
    isOnHold,
    isPending,
    isPendingCardOrScanningTransaction,
    isScanning,
} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getAllReportActionsFromIOU, getAllReportNameValuePairs, getAllTransactionViolations, getCurrentUserEmail, getUserAccountID} from '.';
import {getReportFromHoldRequestsOnyxData} from './Hold';

type ApproveMoneyRequestFunctionParams = {
    expenseReport: OnyxEntry<OnyxTypes.Report>;
    expenseReportPolicy: OnyxEntry<OnyxTypes.Policy>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    isASAPSubmitBetaEnabled: boolean;
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    full?: boolean;
    onApproved?: () => void;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    delegateEmail: string | undefined;
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'];
};

type SubmitReportFunctionParams = {
    expenseReport: OnyxEntry<OnyxTypes.Report>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    isASAPSubmitBetaEnabled: boolean;
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    onSubmitted?: () => void;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    delegateEmail: string | undefined;
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'];
};

function canApproveIOU(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>,
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>,
    iouTransactions?: OnyxTypes.Transaction[],
) {
    // Only expense reports can be approved
    if (!isExpenseReport(iouReport) || !(policy && isPaidGroupPolicy(policy))) {
        return false;
    }

    const isOnSubmitAndClosePolicy = isSubmitAndClose(policy);
    if (isOnSubmitAndClosePolicy) {
        return false;
    }

    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    if (hasPendingDEWApprove(reportMetadata, isDEWPolicy)) {
        return false;
    }

    const managerID = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserManager = managerID === getUserAccountID();
    const isOpenExpenseReport = isOpenExpenseReportReportUtils(iouReport);
    const isApproved = isReportApproved({report: iouReport});
    const iouSettled = isSettled(iouReport);
    const reportNameValuePairs = getAllReportNameValuePairs()?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport?.reportID}`];
    const isArchivedExpenseReport = isArchivedReport(reportNameValuePairs);
    const reportTransactions = iouTransactions ?? getReportTransactions(iouReport?.reportID);
    const hasOnlyPendingCardOrScanningTransactions = reportTransactions.length > 0 && reportTransactions.every((transaction) => isScanning(transaction) || isPending(transaction));
    if (hasOnlyPendingCardOrScanningTransactions) {
        return false;
    }
    const isPayAtEndExpenseReport = isPayAtEndExpenseReportReportUtils(iouReport ?? undefined, reportTransactions);
    const isClosedReport = isClosedReportUtil(iouReport);
    return (
        reportTransactions.length > 0 && isCurrentUserManager && !isOpenExpenseReport && !isApproved && !iouSettled && !isArchivedExpenseReport && !isPayAtEndExpenseReport && !isClosedReport
    );
}

function canUnapproveIOU(iouReport: OnyxEntry<OnyxTypes.Report>, policy: OnyxEntry<OnyxTypes.Policy>) {
    return (
        isExpenseReport(iouReport) &&
        (isReportManager(iouReport) || isPolicyAdmin(policy)) &&
        isReportApproved({report: iouReport}) &&
        !isSubmitAndClose(policy) &&
        !iouReport?.isWaitingOnBankAccount
    );
}

function canIOUBePaid(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    chatReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>,
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>,
    transactions?: OnyxTypes.Transaction[],
    onlyShowPayElsewhere = false,
    chatReportRNVP?: OnyxTypes.ReportNameValuePairs,
    invoiceReceiverPolicy?: OnyxTypes.Policy,
) {
    const reportNameValuePairs = chatReportRNVP ?? getAllReportNameValuePairs()?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatReport?.reportID}`];
    const isChatReportArchived = isArchivedReport(reportNameValuePairs);
    const iouSettled = isSettled(iouReport);

    if (isEmptyObject(iouReport)) {
        return false;
    }

    if (policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO) {
        if (!onlyShowPayElsewhere) {
            return false;
        }
        if (iouReport?.statusNum !== CONST.REPORT.STATUS_NUM.SUBMITTED) {
            return false;
        }
    }

    if (isInvoiceReportReportUtils(iouReport)) {
        if (isChatReportArchived || iouSettled || isOpenInvoiceReportReportUtils(iouReport)) {
            return false;
        }
        if (chatReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
            return chatReport?.invoiceReceiver?.accountID === getUserAccountID();
        }
        return invoiceReceiverPolicy?.role === CONST.POLICY.ROLE.ADMIN;
    }

    const isPayer = isPayerReportUtils(getUserAccountID(), getCurrentUserEmail(), iouReport, bankAccountList, policy, onlyShowPayElsewhere);

    const {reimbursableSpend, nonReimbursableSpend} = getMoneyRequestSpendBreakdown(iouReport);
    const isAutoReimbursable = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES ? false : canBeAutoReimbursed(iouReport, policy);
    const isPayAtEndExpenseReport = isPayAtEndExpenseReportReportUtils(iouReport ?? undefined, transactions);
    const isProcessing = isProcessingReport(iouReport);
    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
    const isSubmittedWithoutApprovalsEnabled = !isApprovalEnabled && isProcessing;
    const isApproved = isReportApproved({report: iouReport}) || isSubmittedWithoutApprovalsEnabled;
    const isClosed = isClosedReportUtil(iouReport);
    const isReportFinished = (isApproved || isClosed) && !iouReport?.isWaitingOnBankAccount;
    const isIOU = isIOUReport(iouReport);
    const canShowMarkedAsPaidForNegativeAmount = onlyShowPayElsewhere && reimbursableSpend < 0;
    const isOnlyNonReimbursablePayElsewhere = onlyShowPayElsewhere && nonReimbursableSpend !== 0 && hasOnlyNonReimbursableTransactions(iouReport?.reportID, transactions);

    if (isIOU && isPayer && !iouSettled && reimbursableSpend > 0) {
        return true;
    }

    return (
        isPayer &&
        isReportFinished &&
        !iouSettled &&
        (reimbursableSpend > 0 || canShowMarkedAsPaidForNegativeAmount || isOnlyNonReimbursablePayElsewhere) &&
        !isChatReportArchived &&
        !isAutoReimbursable &&
        !isPayAtEndExpenseReport &&
        (!isExpenseReport(iouReport) || arePaymentsEnabled(policy as OnyxEntry<OnyxTypes.Policy>))
    );
}

function canCancelPayment(iouReport: OnyxEntry<OnyxTypes.Report>, session: OnyxEntry<OnyxTypes.Session>, bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>) {
    return isPayerReportUtils(session?.accountID, session?.email, iouReport, bankAccountList) && (isSettled(iouReport) || iouReport?.isWaitingOnBankAccount) && isExpenseReport(iouReport);
}

function canSubmitReport(
    report: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    transactions: OnyxTypes.Transaction[],
    allViolations: OnyxCollection<OnyxTypes.TransactionViolations> | undefined,
    isReportArchived: boolean,
    currentUserEmailParam: string,
    currentUserAccountID: number,
) {
    const isOpenExpenseReport = isOpenExpenseReportReportUtils(report);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactions, allViolations, currentUserEmailParam, currentUserAccountID, report, policy);
    const hasTransactionWithoutRTERViolation = hasAnyTransactionWithoutRTERViolation(transactions, allViolations, currentUserEmailParam, currentUserAccountID, report, policy);
    const hasOnlyPendingCardOrScanFailTransactions = transactions.length > 0 && transactions.every((t) => isPendingCardOrScanningTransaction(t));
    const hasAnySubmissionBlockingViolations = transactions.some((transaction) =>
        hasSubmissionBlockingViolations(transaction, allViolations, currentUserEmailParam, currentUserAccountID, report, policy),
    );

    return (
        isOpenExpenseReport &&
        (report?.ownerAccountID === currentUserAccountID || report?.managerID === currentUserAccountID || isAdmin) &&
        !hasOnlyPendingCardOrScanFailTransactions &&
        !hasAllPendingRTERViolations &&
        hasTransactionWithoutRTERViolation &&
        !isReportArchived &&
        !hasAnySubmissionBlockingViolations &&
        !hasSmartScanFailedWithMissingFields(transactions, report) &&
        transactions.length > 0
    );
}

function getBadgeFromIOUReport(
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>,
    invoiceReceiverPolicy: OnyxEntry<OnyxTypes.Policy>,
): ValueOf<typeof CONST.REPORT.ACTION_BADGE> | undefined {
    // Show to the actual payer, or to policy admins via the pay-elsewhere path for negative expenses
    if (
        canIOUBePaid(iouReport, chatReport, policy, undefined, undefined, undefined, undefined, invoiceReceiverPolicy) ||
        canIOUBePaid(iouReport, chatReport, policy, undefined, undefined, true, undefined, invoiceReceiverPolicy)
    ) {
        return CONST.REPORT.ACTION_BADGE.PAY;
    }
    if (canApproveIOU(iouReport, policy, reportMetadata)) {
        return CONST.REPORT.ACTION_BADGE.APPROVE;
    }
    const isWaitingSubmitFromCurrentUser = canSubmitAndIsAwaitingForCurrentUser(
        iouReport,
        chatReport,
        policy,
        getReportTransactions(iouReport?.reportID),
        getAllTransactionViolations(),
        getCurrentUserEmail(),
        getUserAccountID(),
        getAllReportActions(iouReport?.reportID),
    );
    if (isWaitingSubmitFromCurrentUser) {
        return CONST.REPORT.ACTION_BADGE.SUBMIT;
    }
    return undefined;
}

function getIOUReportActionWithBadge(
    chatReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>,
    invoiceReceiverPolicy: OnyxEntry<OnyxTypes.Policy>,
): {reportAction: OnyxEntry<ReportAction>; actionBadge?: ValueOf<typeof CONST.REPORT.ACTION_BADGE>} {
    const chatReportActions = getAllReportActionsFromIOU()?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`] ?? {};

    let actionBadge: ValueOf<typeof CONST.REPORT.ACTION_BADGE> | undefined;
    const reportAction = Object.values(chatReportActions).find((action) => {
        if (action?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW || isDeletedAction(action)) {
            return false;
        }
        const iouReport = getReportOrDraftReport(action.childReportID);
        const badge = getBadgeFromIOUReport(iouReport, chatReport, policy, reportMetadata, invoiceReceiverPolicy);
        if (badge) {
            actionBadge = badge;
            return true;
        }
        return false;
    });

    return {reportAction, actionBadge};
}

/**
 * Gets the original creation timestamp from a report's CREATED action or falls back to report.created
 */
function getReportOriginalCreationTimestamp(expenseReport?: OnyxEntry<OnyxTypes.Report>): string | undefined {
    if (!expenseReport?.reportID) {
        return undefined;
    }

    const expenseReportActions = getAllReportActions(expenseReport.reportID);
    const createdAction = Object.values(expenseReportActions ?? {}).find((action) => isCreatedAction(action));

    return createdAction?.created ?? expenseReport.created;
}

function approveMoneyRequest(params: ApproveMoneyRequestFunctionParams) {
    const {
        expenseReport,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        expenseReportCurrentNextStepDeprecated,
        betas,
        userBillingGracePeriodEnds,
        amountOwed,
        full,
        onApproved,
        ownerBillingGracePeriodEnd,
        delegateEmail,
        expenseReportPolicy,
        formatPhoneNumber,
    } = params;
    if (!expenseReport) {
        return;
    }

    if (expenseReport.policyID && shouldRestrictUserBillableActions(expenseReportPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }

    let total = expenseReport.total ?? 0;
    const hasHeldExpenses = hasHeldExpensesReportUtils(expenseReport.reportID);
    const hasDuplicates = hasDuplicateTransactions(currentUserEmailParam, currentUserAccountIDParam, expenseReport, policy, getAllTransactionViolations());
    if (hasHeldExpenses && !full && !!expenseReport.unheldTotal) {
        total = expenseReport.unheldTotal;
    }
    const optimisticApprovedReportAction = buildOptimisticApprovedReportAction(total, expenseReport.currency ?? '', expenseReport.reportID, currentUserAccountIDParam, delegateEmail);

    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    const shouldAddOptimisticApproveAction = !isDEWPolicy || getIsOffline();

    const nextApproverAccountID = getNextApproverAccountID(expenseReport);
    const predictedNextStatus = !nextApproverAccountID ? CONST.REPORT.STATUS_NUM.APPROVED : CONST.REPORT.STATUS_NUM.SUBMITTED;
    const predictedNextState = !nextApproverAccountID ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.SUBMITTED;
    const managerID = !nextApproverAccountID ? expenseReport.managerID : nextApproverAccountID;

    // buildOptimisticNextStep is used in parallel
    const optimisticNextStepDeprecated = isDEWPolicy
        ? null
        : // eslint-disable-next-line @typescript-eslint/no-deprecated
          buildNextStepNew({
              report: expenseReport,
              policy,
              currentUserAccountIDParam,
              currentUserEmailParam,
              hasViolations,
              isASAPSubmitBetaEnabled,
              predictedNextStatus,
              formatPhoneNumber,
          });
    const optimisticNextStep = isDEWPolicy
        ? null
        : buildOptimisticNextStep({
              report: expenseReport,
              policy,
              currentUserAccountIDParam,
              currentUserEmailParam,
              hasViolations,
              isASAPSubmitBetaEnabled,
              predictedNextStatus,
          });
    const chatReport = getReportOrDraftReport(expenseReport.chatReportID);

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    if (shouldAddOptimisticApproveAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
                    ...(optimisticApprovedReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        });
    }

    const updatedExpenseReport = {
        ...expenseReport,
        ...(shouldAddOptimisticApproveAction
            ? {
                  lastMessageText: getReportActionText(optimisticApprovedReportAction),
                  lastMessageHtml: getReportActionHtml(optimisticApprovedReportAction),
              }
            : {}),
        // For DEW policies, don't optimistically update stateNum, statusNum, managerID, or nextStep
        // because DEW determines the actual workflow on the backend
        ...(isDEWPolicy
            ? {}
            : {
                  stateNum: predictedNextState,
                  statusNum: predictedNextStatus,
                  managerID,
                  nextStep: optimisticNextStep ?? undefined,
                  pendingFields: {
                      partial: full ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                      nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                  },
              }),
    };
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: updatedExpenseReport,
    });

    if (chatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.chatReportID}`,
            value: {
                hasOutstandingChildRequest: hasOutstandingChildRequest(
                    chatReport,
                    updatedExpenseReport,
                    currentUserEmailParam,
                    currentUserAccountIDParam,
                    getAllTransactionViolations(),
                    undefined,
                ),
            },
        });
    }

    if (!isDEWPolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: optimisticNextStepDeprecated,
        });
    }

    if (isDEWPolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE,
            },
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [];

    if (!isDEWPolicy) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        });
    }

    if (shouldAddOptimisticApproveAction) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        });
    }

    if (isDEWPolicy) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: null,
            },
        });
    }

    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.chatReportID}`,
            value: {
                hasOutstandingChildRequest: chatReport?.hasOutstandingChildRequest,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
    ];

    if (!isDEWPolicy) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                statusNum: expenseReport.statusNum,
                stateNum: expenseReport.stateNum,
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        });
    }

    if (shouldAddOptimisticApproveAction) {
        if (isDEWPolicy) {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                value: {
                    [optimisticApprovedReportAction.reportActionID]: null,
                },
            });
        } else {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                value: {
                    [optimisticApprovedReportAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                    },
                },
            });
        }
    }

    if (isDEWPolicy) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: null,
            },
        });
    }

    // Clear hold reason of all transactions if we approve all requests
    if (full && hasHeldExpenses) {
        const heldTransactions = getAllHeldTransactionsReportUtils(expenseReport.reportID);
        for (const heldTransaction of heldTransactions) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${heldTransaction.transactionID}`,
                value: {
                    comment: {
                        hold: '',
                    },
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${heldTransaction.transactionID}`,
                value: {
                    comment: {
                        hold: heldTransaction.comment?.hold,
                    },
                },
            });
        }
    }

    let optimisticHoldReportID;
    let optimisticHoldActionID;
    let optimisticHoldReportExpenseActionIDs;
    let optimisticReportActionCopyIDs;
    let optimisticCreatedReportForUnapprovedTransactionsActionID;
    if (!full && !!chatReport && !!expenseReport) {
        const originalCreated = getReportOriginalCreationTimestamp(expenseReport);
        const holdReportOnyxData = getReportFromHoldRequestsOnyxData({
            chatReport,
            iouReport: expenseReport,
            recipient: {accountID: expenseReport.ownerAccountID},
            policy,
            createdTimestamp: originalCreated,
            isApprovalFlow: true,
            betas,
        });

        optimisticData.push(...holdReportOnyxData.optimisticData);
        successData.push(...holdReportOnyxData.successData);
        failureData.push(...holdReportOnyxData.failureData);
        optimisticHoldReportID = holdReportOnyxData.optimisticHoldReportID;
        optimisticHoldActionID = holdReportOnyxData.optimisticHoldActionID;
        optimisticCreatedReportForUnapprovedTransactionsActionID = holdReportOnyxData.optimisticCreatedReportForUnapprovedTransactionsActionID;
        optimisticHoldReportExpenseActionIDs = JSON.stringify(holdReportOnyxData.optimisticHoldReportExpenseActionIDs);
        optimisticReportActionCopyIDs = JSON.stringify(holdReportOnyxData.optimisticReportActionCopyIDs);
    }

    // Remove duplicates violations if we approve the report
    if (hasDuplicates) {
        let transactions = getReportTransactions(expenseReport.reportID).filter((transaction) =>
            isDuplicate(
                transaction,
                currentUserEmailParam,
                currentUserAccountIDParam,
                expenseReport,
                policy,
                getAllTransactionViolations()?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID],
            ),
        );
        if (!full) {
            transactions = transactions.filter((transaction) => !isOnHold(transaction));
        }

        for (const transaction of transactions) {
            const transactionViolations = getAllTransactionViolations()?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] ?? [];
            const newTransactionViolations = transactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: newTransactionViolations,
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: transactionViolations,
            });
        }
    }

    const parameters: ApproveMoneyRequestParams = {
        reportID: expenseReport.reportID,
        approvedReportActionID: optimisticApprovedReportAction.reportActionID,
        full,
        optimisticHoldReportID,
        optimisticHoldActionID,
        optimisticHoldReportExpenseActionIDs,
        optimisticReportActionCopyIDs,
        optimisticCreatedReportForUnapprovedTransactionsActionID,
    };

    onApproved?.();
    playSound(SOUNDS.SUCCESS);
    API.write(WRITE_COMMANDS.APPROVE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    return optimisticHoldReportID;
}

function determineIouReportID(chatReport: OnyxEntry<OnyxTypes.Report>, expenseReport: OnyxEntry<OnyxTypes.Report>): string | undefined {
    const iouReportActions = getAllReportActions(chatReport?.iouReportID);
    const expenseReportActions = getAllReportActions(expenseReport?.reportID);
    const iouCreatedAction = Object.values(iouReportActions).find((action) => isCreatedAction(action));
    const expenseCreatedAction = Object.values(expenseReportActions).find((action) => isCreatedAction(action));

    // The report created later will become the iouReportID of the chat report
    return (iouCreatedAction?.created ?? '') > (expenseCreatedAction?.created ?? '') ? chatReport?.iouReportID : expenseReport?.reportID;
}

function reopenReport(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'],
) {
    if (!expenseReport) {
        return;
    }

    const optimisticReopenedReportAction = buildOptimisticReopenedReportAction();
    const predictedNextState = CONST.REPORT.STATE_NUM.OPEN;
    const predictedNextStatus = CONST.REPORT.STATUS_NUM.OPEN;

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        isReopen: true,
        formatPhoneNumber,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        isReopen: true,
    });
    const optimisticReportActionsData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticReopenedReportAction.reportActionID]: {
                ...(optimisticReopenedReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: getReportActionText(optimisticReopenedReportAction),
            lastMessageHtml: getReportActionHtml(optimisticReopenedReportAction),
            stateNum: predictedNextState,
            statusNum: predictedNextStatus,
            hasReportBeenReopened: true,
            nextStep: optimisticNextStep,
            pendingFields: {
                partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    };

    const optimisticNextStepData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        optimisticIOUReportData,
        optimisticReportActionsData,
        optimisticNextStepData,
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReopenedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReopenedReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                stateNum: expenseReport.stateNum,
                statusNum: expenseReport.statusNum,
                hasReportBeenReopened: false,
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: predictedNextState,
                    childStatusNum: predictedNextStatus,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
            },
        });
    }

    if (chatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                // The report created later will become the iouReportID of the chat report
                iouReportID: determineIouReportID(chatReport, expenseReport),
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: chatReport.iouReportID,
            },
        });
    }

    const parameters: ReopenReportParams = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticReopenedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.REOPEN_REPORT, parameters, {optimisticData, successData, failureData});
}

function retractReport(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
    delegateEmail: string | undefined,
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'],
) {
    if (!expenseReport) {
        return;
    }

    const optimisticRetractReportAction = buildOptimisticRetractedReportAction(delegateEmail);
    const predictedNextState = CONST.REPORT.STATE_NUM.OPEN;
    const predictedNextStatus = CONST.REPORT.STATUS_NUM.OPEN;

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        formatPhoneNumber,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });
    const optimisticReportActionsData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticRetractReportAction.reportActionID]: {
                ...(optimisticRetractReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: getReportActionText(optimisticRetractReportAction),
            lastMessageHtml: getReportActionHtml(optimisticRetractReportAction),
            stateNum: predictedNextState,
            statusNum: predictedNextStatus,
            hasReportBeenRetracted: true,
            nextStep: optimisticNextStep,
            pendingFields: {
                partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    };

    const optimisticNextStepData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        optimisticIOUReportData,
        optimisticReportActionsData,
        optimisticNextStepData,
    ];

    if (chatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                // The report created later will become the iouReportID of the chat report
                iouReportID: determineIouReportID(chatReport, expenseReport),
            },
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticRetractReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticRetractReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                stateNum: expenseReport.stateNum,
                statusNum: expenseReport.statusNum,
                hasReportBeenRetracted: false,
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
    ];

    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: predictedNextState,
                    childStatusNum: predictedNextStatus,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
            },
        });
    }

    const parameters: RetractReportParams = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticRetractReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.RETRACT_REPORT, parameters, {optimisticData, successData, failureData});
}

function unapproveExpenseReport(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
    delegateEmail: string | undefined,
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'],
) {
    if (isEmptyObject(expenseReport)) {
        return;
    }

    const optimisticUnapprovedReportAction = buildOptimisticUnapprovedReportAction(expenseReport.total ?? 0, expenseReport.currency ?? '', expenseReport.reportID, delegateEmail);

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        shouldFixViolations: false,
        isUnapprove: true,
        formatPhoneNumber,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        shouldFixViolations: false,
        isUnapprove: true,
    });

    const optimisticReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticUnapprovedReportAction.reportActionID]: {
                ...(optimisticUnapprovedReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: getReportActionText(optimisticUnapprovedReportAction),
            lastMessageHtml: getReportActionHtml(optimisticUnapprovedReportAction),
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            nextStep: optimisticNextStep,
            pendingFields: {
                partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
            isCancelledIOU: false,
        },
    };

    const optimisticNextStepData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        optimisticIOUReportData,
        optimisticReportActionData,
        optimisticNextStepData,
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticUnapprovedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticUnapprovedReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
                isCancelledIOU: true,
            },
        },
    ];

    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    childStatusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
            },
        });
    }

    const parameters: UnapproveExpenseReportParams = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticUnapprovedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT, parameters, {optimisticData, successData, failureData});
}

function submitReport({
    expenseReport,
    policy,
    currentUserAccountIDParam,
    currentUserEmailParam,
    hasViolations,
    isASAPSubmitBetaEnabled,
    expenseReportCurrentNextStepDeprecated,
    userBillingGracePeriodEnds,
    amountOwed,
    onSubmitted,
    ownerBillingGracePeriodEnd,
    delegateEmail,
    formatPhoneNumber,
}: SubmitReportFunctionParams) {
    if (!expenseReport) {
        return;
    }
    if (expenseReport.policyID && shouldRestrictUserBillableActions(expenseReport.policyID, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }

    const parentReport = getReportOrDraftReport(expenseReport.parentReportID);
    const isCurrentUserManager = currentUserAccountIDParam === expenseReport.managerID;
    const isSubmitAndClosePolicy = isSubmitAndClose(policy);
    const adminAccountID = policy?.role === CONST.POLICY.ROLE.ADMIN ? currentUserAccountIDParam : undefined;
    const optimisticSubmittedReportAction = buildOptimisticSubmittedReportAction(
        expenseReport?.total ?? 0,
        expenseReport.currency ?? '',
        expenseReport.reportID,
        adminAccountID,
        policy?.approvalMode,
        delegateEmail,
    );
    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    // For DEW policies, only add optimistic submit action when offline
    const shouldAddOptimisticSubmitAction = !isDEWPolicy || getIsOffline();

    // buildOptimisticNextStep is used in parallel
    const optimisticNextStepDeprecated = isDEWPolicy
        ? null
        : // eslint-disable-next-line @typescript-eslint/no-deprecated
          buildNextStepNew({
              report: expenseReport,
              predictedNextStatus: isSubmitAndClosePolicy ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.SUBMITTED,
              policy,
              currentUserAccountIDParam,
              currentUserEmailParam,
              hasViolations,
              isASAPSubmitBetaEnabled,
              isUnapprove: true,
              formatPhoneNumber,
          });
    const optimisticNextStep = isDEWPolicy
        ? null
        : buildOptimisticNextStep({
              report: expenseReport,
              predictedNextStatus: isSubmitAndClosePolicy ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.SUBMITTED,
              policy,
              currentUserAccountIDParam,
              currentUserEmailParam,
              hasViolations,
              isASAPSubmitBetaEnabled,
              isUnapprove: true,
          });
    const approvalChain = getApprovalChain(policy, expenseReport);
    const managerID = getAccountIDsByLogins(approvalChain).at(0);

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>
    > = [];

    if (shouldAddOptimisticSubmitAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticSubmittedReportAction.reportActionID]: {
                    ...(optimisticSubmittedReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        });
    }

    if (!isSubmitAndClosePolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                ...expenseReport,
                ...(shouldAddOptimisticSubmitAction
                    ? {
                          lastMessageText: getReportActionText(optimisticSubmittedReportAction),
                          lastMessageHtml: getReportActionHtml(optimisticSubmittedReportAction),
                      }
                    : {}),
                // For DEW policies, don't optimistically update managerID, stateNum, statusNum, or nextStep
                // because DEW determines the actual workflow on the backend
                ...(isDEWPolicy
                    ? {}
                    : {
                          managerID,
                          stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                          statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                          nextStep: optimisticNextStep,
                          pendingFields: {
                              nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                          },
                      }),
            },
        });
    } else {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                ...expenseReport,
                // For DEW policies, don't optimistically update stateNum, statusNum, or nextStep
                ...(isDEWPolicy
                    ? {}
                    : {
                          stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                          statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                          nextStep: optimisticNextStep,
                          pendingFields: {
                              nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                          },
                      }),
            },
        });
    }

    if (!isDEWPolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: optimisticNextStepDeprecated,
        });
    }

    if (parentReport?.reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
            value: {
                ...parentReport,
                // In case its a manager who force submitted the report, they are the next user who needs to take an action
                hasOutstandingChildRequest: isCurrentUserManager,
                iouReportID: null,
            },
        });
    }

    if (isDEWPolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
            },
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [];
    if (!isDEWPolicy) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }
    if (shouldAddOptimisticSubmitAction) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticSubmittedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        });
    }

    if (isDEWPolicy) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: null,
            },
        });
    }

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                ...(isDEWPolicy
                    ? {}
                    : {
                          nextStep: expenseReport.nextStep ?? null,
                          pendingFields: {
                              nextStep: null,
                          },
                      }),
            },
        },
    ];
    if (shouldAddOptimisticSubmitAction) {
        if (isDEWPolicy) {
            // delete the optimistic SUBMITTED action as The backend creates a DEW_SUBMIT_FAILED action instead.
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                value: {
                    [optimisticSubmittedReportAction.reportActionID]: null,
                },
            });
        } else {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                value: {
                    [optimisticSubmittedReportAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                    },
                },
            });
        }
    }

    if (isDEWPolicy) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: null,
            },
        });
    }

    if (!isDEWPolicy) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        });
    }

    if (parentReport?.reportID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
            value: {
                hasOutstandingChildRequest: parentReport.hasOutstandingChildRequest,
                iouReportID: expenseReport.reportID,
            },
        });
    }

    const parameters: SubmitReportParams = {
        reportID: expenseReport.reportID,
        managerAccountID: getSubmitToAccountID(policy, expenseReport) ?? expenseReport.managerID,
        reportActionID: optimisticSubmittedReportAction.reportActionID,
    };

    onSubmitted?.();
    API.write(WRITE_COMMANDS.SUBMIT_REPORT, parameters, {optimisticData, successData, failureData});
}

function assignReportToMe(
    report: OnyxTypes.Report,
    accountID: number,
    email: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    reportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'],
) {
    const takeControlReportAction = buildOptimisticChangeApproverReportAction(accountID, accountID);

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: {...report, managerID: accountID},
        predictedNextStatus: report.statusNum ?? CONST.REPORT.STATUS_NUM.SUBMITTED,
        shouldFixViolations: false,
        isUnapprove: true,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        bypassNextApproverID: accountID,
        formatPhoneNumber,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: {...report, managerID: accountID},
        predictedNextStatus: report.statusNum ?? CONST.REPORT.STATUS_NUM.SUBMITTED,
        shouldFixViolations: false,
        isUnapprove: true,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        bypassNextApproverID: accountID,
    });

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    managerID: accountID,
                    nextStep: optimisticNextStep,
                    pendingFields: {
                        nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                value: {
                    [takeControlReportAction.reportActionID]: takeControlReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${report.reportID}`,
                value: optimisticNextStepDeprecated,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    pendingFields: {
                        nextStep: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                value: {
                    [takeControlReportAction.reportActionID]: {
                        pendingAction: null,
                        isOptimisticAction: null,
                        errors: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    managerID: report.managerID,
                    nextStep: report.nextStep ?? null,
                    pendingFields: {
                        nextStep: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${report?.reportID}`,
                value: reportCurrentNextStepDeprecated ?? null,
            },
        ],
    };

    const params: AssignReportToMeParams = {
        reportID: report.reportID,
        reportActionID: takeControlReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.ASSIGN_REPORT_TO_ME, params, onyxData);
}

function addReportApprover(
    report: OnyxTypes.Report,
    newApproverEmail: string,
    newApproverAccountID: number,
    accountID: number,
    email: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    reportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'],
) {
    const takeControlReportAction = buildOptimisticChangeApproverReportAction(newApproverAccountID, accountID);

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: {...report, managerID: newApproverAccountID},
        predictedNextStatus: report.statusNum ?? CONST.REPORT.STATUS_NUM.SUBMITTED,
        shouldFixViolations: false,
        isUnapprove: true,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        bypassNextApproverID: newApproverAccountID,
        formatPhoneNumber,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: {...report, managerID: newApproverAccountID},
        predictedNextStatus: report.statusNum ?? CONST.REPORT.STATUS_NUM.SUBMITTED,
        shouldFixViolations: false,
        isUnapprove: true,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        bypassNextApproverID: newApproverAccountID,
    });
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    managerID: newApproverAccountID,
                    nextStep: optimisticNextStep,
                    pendingFields: {
                        nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                value: {
                    [takeControlReportAction.reportActionID]: takeControlReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${report.reportID}`,
                value: optimisticNextStepDeprecated,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    pendingFields: {
                        nextStep: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                value: {
                    [takeControlReportAction.reportActionID]: {
                        pendingAction: null,
                        errors: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    managerID: report.managerID,
                    nextStep: report.nextStep ?? null,
                    pendingFields: {
                        nextStep: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${report?.reportID}`,
                value: reportCurrentNextStepDeprecated ?? null,
            },
        ],
    };

    const params: AddReportApproverParams = {
        reportID: report.reportID,
        reportActionID: takeControlReportAction.reportActionID,
        newApproverEmail,
    };

    API.write(WRITE_COMMANDS.ADD_REPORT_APPROVER, params, onyxData);
}

export {
    addReportApprover,
    approveMoneyRequest,
    assignReportToMe,
    canApproveIOU,
    canCancelPayment,
    canIOUBePaid,
    canSubmitReport,
    canUnapproveIOU,
    determineIouReportID,
    getBadgeFromIOUReport,
    getIOUReportActionWithBadge,
    getReportOriginalCreationTimestamp,
    reopenReport,
    retractReport,
    submitReport,
    unapproveExpenseReport,
};
