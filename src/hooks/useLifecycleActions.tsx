import {delegateEmailSelector} from '@selectors/Account';
import React from 'react';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {ActionHandledType} from '@components/Modal/Global/HoldMenuModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {SecondaryActionEntry} from '@components/MoneyReportHeaderActions/types';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import {search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getValidConnectedIntegration} from '@libs/PolicyUtils';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import {
    getIntegrationNameFromExportMessage as getIntegrationNameFromExportMessageUtils,
    getNextApproverAccountID,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasViolations as hasViolationsReportUtils,
    isExported as isExportedUtils,
    isReportOwner,
    shouldBlockSubmitDueToStrictPolicyRules,
} from '@libs/ReportUtils';
import {hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils} from '@libs/TransactionUtils';
import {cancelPayment} from '@userActions/IOU/PayMoneyRequest';
import {approveMoneyRequest, reopenReport, retractReport, submitReport, unapproveExpenseReport} from '@userActions/IOU/ReportWorkflow';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useConfirmModal from './useConfirmModal';
import useConfirmPendingRTERAndProceed from './useConfirmPendingRTERAndProceed';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import usePermissions from './usePermissions';
import useSearchShouldCalculateTotals from './useSearchShouldCalculateTotals';
import useStrictPolicyRules from './useStrictPolicyRules';
import useThemeStyles from './useThemeStyles';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type UseLifecycleActionsParams = {
    reportID: string | undefined;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
    onHoldMenuOpen: (requestType: ActionHandledType, onConfirm?: () => void) => void;
};

type UseLifecycleActionsResult = {
    actions: Record<string, SecondaryActionEntry>;
    confirmApproval: (skipAnimation?: boolean) => void;
    handleSubmitReport: (skipAnimation?: boolean) => void;
    shouldBlockSubmit: boolean;
    isBlockSubmitDueToPreventSelfApproval: boolean;
};

/**
 * Provides report lifecycle transition actions (submit, approve, unapprove, cancel payment, retract, reopen)
 * and their associated guards (delegate access, hold, pending RTER, strict policy rules).
 */
