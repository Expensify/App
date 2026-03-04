import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import {openOldDotLink} from '@libs/actions/Link';
import {createTransactionThreadReport, exportToIntegration} from '@libs/actions/Report';
import {search} from '@libs/actions/Search';
import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getConnectedIntegration, getValidConnectedIntegration, hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {getIOUActionForReportID, getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getAllExpensesToHoldIfApplicable} from '@libs/ReportPrimaryActionUtils';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {isDuplicate} from '@libs/TransactionUtils';
import {markRejectViolationAsResolved, submitReport} from '@userActions/IOU';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedSubmitButton from './AnimatedSubmitButton';
import Button from './Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import {ModalActions} from './Modal/Global/ModalContext';
import {useMoneyReportHeaderContext} from './MoneyReportHeaderContext';
import {useSearchStateContext} from './Search/SearchContext';
import AnimatedSettlementButton from './SettlementButton/AnimatedSettlementButton';

type MoneyReportHeaderPrimaryActionProps = {
    /** The primary action type to render */
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';

    /** The money request report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The chat report ID */
    chatReportID: string | undefined;

    /** Report actions for the report */
    reportActions: OnyxTypes.ReportAction[];

    /** All transactions in the report */
    transactions: OnyxTypes.Transaction[];

    /** The single transaction (for transaction thread) */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction violations for the single transaction */
    transactionViolations: OnyxTypes.TransactionViolation[];

    /** The transaction thread report */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** The transaction thread report ID */
    transactionThreadReportID: string | undefined;

    /** The parent report action for the request */
    requestParentReportAction: OnyxTypes.ReportAction | null | undefined;

    /** The report's next step */
    nextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;

    /** All transaction violations collection */
    allTransactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;

    /** Intro selected NVP */
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;

    /** Whether the paid animation is running */
    isPaidAnimationRunning: boolean;

    /** Whether the approved animation is running */
    isApprovedAnimationRunning: boolean;

    /** Whether the submitting animation is running */
    isSubmittingAnimationRunning: boolean;

    /** Stop the running animation */
    stopAnimation: () => void;

    /** Start the submitting animation */
    startSubmittingAnimation: () => void;

    /** Whether submit should be blocked */
    shouldBlockSubmit: boolean;

    /** Whether submit is blocked due to prevent self approval */
    isBlockSubmitDueToPreventSelfApproval: boolean;

    /** Whether the pay button should be shown */
    shouldShowPayButton: boolean;

    /** Whether the approve button should be shown */
    shouldShowApproveButton: boolean;

    /** Whether the approve button should be disabled */
    shouldDisableApproveButton: boolean;

    /** Whether settlement is allowed */
    canAllowSettlement: boolean;

    /** The total formatted amount */
    totalAmount: string;

    /** Whether to only show pay elsewhere */
    onlyShowPayElsewhere: boolean;

    /** Whether the report is exported */
    isExported: boolean;

    /** Whether the report has violations */
    hasViolations: boolean;

    /** User billing grace end periods */
    userBillingGraceEndPeriods: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
};

