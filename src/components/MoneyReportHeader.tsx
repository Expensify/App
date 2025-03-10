import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {exportReportToCSV, exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {buildOptimisticNextStepForPreventSelfApprovalsEnabled} from '@libs/NextStepUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import {getOriginalMessage, getReportAction, isDeletedAction, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import getPrimaryAction from '@libs/ReportPrimaryActionUtils';
import getSecondaryActions from '@libs/ReportSecondaryActionUtils';
import {
    canBeExported,
    canDeleteTransaction,
    changeMoneyRequestHoldStatus,
    getArchiveReason,
    getBankAccountRoute,
    getIntegrationIcon,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getTransactionsWithReceipts,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
    isAllowedToApproveExpenseReport,
    isAllowedToSubmitDraftExpenseReport,
    isArchivedReportWithID,
    isInvoiceReport,
    isReportApproved,
    navigateBackOnDeleteTransaction,
    navigateToDetailsPage,
    reportTransactionsSelector,
} from '@libs/ReportUtils';
import {
    allHavePendingRTERViolation,
    checkIfShouldShowMarkAsCashButton,
    isDuplicate as isDuplicateTransactionUtils,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPayAtEndExpense as isPayAtEndExpenseTransactionUtils,
    isPending,
    isReceiptBeingScanned,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
    shouldShowRTERViolationMessage,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {
    approveMoneyRequest,
    canApproveIOU,
    cancelPayment,
    canIOUBePaid as canIOUBePaidAction,
    canSubmitReport,
    deleteMoneyRequest,
    deleteTrackExpense,
    payInvoice,
    payMoneyRequest,
    submitReport,
    unapproveExpenseReport,
} from '@userActions/IOU';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import useDelegateUserDetails from '@src/hooks/useDelegateUserDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import {DropdownOption} from './ButtonWithDropdownMenu/types';
import ConfirmModal from './ConfirmModal';
import DelegateNoAccessModal from './DelegateNoAccessModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import ExportWithDropdownMenu from './ReportActionItem/ExportWithDropdownMenu';
import SettlementButton from './SettlementButton';

type MoneyReportHeaderProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of report actions for the report */
    reportActions: OnyxTypes.ReportAction[];

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID: string | undefined;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({policy, report: moneyRequestReport, transactionThreadReportID, reportActions, onBackButtonPress}: MoneyReportHeaderProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID || CONST.DEFAULT_NUMBER_ID}`);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID || CONST.DEFAULT_NUMBER_ID}`);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);
    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => reportTransactionsSelector(_transactions, moneyRequestReport?.reportID),
        initialValue: [],
    });
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${isMoneyRequestAction(requestParentReportAction) && getOriginalMessage(requestParentReportAction)?.IOUTransactionID}`);
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true});
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);

    const {isPaidAnimationRunning, isApprovedAnimationRunning, startAnimation, startApprovedAnimation} = usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(moneyRequestReport);
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isDeletedParentAction = !!requestParentReportAction && isDeletedAction(requestParentReportAction);
    const isDuplicate = isDuplicateTransactionUtils(transaction?.transactionID) && (!isReportApproved({report: moneyRequestReport}) || isApprovedAnimationRunning);

    // Only the requestor can delete the request, admins can only edit it.
    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && requestParentReportAction.actorAccountID === session?.accountID;
    const canDeleteRequest = isActionOwner && canDeleteTransaction(moneyRequestReport) && !isDeletedParentAction;
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const policyType = policy?.type;
    const connectedIntegration = getConnectedIntegration(policy);
    const navigateBackToAfterDelete = useRef<Route>();
    const hasScanningReceipt = getTransactionsWithReceipts(moneyRequestReport?.reportID).some((t) => isReceiptBeingScanned(t));
    const hasOnlyPendingTransactions = useMemo(() => {
        return !!transactions && transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    }, [transactions]);
    const transactionIDs = useMemo(() => transactions?.map((t) => t.transactionID) ?? [], [transactions]);
    const [allViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const violations = useMemo(
        () => Object.fromEntries(Object.entries(allViolations ?? {}).filter(([key]) => transactionIDs.includes(key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '')))),
        [allViolations, transactionIDs],
    );
    // Check if there is pending rter violation in all transactionViolations with given transactionIDs.
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactionIDs, violations);
    // Check if user should see broken connection violation warning.
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, moneyRequestReport, policy, violations);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const isPayAtEndExpense = isPayAtEndExpenseTransactionUtils(transaction);
    const isArchivedReport = isArchivedReportWithID(moneyRequestReport?.reportID);
    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`, {selector: getArchiveReason});

    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false, shouldCheckApprovedState = true) =>
            canIOUBePaidAction(moneyRequestReport, chatReport, policy, transaction ? [transaction] : undefined, onlyShowPayElsewhere, undefined, undefined, shouldCheckApprovedState),
        [moneyRequestReport, chatReport, policy, transaction],
    );

    const canIOUBePaid = useMemo(() => getCanIOUBePaid(), [getCanIOUBePaid]);
    const onlyShowPayElsewhere = useMemo(() => !canIOUBePaid && getCanIOUBePaid(true), [canIOUBePaid, getCanIOUBePaid]);

    const shouldShowMarkAsCashButton =
        !!transactionThreadReportID && checkIfShouldShowMarkAsCashButton(hasAllPendingRTERViolations, shouldShowBrokenConnectionViolation, moneyRequestReport, policy);

    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;

    const shouldShowApproveButton = useMemo(
        () => (canApproveIOU(moneyRequestReport, policy) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning,
        [moneyRequestReport, policy, hasOnlyPendingTransactions, isApprovedAnimationRunning],
    );

    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(moneyRequestReport);

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const filteredTransactions = transactions?.filter((t) => t) ?? [];
    const shouldShowSubmitButton = canSubmitReport(moneyRequestReport, policy, filteredTransactions, violations);

    const shouldShowExportIntegrationButton = !shouldShowPayButton && !shouldShowSubmitButton && connectedIntegration && isAdmin && canBeExported(moneyRequestReport);

    const shouldShowSettlementButton =
        !shouldShowSubmitButton &&
        (shouldShowPayButton || shouldShowApproveButton) &&
        !shouldShowRTERViolationMessage(transactions) &&
        !shouldShowExportIntegrationButton &&
        !shouldShowBrokenConnectionViolation;

    const shouldDisableSubmitButton = shouldShowSubmitButton && !isAllowedToSubmitDraftExpenseReport(moneyRequestReport);
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const shouldShowStatusBar =
        hasAllPendingRTERViolations || shouldShowBrokenConnectionViolation || hasOnlyHeldExpenses || hasScanningReceipt || isPayAtEndExpense || hasOnlyPendingTransactions;

    // When prevent self-approval is enabled, we need to show the optimistic next step
    // We should always show this optimistic message for policies with preventSelfApproval
    // to avoid any flicker during transitions between online/offline states
    const optimisticNextStep = policy?.preventSelfApproval ? buildOptimisticNextStepForPreventSelfApprovalsEnabled() : nextStep;

    const shouldShowNextStep = transactions?.length !== 0 && isFromPaidPolicy && !!optimisticNextStep?.message?.length && !shouldShowStatusBar;
    const shouldShowAnyButton =
        isDuplicate ||
        shouldShowSettlementButton ||
        shouldShowApproveButton ||
        shouldShowSubmitButton ||
        shouldShowNextStep ||
        shouldShowMarkAsCashButton ||
        shouldShowExportIntegrationButton;
    const bankAccountRoute = getBankAccountRoute(chatReport);
    const formattedAmount = convertToDisplayString(reimbursableSpend, moneyRequestReport?.currency);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const displayedAmount = isAnyTransactionOnHold && canAllowSettlement && hasValidNonHeldAmount ? nonHeldAmount : formattedAmount;
    const isMoreContentShown = shouldShowNextStep || shouldShowStatusBar || (shouldShowAnyButton && shouldUseNarrowLayout);
    const {isDelegateAccessRestricted} = useDelegateUserDetails();
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;

    const confirmPayment = useCallback(
        (type?: PaymentMethodType | undefined, payAsBusiness?: boolean) => {
            if (!type || !chatReport) {
                return;
            }
            setPaymentType(type);
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            if (isDelegateAccessRestricted) {
                setIsNoDelegateAccessMenuVisible(true);
            } else if (isAnyTransactionOnHold) {
                setIsHoldMenuVisible(true);
            } else if (isInvoiceReport(moneyRequestReport)) {
                startAnimation();
                payInvoice(type, chatReport, moneyRequestReport, payAsBusiness);
            } else {
                startAnimation();
                payMoneyRequest(type, chatReport, moneyRequestReport, true);
            }
        },
        [chatReport, isAnyTransactionOnHold, isDelegateAccessRestricted, moneyRequestReport, startAnimation],
    );

    const confirmApproval = () => {
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            setIsNoDelegateAccessMenuVisible(true);
        } else if (isAnyTransactionOnHold) {
            setIsHoldMenuVisible(true);
        } else {
            startApprovedAnimation();
            approveMoneyRequest(moneyRequestReport, true);
        }
    };

    const markAsCash = useCallback(() => {
        if (!requestParentReportAction) {
            return;
        }
        const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
        const reportID = transactionThreadReport?.reportID;

        if (!iouTransactionID || !reportID) {
            return;
        }
        markAsCashAction(iouTransactionID, reportID);
    }, [requestParentReportAction, transactionThreadReport?.reportID]);

    const getStatusIcon: (src: IconAsset) => React.ReactNode = (src) => (
        <Icon
            src={src}
            height={variables.iconSizeSmall}
            width={variables.iconSizeSmall}
            fill={theme.icon}
        />
    );

    const getStatusBarProps: () => MoneyRequestHeaderStatusBarProps | undefined = () => {
        if (isPayAtEndExpense) {
            if (!isArchivedReport) {
                return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.bookingPendingDescription')};
            }
            if (isArchivedReport && archiveReason === CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED) {
                return {icon: getStatusIcon(Expensicons.Box), description: translate('iou.bookingArchivedDescription')};
            }
        }
        if (hasOnlyHeldExpenses) {
            return {icon: getStatusIcon(Expensicons.Stopwatch), description: translate('iou.expensesOnHold')};
        }
        if (!!transaction?.transactionID && shouldShowBrokenConnectionViolation) {
            return {
                icon: getStatusIcon(Expensicons.Hourglass),
                description: (
                    <BrokenConnectionDescription
                        transactionID={transaction?.transactionID}
                        report={moneyRequestReport}
                        policy={policy}
                    />
                ),
            };
        }
        if (hasAllPendingRTERViolations) {
            return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (hasOnlyPendingTransactions) {
            return {icon: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (hasScanningReceipt) {
            return {icon: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const statusBarProps = getStatusBarProps();
    const shouldAddGapToContents =
        shouldUseNarrowLayout &&
        (isDuplicate || shouldShowSettlementButton || !!shouldShowExportIntegrationButton || shouldShowSubmitButton || shouldShowMarkAsCashButton) &&
        (!!statusBarProps || shouldShowNextStep);

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy?.harvesting?.enabled,
        [chatReport?.isOwnPolicyExpenseChat, policy?.harvesting?.enabled],
    );

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingHoldUseExplained || dismissedHoldUseExplanation || !isOnHold) {
            return;
        }
        Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation.getReportRHPActiveRoute()));
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);

    const unholdAction = () => {
        const parentReportAction = getReportAction(moneyRequestReport?.parentReportID, moneyRequestReport?.parentReportActionID);

        const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
        if (!moneyRequestAction) {
            throw new Error('boom');
        }

        changeMoneyRequestHoldStatus(moneyRequestAction);
    };

    if (!moneyRequestReport) {
        return null;
    }
    if (!policy) {
        return null;
    }

    const primaryAction = getPrimaryAction(moneyRequestReport, policy, transactions, violations);

    const primaryActions = {
        [CONST.REPORT.PRIMARY_ACTIONS.SUBMIT]: (
            <Button
                success={isWaitingForSubmissionFromCurrentUser}
                text={translate('common.submit')}
                style={[styles.mnw120, styles.pv2, styles.pr0]}
                onPress={() => submitReport(moneyRequestReport)}
                isDisabled={shouldDisableSubmitButton}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.APPROVE]: (
            <Button
                success
                onPress={confirmApproval}
                text="Approve"
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.PAY]: (
            <SettlementButton
                onlyShowPayElsewhere={onlyShowPayElsewhere}
                currency={moneyRequestReport?.currency}
                confirmApproval={confirmApproval}
                policyID={moneyRequestReport?.policyID}
                chatReportID={chatReport?.reportID}
                iouReport={moneyRequestReport}
                onPress={confirmPayment}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                addBankAccountRoute={bankAccountRoute}
                shouldHidePaymentOptions={!shouldShowPayButton}
                shouldShowApproveButton={shouldShowApproveButton}
                shouldDisableApproveButton={shouldDisableApproveButton}
                style={[styles.pv2]}
                formattedAmount={!hasOnlyHeldExpenses ? displayedAmount : ''}
                isDisabled={isOffline && !canAllowSettlement}
                isLoading={!isOffline && !canAllowSettlement}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING]: (
            <Button
                success
                text={translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegration})}
                style={styles.p0}
                onPress={() => {
                    exportToIntegration(moneyRequestReport.reportID, connectedIntegration);
                }}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD]: (
            <Button
                success
                text="Unhold"
                onPress={unholdAction}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES]: (
            <Button
                success
                text={translate('iou.reviewDuplicates')}
                style={styles.p0}
                onPress={() => {
                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(transactionThreadReportID, Navigation.getReportRHPActiveRoute()));
                }}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH]: (
            <Button
                success
                text={translate('iou.markAsCash')}
                style={[styles.pv2, styles.pr0]}
                onPress={markAsCash}
            />
        ),
    };

    const secondaryActions = getSecondaryActions(moneyRequestReport, policy, transactions, violations);

    const secondaryActionsImpl: Record<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>, DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>>> = {
        [CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: Expensicons.Info,
            onSelected: () => {
                navigateToDetailsPage(moneyRequestReport, Navigation.getReportRHPActiveRoute());
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD,
            text: translate('common.download'),
            icon: Expensicons.Download,
            onSelected: () => {
                if (isOffline) {
                    return;
                }

                exportReportToCSV({reportID: moneyRequestReport.reportID, transactionIDList: transactionIDs}, () => {
                    console.log('Ups');
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SUBMIT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.SUBMIT,
            text: translate('common.submit'),
            icon: Expensicons.Send,
            onSelected: () => {
                submitReport(moneyRequestReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.APPROVE]: {
            text: translate('iou.approve'),
            icon: Expensicons.ThumbsUp,
            value: CONST.REPORT.SECONDARY_ACTIONS.APPROVE,
            onSelected: () => {
                approveMoneyRequest(moneyRequestReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE]: {
            text: translate('iou.unapprove'),
            icon: Expensicons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
            onSelected: () => {
                unapproveExpenseReport(moneyRequestReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT]: {
            text: translate('iou.cancelPayment'),
            icon: Expensicons.Trashcan, // Todo change icon
            value: CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT,
            onSelected: () => {
                if (!chatReport) {
                    return;
                }
                cancelPayment(moneyRequestReport, chatReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING]: {
            text: translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegration}),
            icon: getIntegrationIcon(connectedIntegration),
            value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING,
            onSelected: () => {
                exportToIntegration(moneyRequestReport.reportID, connectedIntegration);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED]: {
            text: translate('workspace.common.markAsExported'),
            icon: Expensicons.CheckCircle,
            value: CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED,
            onSelected: () => {
                markAsManuallyExported(moneyRequestReport.reportID, connectedIntegration);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: Expensicons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.HOLD,
            onSelected: () => {
                const parentReportAction = getReportAction(moneyRequestReport?.parentReportID, moneyRequestReport?.parentReportActionID);

                const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
                if (!moneyRequestAction) {
                    throw new Error('boom');
                }

                changeMoneyRequestHoldStatus(moneyRequestAction);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE]: {
            text: 'Change workspace',
            icon: Expensicons.Buildings,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE,
            onSelected: () => {
                console.log('To be implemented');
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DELETE]: {
            text: translate('common.delete'),
            icon: Expensicons.Trashcan,
            value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
            onSelected: () => {
                // deleteMoneyRequest();
            },
        },
    };

    const applicableSecondaryActions = secondaryActions.map((action) => secondaryActionsImpl[action]).filter((p) => !!p);

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
            >
                {!!primaryAction && primaryActions[primaryAction]}
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText="More"
                    options={applicableSecondaryActions}
                    isSplitButton={false}
                />
            </HeaderWithBackButton>
            {!!isMoreContentShown && (
                <View style={[styles.dFlex, styles.flexColumn, shouldAddGapToContents && styles.gap3, styles.pb3, styles.ph5]}>
                    {shouldShowNextStep && <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />}
                    {!!statusBarProps && (
                        <MoneyRequestHeaderStatusBar
                            icon={statusBarProps.icon}
                            description={statusBarProps.description}
                        />
                    )}
                </View>
            )}
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    onClose={() => setIsHoldMenuVisible(false)}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    chatReport={chatReport}
                    moneyRequestReport={moneyRequestReport}
                    startAnimation={() => {
                        if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                            startApprovedAnimation();
                        } else {
                            startAnimation();
                        }
                    }}
                    transactionCount={transactionIDs?.length ?? 0}
                />
            )}
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </View>
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';

export default MoneyReportHeader;