function useLifecycleActions({reportID, startApprovedAnimation, startSubmittingAnimation, onHoldMenuOpen}: UseLifecycleActionsParams): UseLifecycleActionsResult {
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const transactions = Object.values(reportTransactions);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {accountID, email} = currentUserPersonalDetails;

    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const {currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Send', 'ThumbsUp', 'CircularArrowBackwards', 'Clear']);

    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover =
        isReportOwner(moneyRequestReport) && (nextApproverAccountID === moneyRequestReport?.ownerAccountID || moneyRequestReport?.managerID === moneyRequestReport?.ownerAccountID);
    const isBlockSubmitDueToPreventSelfApproval = !!(isSubmitterSameAsNextApprover && policy?.preventSelfApproval);

    const isBlockSubmitDueToStrictPolicyRules = shouldBlockSubmitDueToStrictPolicyRules(
        moneyRequestReport?.reportID,
        violations,
        areStrictPolicyRulesEnabled,
        accountID,
        email ?? '',
        transactions,
    );

    const shouldBlockSubmit = isBlockSubmitDueToStrictPolicyRules || isBlockSubmitDueToPreventSelfApproval;

    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');

    const isExported = isExportedUtils(reportActions, moneyRequestReport);
    const integrationNameFromExportMessage = isExported ? getIntegrationNameFromExportMessageUtils(reportActions) : null;

    const connectedIntegration = getValidConnectedIntegration(policy);
    const connectedIntegrationName = connectedIntegration
        ? translate('workspace.accounting.connectionName', {
              connectionName: connectedIntegration,
          })
        : '';

    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);

    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(transactions, allTransactionViolations, email ?? '', accountID, moneyRequestReport, policy);

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, allTransactionViolations, reportActions);
    };

    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const confirmApproval = (skipAnimation = false) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        if (isAnyTransactionOnHold) {
            onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.APPROVE, skipAnimation ? undefined : () => startApprovedAnimation());
            return;
        }
        if (!skipAnimation) {
            startApprovedAnimation();
        }
        approveMoneyRequest({
            expenseReport: moneyRequestReport,
            expenseReportPolicy: policy,
            policy,
            currentUserAccountIDParam: accountID,
            currentUserEmailParam: email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            expenseReportCurrentNextStepDeprecated: nextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            full: true,
            onApproved: () => {
                if (skipAnimation) {
                    return;
                }
                startApprovedAnimation();
            },
            delegateEmail,
        });
        if (skipAnimation) {
            clearSelectedTransactions(true);
        }
    };

    const handleSubmitReport = (skipAnimation = false) => {
        if (!moneyRequestReport || shouldBlockSubmit) {
            return;
        }

        const doSubmit = () => {
            submitReport({
                expenseReport: moneyRequestReport,
                policy,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: nextStep,
                userBillingGracePeriodEnds,
                amountOwed,
                onSubmitted: () => {
                    if (skipAnimation) {
                        return;
                    }
                    startSubmittingAnimation();
                },
                ownerBillingGracePeriodEnd,
                delegateEmail,
            });
            if (currentSearchQueryJSON && !isOffline) {
                search({
                    searchKey: currentSearchKey,
                    shouldCalculateTotals,
                    offset: 0,
                    queryJSON: currentSearchQueryJSON,
                    isOffline,
                    isLoading: !!currentSearchResults?.search?.isLoading,
                });
            }
            if (skipAnimation) {
                clearSelectedTransactions(true);
            }
        };

        confirmPendingRTERAndProceed(doSubmit);
    };

    const actions: Record<string, SecondaryActionEntry> = {
        [CONST.REPORT.SECONDARY_ACTIONS.SUBMIT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.SUBMIT,
            text: translate('common.submit'),
            icon: expensifyIcons.Send,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SUBMIT,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                confirmPendingRTERAndProceed(() => {
                    submitReport({
                        expenseReport: moneyRequestReport,
                        policy,
                        currentUserAccountIDParam: accountID,
                        currentUserEmailParam: email ?? '',
                        hasViolations,
                        isASAPSubmitBetaEnabled,
                        expenseReportCurrentNextStepDeprecated: nextStep,
                        userBillingGracePeriodEnds,
                        amountOwed,
                        ownerBillingGracePeriodEnd,
                        delegateEmail,
                    });
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.APPROVE]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.APPROVE,
            text: translate('iou.approve'),
            icon: expensifyIcons.ThumbsUp,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.APPROVE,
            onSelected: confirmApproval,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
            text: translate('iou.unapprove'),
            icon: expensifyIcons.CircularArrowBackwards,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.UNAPPROVE,
            onSelected: async () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                if (isExported) {
                    const unapproveWarningText = (
                        <Text>
                            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text>{' '}
                            <Text>{translate('iou.unapproveWithIntegrationWarning', connectedIntegrationName)}</Text>
                        </Text>
                    );

                    const result = await showConfirmModal({
                        title: translate('iou.unapproveReport'),
                        prompt: unapproveWarningText,
                        confirmText: translate('iou.unapproveReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                }

                unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT,
            text: translate('iou.cancelPayment'),
            icon: expensifyIcons.Clear,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CANCEL_PAYMENT,
            onSelected: async () => {
                const result = await showConfirmModal({
                    title: translate('iou.cancelPayment'),
                    prompt: translate('iou.cancelPaymentConfirmation'),
                    confirmText: translate('iou.cancelPayment'),
                    cancelText: translate('common.dismiss'),
                    danger: true,
                });

                if (result.action !== ModalActions.CONFIRM || !chatReport) {
                    return;
                }

                cancelPayment(moneyRequestReport, chatReport, policy, isASAPSubmitBetaEnabled, accountID, email ?? '', hasViolations);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.RETRACT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.RETRACT,
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.RETRACT,
            onSelected: async () => {
                if (isExported) {
                    const reopenExportedReportWarningText = (
                        <Text>
                            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')} </Text>
                            <Text>
                                {translate('iou.reopenExportedReportConfirmation', {
                                    connectionName: integrationNameFromExportMessage ?? '',
                                })}
                            </Text>
                        </Text>
                    );

                    const result = await showConfirmModal({
                        title: translate('iou.reopenReport'),
                        prompt: reopenExportedReportWarningText,
                        confirmText: translate('iou.reopenReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                }

                retractReport(moneyRequestReport, chatReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REOPEN]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.REOPEN,
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REOPEN,
            onSelected: async () => {
                if (isExported) {
                    const reopenExportedReportWarningText = (
                        <Text>
                            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')} </Text>
                            <Text>
                                {translate('iou.reopenExportedReportConfirmation', {
                                    connectionName: integrationNameFromExportMessage ?? '',
                                })}
                            </Text>
                        </Text>
                    );

                    const result = await showConfirmModal({
                        title: translate('iou.reopenReport'),
                        prompt: reopenExportedReportWarningText,
                        confirmText: translate('iou.reopenReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                }

                reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, chatReport);
            },
        },
    };

    return {
        actions,
        confirmApproval,
        handleSubmitReport,
        shouldBlockSubmit,
        isBlockSubmitDueToPreventSelfApproval,
    };
}

export default useLifecycleActions;
export type {UseLifecycleActionsParams, UseLifecycleActionsResult};
