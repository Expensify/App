import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import * as TransactionActions from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import ProcessMoneyRequestHoldMenu from './ProcessMoneyRequestHoldMenu';
import SettlementButton from './SettlementButton';

type MoneyReportHeaderProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of report actions for the report */
    reportActions: OnyxTypes.ReportAction[];

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID?: string | null;

    /** Whether we should display the header as in narrow layout */
    shouldUseNarrowLayout?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({policy, report: moneyRequestReport, transactionThreadReportID, reportActions, shouldUseNarrowLayout = false, onBackButtonPress}: MoneyReportHeaderProps) {
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport.chatReportID}`);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport.reportID}`);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true});
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const transaction =
        transactions?.[
            `${ONYXKEYS.COLLECTION.TRANSACTION}${
                ReportActionsUtils.isMoneyRequestAction(requestParentReportAction) ? ReportActionsUtils.getOriginalMessage(requestParentReportAction)?.IOUTransactionID ?? -1 : -1
            }`
        ] ?? undefined;

    const styles = useThemeStyles();
    const theme = useTheme();
    const [isDeleteRequestModalVisible, setIsDeleteRequestModalVisible] = useState(false);
    const [shouldShowHoldMenu, setShouldShowHoldMenu] = useState(false);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(moneyRequestReport);
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isDeletedParentAction = !!requestParentReportAction && ReportActionsUtils.isDeletedAction(requestParentReportAction);

    // Only the requestor can delete the request, admins can only edit it.
    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && requestParentReportAction.actorAccountID === session?.accountID;
    const canDeleteRequest = isActionOwner && ReportUtils.canAddOrDeleteTransactions(moneyRequestReport) && !isDeletedParentAction;
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const canAllowSettlement = ReportUtils.hasUpdatedTotal(moneyRequestReport, policy);
    const policyType = policy?.type;
    const isDraft = ReportUtils.isOpenExpenseReport(moneyRequestReport);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const navigateBackToAfterDelete = useRef<Route>();
    const hasScanningReceipt = ReportUtils.getTransactionsWithReceipts(moneyRequestReport?.reportID).some((t) => TransactionUtils.isReceiptBeingScanned(t));
    const transactionIDs = TransactionUtils.getAllReportTransactions(moneyRequestReport?.reportID).map((t) => t.transactionID);
    const allHavePendingRTERViolation = TransactionUtils.allHavePendingRTERViolation(transactionIDs);
    // allTransactions in TransactionUtils might have stale data
    const hasOnlyHeldExpenses = ReportUtils.hasOnlyHeldExpenses(moneyRequestReport.reportID, transactions);

    const cancelPayment = useCallback(() => {
        if (!chatReport) {
            return;
        }
        IOU.cancelPayment(moneyRequestReport, chatReport);
        setIsConfirmModalVisible(false);
    }, [moneyRequestReport, chatReport]);

    const shouldShowPayButton = useMemo(() => IOU.canIOUBePaid(moneyRequestReport, chatReport, policy), [moneyRequestReport, chatReport, policy]);

    const shouldShowApproveButton = useMemo(() => IOU.canApproveIOU(moneyRequestReport, chatReport, policy), [moneyRequestReport, chatReport, policy]);

    const shouldDisableApproveButton = shouldShowApproveButton && !ReportUtils.isAllowedToApproveExpenseReport(moneyRequestReport);

    const shouldShowSettlementButton = (shouldShowPayButton || shouldShowApproveButton) && !allHavePendingRTERViolation;

    const shouldShowSubmitButton = isDraft && reimbursableSpend !== 0 && !allHavePendingRTERViolation;
    const shouldDisableSubmitButton = shouldShowSubmitButton && !ReportUtils.isAllowedToSubmitDraftExpenseReport(moneyRequestReport);
    const shouldShowMarkAsCashButton = isDraft && allHavePendingRTERViolation;
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const shouldShowStatusBar = allHavePendingRTERViolation || hasOnlyHeldExpenses || hasScanningReceipt;
    const shouldShowNextStep = !ReportUtils.isClosedExpenseReportWithNoExpenses(moneyRequestReport) && isFromPaidPolicy && !!nextStep?.message?.length && !shouldShowStatusBar;
    const shouldShowAnyButton = shouldShowSettlementButton || shouldShowApproveButton || shouldShowSubmitButton || shouldShowNextStep || allHavePendingRTERViolation;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const formattedAmount = CurrencyUtils.convertToDisplayString(reimbursableSpend, moneyRequestReport.currency);
    const [nonHeldAmount, fullAmount] = ReportUtils.getNonHeldAndFullAmount(moneyRequestReport, policy);
    const displayedAmount = ReportUtils.hasHeldExpenses(moneyRequestReport.reportID) && canAllowSettlement ? nonHeldAmount : formattedAmount;
    const isMoreContentShown = shouldShowNextStep || shouldShowStatusBar || (shouldShowAnyButton && shouldUseNarrowLayout);

    const confirmPayment = (type?: PaymentMethodType | undefined) => {
        if (!type || !chatReport) {
            return;
        }
        setPaymentType(type);
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
        if (ReportUtils.hasHeldExpenses(moneyRequestReport.reportID)) {
            setIsHoldMenuVisible(true);
        } else if (ReportUtils.isInvoiceReport(moneyRequestReport)) {
            IOU.payInvoice(type, chatReport, moneyRequestReport);
        } else {
            IOU.payMoneyRequest(type, chatReport, moneyRequestReport, true);
        }
    };

    const confirmApproval = () => {
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (ReportUtils.hasHeldExpenses(moneyRequestReport.reportID)) {
            setIsHoldMenuVisible(true);
        } else {
            IOU.approveMoneyRequest(moneyRequestReport, true);
        }
    };

    const deleteTransaction = useCallback(() => {
        if (requestParentReportAction) {
            const iouTransactionID = ReportActionsUtils.isMoneyRequestAction(requestParentReportAction)
                ? ReportActionsUtils.getOriginalMessage(requestParentReportAction)?.IOUTransactionID ?? '-1'
                : '-1';
            if (ReportActionsUtils.isTrackExpenseAction(requestParentReportAction)) {
                navigateBackToAfterDelete.current = IOU.deleteTrackExpense(moneyRequestReport?.reportID ?? '-1', iouTransactionID, requestParentReportAction, true);
            } else {
                navigateBackToAfterDelete.current = IOU.deleteMoneyRequest(iouTransactionID, requestParentReportAction, true);
            }
        }

        setIsDeleteRequestModalVisible(false);
    }, [moneyRequestReport?.reportID, requestParentReportAction, setIsDeleteRequestModalVisible]);

    const markAsCash = useCallback(() => {
        if (!requestParentReportAction) {
            return;
        }
        const iouTransactionID = ReportActionsUtils.isMoneyRequestAction(requestParentReportAction)
            ? ReportActionsUtils.getOriginalMessage(requestParentReportAction)?.IOUTransactionID ?? '-1'
            : '-1';
        const reportID = transactionThreadReport?.reportID ?? '-1';

        TransactionActions.markAsCash(iouTransactionID, reportID);
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
        if (hasOnlyHeldExpenses) {
            return {title: translate('violations.hold'), description: translate('iou.expensesOnHold'), danger: true};
        }
        if (allHavePendingRTERViolation) {
            return {title: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (hasScanningReceipt) {
            return {title: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const statusBarProps = getStatusBarProps();

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy?.harvesting?.enabled,
        [chatReport?.isOwnPolicyExpenseChat, policy?.harvesting?.enabled],
    );

    useEffect(() => {
        if (isLoadingHoldUseExplained) {
            return;
        }
        setShouldShowHoldMenu(isOnHold && !dismissedHoldUseExplanation);
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);

    useEffect(() => {
        if (!shouldShowHoldMenu) {
            return;
        }

        if (isSmallScreenWidth) {
            if (Navigation.getActiveRoute().slice(1) === ROUTES.PROCESS_MONEY_REQUEST_HOLD) {
                Navigation.goBack();
            }
        } else {
            Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD);
        }
    }, [isSmallScreenWidth, shouldShowHoldMenu]);

    const handleHoldRequestClose = () => {
        IOU.dismissHoldUseExplanation();
    };

    useEffect(() => {
        if (canDeleteRequest) {
            return;
        }

        setIsDeleteRequestModalVisible(false);
    }, [canDeleteRequest]);

    return (
        <View style={[styles.pt0]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldEnableDetailPageNavigation
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={onBackButtonPress}
                // Shows border if no buttons or banners are showing below the header
                shouldShowBorderBottom={!isMoreContentShown}
            >
                {shouldShowSettlementButton && !shouldUseNarrowLayout && (
                    <View style={styles.pv2}>
                        <SettlementButton
                            currency={moneyRequestReport.currency}
                            confirmApproval={confirmApproval}
                            policyID={moneyRequestReport.policyID}
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
                    </View>
                )}
                {shouldShowSubmitButton && !shouldUseNarrowLayout && (
                    <View style={styles.pv2}>
                        <Button
                            medium
                            success={isWaitingForSubmissionFromCurrentUser}
                            text={translate('common.submit')}
                            style={[styles.mnw120, styles.pv2, styles.pr0]}
                            onPress={() => IOU.submitReport(moneyRequestReport)}
                            isDisabled={shouldDisableSubmitButton}
                        />
                    </View>
                )}
                {shouldShowMarkAsCashButton && !shouldUseNarrowLayout && (
                    <View style={[styles.pv2]}>
                        <Button
                            medium
                            success
                            text={translate('iou.markAsCash')}
                            style={[styles.pv2, styles.pr0]}
                            onPress={markAsCash}
                        />
                    </View>
                )}
            </HeaderWithBackButton>
            {isMoreContentShown && (
                <View style={[styles.dFlex, styles.flexColumn, styles.gap3, styles.pb3, styles.ph5, styles.borderBottom]}>
                    {shouldShowSettlementButton && shouldUseNarrowLayout && (
                        <SettlementButton
                            currency={moneyRequestReport.currency}
                            confirmApproval={confirmApproval}
                            policyID={moneyRequestReport.policyID}
                            chatReportID={moneyRequestReport.chatReportID}
                            iouReport={moneyRequestReport}
                            onPress={confirmPayment}
                            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                            addBankAccountRoute={bankAccountRoute}
                            shouldHidePaymentOptions={!shouldShowPayButton}
                            shouldShowApproveButton={shouldShowApproveButton}
                            formattedAmount={!hasOnlyHeldExpenses ? displayedAmount : ''}
                            shouldDisableApproveButton={shouldDisableApproveButton}
                            isDisabled={isOffline && !canAllowSettlement}
                            isLoading={!isOffline && !canAllowSettlement}
                        />
                    )}
                    {shouldShowSubmitButton && shouldUseNarrowLayout && (
                        <Button
                            medium
                            success={isWaitingForSubmissionFromCurrentUser}
                            text={translate('common.submit')}
                            style={[styles.w100, styles.pr0]}
                            onPress={() => IOU.submitReport(moneyRequestReport)}
                            isDisabled={shouldDisableSubmitButton}
                        />
                    )}
                    {shouldShowMarkAsCashButton && shouldUseNarrowLayout && (
                        <Button
                            medium
                            success
                            text={translate('iou.markAsCash')}
                            style={[styles.w100, styles.pr0]}
                            onPress={markAsCash}
                        />
                    )}
                    {shouldShowNextStep && <MoneyReportHeaderStatusBar nextStep={nextStep} />}
                    {statusBarProps && (
                        <MoneyRequestHeaderStatusBar
                            title={statusBarProps.title}
                            description={statusBarProps.description}
                            danger={statusBarProps.danger}
                        />
                    )}
                </View>
            )}
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    isSmallScreenWidth={shouldUseNarrowLayout}
                    onClose={() => setIsHoldMenuVisible(false)}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    chatReport={chatReport}
                    moneyRequestReport={moneyRequestReport}
                    transactionCount={transactionIDs.length}
                />
            )}
            <ConfirmModal
                title={translate('iou.cancelPayment')}
                isVisible={isConfirmModalVisible}
                onConfirm={cancelPayment}
                onCancel={() => setIsConfirmModalVisible(false)}
                prompt={translate('iou.cancelPaymentConfirmation')}
                confirmText={translate('iou.cancelPayment')}
                cancelText={translate('common.dismiss')}
                danger
                shouldEnableNewFocusManagement
            />
            <ConfirmModal
                title={translate('iou.deleteExpense')}
                isVisible={isDeleteRequestModalVisible}
                onConfirm={deleteTransaction}
                onCancel={() => setIsDeleteRequestModalVisible(false)}
                onModalHide={() => ReportUtils.navigateBackAfterDeleteTransaction(navigateBackToAfterDelete.current)}
                prompt={translate('iou.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />
            {isSmallScreenWidth && shouldShowHoldMenu && (
                <ProcessMoneyRequestHoldMenu
                    onClose={handleHoldRequestClose}
                    onConfirm={handleHoldRequestClose}
                    isVisible={shouldShowHoldMenu}
                />
            )}
        </View>
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';

export default MoneyReportHeader;
