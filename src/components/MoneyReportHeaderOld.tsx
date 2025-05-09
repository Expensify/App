import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOUReportPreviewButtonType, getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {buildOptimisticNextStepForPreventSelfApprovalsEnabled} from '@libs/NextStepUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import {getOriginalMessage, isDeletedAction, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {
    canBeExported,
    canDeleteTransaction,
    getArchiveReason,
    getBankAccountRoute,
    getNonHeldAndFullAmount,
    getTransactionsWithReceipts,
    hasActionsWithErrors,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasMissingSmartscanFields,
    hasNoticeTypeViolations,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasReportViolations,
    hasUpdatedTotal,
    hasViolations,
    hasWarningTypeViolations,
    isAllowedToApproveExpenseReport,
    isAllowedToSubmitDraftExpenseReport,
    isInvoiceReport,
    isProcessingReport,
    isReportApproved,
    isReportOwner,
    isSettled,
    isWaitingForSubmissionFromCurrentUser as isWaitingForSubmissionFromCurrentUserReportUtils,
    navigateBackOnDeleteTransaction,
    reportTransactionsSelector,
} from '@libs/ReportUtils';
import {
    allHavePendingRTERViolation,
    checkIfShouldShowMarkAsCashButton,
    hasDuplicateTransactions,
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
    canIOUBePaid as canIOUBePaidAction,
    canSubmitReport,
    deleteMoneyRequest,
    deleteTrackExpense,
    getNextApproverAccountID,
    payInvoice,
    payMoneyRequest,
    submitReport,
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
import ConfirmModal from './ConfirmModal';
import DecisionModal from './DecisionModal';
import DelegateNoAccessModal from './DelegateNoAccessModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {PaymentMethod} from './KYCWall/types';
import LoadingBar from './LoadingBar';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import {useMoneyRequestReportContext} from './MoneyRequestReportView/MoneyRequestReportContext';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import ExportWithDropdownMenu from './ReportActionItem/ExportWithDropdownMenu';
import AnimatedSettlementButton from './SettlementButton/AnimatedSettlementButton';

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

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeaderOld({policy, report: moneyRequestReport, transactionThreadReportID, reportActions, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`, {canBeMissing: true});
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);
    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => reportTransactionsSelector(_transactions, moneyRequestReport?.reportID),
        initialValue: [],
        canBeMissing: true,
    });
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${isMoneyRequestAction(requestParentReportAction) && getOriginalMessage(requestParentReportAction)?.IOUTransactionID}`, {
        canBeMissing: true,
    });
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true, canBeMissing: true});
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);

    const {isPaidAnimationRunning, isApprovedAnimationRunning, stopAnimation, startAnimation, startApprovedAnimation} = usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [isDeleteRequestModalVisible, setIsDeleteRequestModalVisible] = useState(false);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
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
    const [allViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
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
    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`, {selector: getArchiveReason, canBeMissing: true});

    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false, shouldCheckApprovedState = true) =>
            canIOUBePaidAction(moneyRequestReport, chatReport, policy, transaction ? [transaction] : undefined, onlyShowPayElsewhere, undefined, undefined, shouldCheckApprovedState),
        [moneyRequestReport, chatReport, policy, transaction],
    );

    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);

    const {selectedTransactionsID, setSelectedTransactionsID} = useMoneyRequestReportContext();

    const {
        options: selectedTransactionsOptions,
        handleDeleteTransactions,
        isDeleteModalVisible,
        hideDeleteModal,
    } = useSelectedTransactionsActions({
        report: moneyRequestReport,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: () => setIsDownloadErrorModalVisible(true),
    });

    const shouldShowSelectedTransactionsButton = !!selectedTransactionsOptions.length && !transactionThreadReportID;

    const canIOUBePaid = useMemo(() => getCanIOUBePaid(), [getCanIOUBePaid]);
    const canIOUBePaidAndApproved = useMemo(() => getCanIOUBePaid(false, false), [getCanIOUBePaid]);
    const onlyShowPayElsewhere = useMemo(() => !canIOUBePaid && getCanIOUBePaid(true), [canIOUBePaid, getCanIOUBePaid]);

    const shouldShowMarkAsCashButton =
        !!transactionThreadReportID && checkIfShouldShowMarkAsCashButton(hasAllPendingRTERViolations, shouldShowBrokenConnectionViolation, moneyRequestReport, policy);

    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;

    const shouldShowApproveButton = useMemo(
        () => (canApproveIOU(moneyRequestReport, policy, transactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning,
        [moneyRequestReport, policy, transactions, hasOnlyPendingTransactions, isApprovedAnimationRunning],
    );

    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(moneyRequestReport);

    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;

    const filteredTransactions = transactions?.filter((t) => t) ?? [];
    const shouldShowSubmitButton = canSubmitReport(moneyRequestReport, policy, filteredTransactions, violations, isArchivedReport);

    const shouldShowExportIntegrationButton = !shouldShowPayButton && !shouldShowSubmitButton && !!connectedIntegration && isAdmin && canBeExported(moneyRequestReport);

    const shouldShowSettlementButton =
        !shouldShowSelectedTransactionsButton &&
        !shouldShowSubmitButton &&
        (shouldShowPayButton || shouldShowApproveButton) &&
        !shouldShowRTERViolationMessage(transactions) &&
        !shouldShowExportIntegrationButton &&
        !shouldShowBrokenConnectionViolation;

    const shouldDisableSubmitButton = shouldShowSubmitButton && !isAllowedToSubmitDraftExpenseReport(moneyRequestReport);
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;

    const hasDuplicates = hasDuplicateTransactions(moneyRequestReport?.reportID);
    const shouldShowStatusBar =
        hasAllPendingRTERViolations || shouldShowBrokenConnectionViolation || hasOnlyHeldExpenses || hasScanningReceipt || isPayAtEndExpense || hasOnlyPendingTransactions || hasDuplicates;

    // When prevent self-approval is enabled & the current user is submitter AND they're submitting to theirself, we need to show the optimistic next step
    // We should always show this optimistic message for policies with preventSelfApproval
    // to avoid any flicker during transitions between online/offline states
    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover = isReportOwner(moneyRequestReport) && nextApproverAccountID === moneyRequestReport?.ownerAccountID;
    const optimisticNextStep = isSubmitterSameAsNextApprover && policy?.preventSelfApproval ? buildOptimisticNextStepForPreventSelfApprovalsEnabled() : nextStep;

    const shouldShowNextStep = isFromPaidPolicy && !!optimisticNextStep?.message?.length && !shouldShowStatusBar;
    const shouldShowAnyButton =
        shouldShowSelectedTransactionsButton ||
        isDuplicate ||
        shouldShowSettlementButton ||
        shouldShowApproveButton ||
        shouldShowSubmitButton ||
        shouldShowNextStep ||
        shouldShowMarkAsCashButton ||
        shouldShowExportIntegrationButton;
    const bankAccountRoute = getBankAccountRoute(chatReport);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const isMoreContentShown = shouldShowNextStep || shouldShowStatusBar || (shouldShowAnyButton && shouldUseNarrowLayout);
    const {isDelegateAccessRestricted} = useDelegateUserDetails();
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;

    const confirmPayment = useCallback(
        (type?: PaymentMethodType | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod) => {
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
                payInvoice(type, chatReport, moneyRequestReport, payAsBusiness, methodID, paymentMethod);
            } else {
                startAnimation();
                payMoneyRequest(type, chatReport, moneyRequestReport, undefined, true);
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

    const deleteTransaction = useCallback(() => {
        if (requestParentReportAction) {
            const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
            if (isTrackExpenseAction(requestParentReportAction)) {
                navigateBackToAfterDelete.current = deleteTrackExpense(moneyRequestReport?.reportID, iouTransactionID, requestParentReportAction, true);
            } else {
                navigateBackToAfterDelete.current = deleteMoneyRequest(iouTransactionID, requestParentReportAction, true);
            }
        }

        setIsDeleteRequestModalVisible(false);
    }, [moneyRequestReport?.reportID, requestParentReportAction, setIsDeleteRequestModalVisible]);

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

        if (hasDuplicates) {
            return {icon: getStatusIcon(Expensicons.Flag), description: translate('iou.duplicateTransaction', {isSubmitted: isProcessingReport(moneyRequestReport)})};
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

    // The submit button should be success green colour only if the user is the submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(() => isWaitingForSubmissionFromCurrentUserReportUtils(chatReport, policy), [chatReport, policy]);

    const shouldDuplicateButtonBeSuccess = useMemo(
        () => isDuplicate && !shouldShowSettlementButton && !shouldShowExportIntegrationButton && !shouldShowSubmitButton && !shouldShowMarkAsCashButton,
        [isDuplicate, shouldShowSettlementButton, shouldShowExportIntegrationButton, shouldShowSubmitButton, shouldShowMarkAsCashButton],
    );

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingHoldUseExplained || dismissedHoldUseExplanation || !isOnHold) {
            return;
        }
        Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation.getReportRHPActiveRoute()));
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);

    useEffect(() => {
        if (canDeleteRequest) {
            return;
        }

        setIsDeleteRequestModalVisible(false);
    }, [canDeleteRequest]);

    useEffect(() => {
        if (!transactionThreadReportID) {
            return;
        }
        setSelectedTransactionsID([]);
        // We don't need to run the effect on change of setSelectedTransactionsID since it can cause the infinite loop.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionThreadReportID]);

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const iouReportID = moneyRequestReport?.reportID;

    const isIOUSettled = isSettled(iouReportID) || requestParentReportAction?.childStatusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;

    const shouldShowRBR =
        ((hasMissingSmartscanFields(iouReportID) && !isIOUSettled) ||
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            hasViolations(iouReportID, violations, true) ||
            hasNoticeTypeViolations(iouReportID, violations, true) ||
            hasWarningTypeViolations(iouReportID, violations, true) ||
            (isReportOwner(moneyRequestReport) && hasReportViolations(iouReportID)) ||
            hasActionsWithErrors(iouReportID)) &&
        !isIOUSettled;

    const buttonType = getIOUReportPreviewButtonType({
        shouldShowPayButton,
        shouldShowApproveButton,
        shouldShowSubmitButton,
        shouldShowSettlementButton,
        shouldShowRBR,
        shouldShowExportIntegrationButton,
    });

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldEnableDetailPageNavigation
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
            >
                {shouldShowSelectedTransactionsButton && !shouldUseNarrowLayout && (
                    <View>
                        <ButtonWithDropdownMenu
                            onPress={() => null}
                            options={selectedTransactionsOptions}
                            customText={translate('workspace.common.selected', {count: selectedTransactionsID.length})}
                            isSplitButton={false}
                            shouldAlwaysShowDropdownMenu
                        />
                    </View>
                )}
                {!shouldShowSelectedTransactionsButton && isDuplicate && !shouldUseNarrowLayout && (
                    <View style={[shouldDuplicateButtonBeSuccess ? styles.ml2 : styles.mh2]}>
                        <Button
                            success={shouldDuplicateButtonBeSuccess}
                            text={translate('iou.reviewDuplicates')}
                            style={styles.p0}
                            onPress={() => {
                                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(transactionThreadReportID, Navigation.getReportRHPActiveRoute()));
                            }}
                        />
                    </View>
                )}
                {!shouldShowSelectedTransactionsButton && shouldShowSettlementButton && !shouldUseNarrowLayout && (
                    <View style={styles.pv2}>
                        <AnimatedSettlementButton
                            isPaidAnimationRunning={isPaidAnimationRunning}
                            isApprovedAnimationRunning={isApprovedAnimationRunning}
                            onAnimationFinish={stopAnimation}
                            canIOUBePaid={canIOUBePaidAndApproved || isPaidAnimationRunning}
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
                            formattedAmount={getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, buttonType)}
                            isDisabled={isOffline && !canAllowSettlement}
                            isLoading={!isOffline && !canAllowSettlement}
                        />
                    </View>
                )}
                {!shouldShowSelectedTransactionsButton && !!shouldShowExportIntegrationButton && !shouldUseNarrowLayout && (
                    <View style={[styles.pv2]}>
                        <ExportWithDropdownMenu
                            report={moneyRequestReport}
                            connectionName={connectedIntegration}
                        />
                    </View>
                )}
                {!shouldShowSelectedTransactionsButton && !!moneyRequestReport && shouldShowSubmitButton && !shouldUseNarrowLayout && (
                    <View style={styles.pv2}>
                        <Button
                            success={isWaitingForSubmissionFromCurrentUser}
                            text={translate('common.submit')}
                            style={[styles.mnw120, styles.pv2, styles.pr0]}
                            onPress={() => submitReport(moneyRequestReport)}
                            isDisabled={shouldDisableSubmitButton}
                        />
                    </View>
                )}
                {!shouldShowSelectedTransactionsButton && shouldShowMarkAsCashButton && !shouldUseNarrowLayout && (
                    <View style={[styles.pv2]}>
                        <Button
                            success
                            text={translate('iou.markAsCash')}
                            style={[styles.pv2, styles.pr0]}
                            onPress={markAsCash}
                        />
                    </View>
                )}
            </HeaderWithBackButton>
            {!!isMoreContentShown && (
                <View style={[styles.dFlex, styles.flexColumn, shouldAddGapToContents && styles.gap3, styles.pb3, styles.ph5]}>
                    <View style={[styles.dFlex, styles.w100, styles.flexRow, styles.gap3]}>
                        {shouldShowSelectedTransactionsButton && shouldUseNarrowLayout && (
                            <ButtonWithDropdownMenu
                                onPress={() => null}
                                options={selectedTransactionsOptions}
                                customText={translate('workspace.common.selected', {count: selectedTransactionsID.length})}
                                isSplitButton={false}
                                shouldAlwaysShowDropdownMenu
                                wrapperStyle={styles.w100}
                            />
                        )}

                        {!shouldShowSelectedTransactionsButton && isDuplicate && shouldUseNarrowLayout && (
                            <Button
                                success={shouldDuplicateButtonBeSuccess}
                                text={translate('iou.reviewDuplicates')}
                                style={[styles.flex1, styles.pr0]}
                                onPress={() => {
                                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(transactionThreadReportID, Navigation.getReportRHPActiveRoute()));
                                }}
                            />
                        )}
                        {!shouldShowSelectedTransactionsButton && shouldShowSettlementButton && shouldUseNarrowLayout && (
                            <AnimatedSettlementButton
                                isPaidAnimationRunning={isPaidAnimationRunning}
                                isApprovedAnimationRunning={isApprovedAnimationRunning}
                                onAnimationFinish={stopAnimation}
                                canIOUBePaid={canIOUBePaidAndApproved || isPaidAnimationRunning}
                                wrapperStyle={[styles.flex1]}
                                onlyShowPayElsewhere={onlyShowPayElsewhere}
                                currency={moneyRequestReport?.currency}
                                confirmApproval={confirmApproval}
                                policyID={moneyRequestReport?.policyID}
                                chatReportID={moneyRequestReport?.chatReportID}
                                iouReport={moneyRequestReport}
                                onPress={confirmPayment}
                                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                                addBankAccountRoute={bankAccountRoute}
                                shouldHidePaymentOptions={!shouldShowPayButton}
                                shouldShowApproveButton={shouldShowApproveButton}
                                formattedAmount={getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, buttonType)}
                                shouldDisableApproveButton={shouldDisableApproveButton}
                                isDisabled={isOffline && !canAllowSettlement}
                                isLoading={!isOffline && !canAllowSettlement}
                            />
                        )}
                        {!shouldShowSelectedTransactionsButton && !!shouldShowExportIntegrationButton && shouldUseNarrowLayout && (
                            <ExportWithDropdownMenu
                                report={moneyRequestReport}
                                connectionName={connectedIntegration}
                            />
                        )}
                        {!shouldShowSelectedTransactionsButton && !!moneyRequestReport && shouldShowSubmitButton && shouldUseNarrowLayout && (
                            <Button
                                success={isWaitingForSubmissionFromCurrentUser}
                                text={translate('common.submit')}
                                style={[styles.flex1, styles.pr0]}
                                onPress={() => submitReport(moneyRequestReport)}
                                isDisabled={shouldDisableSubmitButton}
                            />
                        )}
                        {!shouldShowSelectedTransactionsButton && shouldShowMarkAsCashButton && shouldUseNarrowLayout && (
                            <Button
                                success
                                text={translate('iou.markAsCash')}
                                style={[styles.flex1, styles.pr0]}
                                onPress={markAsCash}
                            />
                        )}
                    </View>
                    {shouldShowNextStep && <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />}
                    {!!statusBarProps && (
                        <MoneyRequestHeaderStatusBar
                            icon={statusBarProps.icon}
                            description={statusBarProps.description}
                        />
                    )}
                </View>
            )}
            <LoadingBar shouldShow={(isLoadingReportData && shouldUseNarrowLayout) ?? false} />
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

            <ConfirmModal
                title={translate('iou.deleteExpense', {count: 1})}
                isVisible={isDeleteRequestModalVisible}
                onConfirm={deleteTransaction}
                onCancel={() => setIsDeleteRequestModalVisible(false)}
                onModalHide={() => navigateBackOnDeleteTransaction(navigateBackToAfterDelete.current)}
                prompt={translate('iou.deleteConfirmation', {count: 1})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />

            <ConfirmModal
                title={translate('iou.deleteExpense', {count: selectedTransactionsID.length})}
                isVisible={isDeleteModalVisible}
                onConfirm={handleDeleteTransactions}
                onCancel={hideDeleteModal}
                prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsID.length})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />

            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
        </View>
    );
}

MoneyReportHeaderOld.displayName = 'MoneyReportHeaderOld';

export default MoneyReportHeaderOld;