function MoneyReportHeaderPrimaryAction({
    primaryAction,
    report: moneyRequestReport,
    policy,
    chatReportID,
    reportActions,
    transactions,
    transaction,
    transactionViolations,
    transactionThreadReport,
    transactionThreadReportID,
    requestParentReportAction,
    nextStep,
    allTransactionViolations,
    introSelected,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    isSubmittingAnimationRunning,
    stopAnimation,
    startSubmittingAnimation,
    shouldBlockSubmit,
    isBlockSubmitDueToPreventSelfApproval,
    shouldShowPayButton,
    shouldShowApproveButton,
    shouldDisableApproveButton,
    canAllowSettlement,
    totalAmount,
    onlyShowPayElsewhere,
    isExported,
    hasViolations,
    userBillingGraceEndPeriods,
}: MoneyReportHeaderPrimaryActionProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {showConfirmModal} = useConfirmModal();
    const {confirmPayment, confirmApproval} = useMoneyReportHeaderContext();
    const {currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);

    switch (primaryAction) {
        case CONST.REPORT.PRIMARY_ACTIONS.SUBMIT:
            return (
                <AnimatedSubmitButton
                    success
                    text={translate('common.submit')}
                    onPress={() => {
                        if (!moneyRequestReport || shouldBlockSubmit) {
                            return;
                        }
                        if (hasDynamicExternalWorkflow(policy) && !isDEWBetaEnabled) {
                            showConfirmModal({
                                confirmText: translate('customApprovalWorkflow.goToExpensifyClassic'),
                                title: translate('customApprovalWorkflow.title'),
                                prompt: translate('customApprovalWorkflow.description'),
                                shouldShowCancelButton: false,
                            }).then((result) => {
                                if (result.action !== ModalActions.CONFIRM) {
                                    return;
                                }
                                openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                            });
                            return;
                        }
                        startSubmittingAnimation();
                        submitReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, userBillingGraceEndPeriods);
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
                    }}
                    isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                    onAnimationFinish={stopAnimation}
                    isDisabled={shouldBlockSubmit}
                />
            );

        case CONST.REPORT.PRIMARY_ACTIONS.APPROVE:
            return (
                <Button
                    success
                    onPress={confirmApproval}
                    text={translate('iou.approve')}
                    isDisabled={isBlockSubmitDueToPreventSelfApproval}
                />
            );

        case CONST.REPORT.PRIMARY_ACTIONS.PAY:
            return (
                <AnimatedSettlementButton
                    isPaidAnimationRunning={isPaidAnimationRunning}
                    isApprovedAnimationRunning={isApprovedAnimationRunning}
                    onAnimationFinish={stopAnimation}
                    formattedAmount={totalAmount}
                    canIOUBePaid
                    onlyShowPayElsewhere={onlyShowPayElsewhere}
                    currency={moneyRequestReport?.currency}
                    confirmApproval={confirmApproval}
                    policyID={moneyRequestReport?.policyID}
                    chatReportID={chatReportID}
                    iouReport={moneyRequestReport}
                    onPress={confirmPayment}
                    enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                    shouldHidePaymentOptions={!shouldShowPayButton}
                    shouldShowApproveButton={shouldShowApproveButton}
                    shouldDisableApproveButton={shouldDisableApproveButton}
                    isDisabled={isOffline && !canAllowSettlement}
                    isLoading={!isOffline && !canAllowSettlement}
                />
            );

        case CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING: {
            const connectedIntegration = getValidConnectedIntegration(policy);
            const connectedIntegrationFallback = getConnectedIntegration(policy);
            return (
                <Button
                    success
                    // connectedIntegration is guaranteed non-null when EXPORT_TO_ACCOUNTING primary action is active
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    text={translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegration!})}
                    onPress={() => {
                        if (!connectedIntegration || !moneyRequestReport) {
                            return;
                        }
                        if (isExported) {
                            showConfirmModal({
                                title: translate('workspace.exportAgainModal.title'),
                                prompt: translate('workspace.exportAgainModal.description', {
                                    connectionName: connectedIntegration ?? connectedIntegrationFallback,
                                    reportName: moneyRequestReport?.reportName ?? '',
                                }),
                                confirmText: translate('workspace.exportAgainModal.confirmText'),
                                cancelText: translate('workspace.exportAgainModal.cancelText'),
                            }).then((result) => {
                                if (result.action !== ModalActions.CONFIRM) {
                                    return;
                                }
                                exportToIntegration(moneyRequestReport.reportID, connectedIntegration);
                            });
                            return;
                        }
                        exportToIntegration(moneyRequestReport.reportID, connectedIntegration);
                    }}
                />
            );
        }

        case CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD:
            return (
                <Button
                    success
                    text={translate('iou.unhold')}
                    onPress={() => {
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }

                        const parentReportAction = getReportAction(moneyRequestReport?.parentReportID, moneyRequestReport?.parentReportActionID);
                        const IOUActions = getAllExpensesToHoldIfApplicable(moneyRequestReport, reportActions, transactions, policy);

                        if (IOUActions.length) {
                            for (const action of IOUActions) {
                                changeMoneyRequestHoldStatus(action);
                            }
                            return;
                        }

                        const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
                        if (!moneyRequestAction) {
                            return;
                        }

                        changeMoneyRequestHoldStatus(moneyRequestAction);
                    }}
                />
            );

        case CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH: {
            const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
            return (
                <Button
                    success
                    text={translate('iou.markAsCash')}
                    onPress={() => {
                        if (!requestParentReportAction) {
                            return;
                        }
                        const reportID = transactionThreadReport?.reportID;
                        if (!iouTransactionID || !reportID) {
                            return;
                        }
                        markAsCashAction(iouTransactionID, reportID, transactionViolations);
                    }}
                />
            );
        }

        case CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_RESOLVED:
            return (
                <Button
                    success
                    onPress={() => {
                        if (!transaction?.transactionID) {
                            return;
                        }
                        markRejectViolationAsResolved(transaction.transactionID, transactionThreadReport?.reportID);
                    }}
                    text={translate('iou.reject.markAsResolved')}
                />
            );

        case CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES:
            return (
                <Button
                    success
                    text={translate('iou.reviewDuplicates')}
                    onPress={() => {
                        const duplicateTransaction = transactions.find((reportTransaction) =>
                            isDuplicate(
                                reportTransaction,
                                email ?? '',
                                accountID,
                                moneyRequestReport,
                                policy,
                                allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + reportTransaction.transactionID],
                            ),
                        );

                        let threadID = transactionThreadReportID ?? getThreadReportIDsForTransactions(reportActions, duplicateTransaction ? [duplicateTransaction] : []).at(0);

                        if (!threadID && duplicateTransaction) {
                            const transactionID = duplicateTransaction.transactionID;
                            const iouAction = getIOUActionForReportID(moneyRequestReport?.reportID, transactionID);
                            const createdTransactionThreadReport = createTransactionThreadReport(introSelected, moneyRequestReport, iouAction);
                            threadID = createdTransactionThreadReport?.reportID;
                        }
                        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(threadID));
                    }}
                />
            );

        default:
            return null;
    }
}

MoneyReportHeaderPrimaryAction.displayName = 'MoneyReportHeaderPrimaryAction';

export default MoneyReportHeaderPrimaryAction;
