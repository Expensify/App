import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as HeaderUtils from '@libs/HeaderUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import * as TransactionActions from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
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

    const styles = useThemeStyles();
    const theme = useTheme();
    const [isDeleteRequestModalVisible, setIsDeleteRequestModalVisible] = useState(false);
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const {reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(moneyRequestReport);
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);
    const isDeletedParentAction = ReportActionsUtils.isDeletedAction(requestParentReportAction as OnyxTypes.ReportAction);

    // Only the requestor can delete the request, admins can only edit it.
    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && requestParentReportAction.actorAccountID === session?.accountID;
    const canDeleteRequest =
        isActionOwner && (ReportUtils.canAddOrDeleteTransactions(moneyRequestReport) || ReportUtils.isTrackExpenseReport(transactionThreadReport)) && !isDeletedParentAction;
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<'pay' | 'approve'>();
    const canAllowSettlement = ReportUtils.hasUpdatedTotal(moneyRequestReport, policy);
    const policyType = policy?.type;
    const isPayer = ReportUtils.isPayer(session, moneyRequestReport);
    const isDraft = ReportUtils.isOpenExpenseReport(moneyRequestReport);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const hasScanningReceipt = ReportUtils.getTransactionsWithReceipts(moneyRequestReport?.reportID).some((transaction) => TransactionUtils.isReceiptBeingScanned(transaction));
    const transactionIDs = TransactionUtils.getAllReportTransactions(moneyRequestReport?.reportID).map((transaction) => transaction.transactionID);
    const allHavePendingRTERViolation = TransactionUtils.allHavePendingRTERViolation(transactionIDs);

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

    const shouldShowSettlementButton = !ReportUtils.isInvoiceReport(moneyRequestReport) && (shouldShowPayButton || shouldShowApproveButton) && !allHavePendingRTERViolation;

    const shouldShowSubmitButton = isDraft && reimbursableSpend !== 0 && !allHavePendingRTERViolation;
    const shouldDisableSubmitButton = shouldShowSubmitButton && !ReportUtils.isAllowedToSubmitDraftExpenseReport(moneyRequestReport);
    const shouldShowMarkAsCashButton = isDraft && allHavePendingRTERViolation;
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const shouldShowNextStep =
        !ReportUtils.isClosedExpenseReportWithNoExpenses(moneyRequestReport) && isFromPaidPolicy && !!nextStep?.message?.length && !allHavePendingRTERViolation && !hasScanningReceipt;
    const shouldShowAnyButton = shouldShowSettlementButton || shouldShowApproveButton || shouldShowSubmitButton || shouldShowNextStep || allHavePendingRTERViolation;
    const bankAccountRoute = ReportUtils.getBankAccountRoute(chatReport);
    const formattedAmount = CurrencyUtils.convertToDisplayString(reimbursableSpend, moneyRequestReport.currency);
    const [nonHeldAmount, fullAmount] = ReportUtils.getNonHeldAndFullAmount(moneyRequestReport, policy);
    const displayedAmount = ReportUtils.hasHeldExpenses(moneyRequestReport.reportID) && canAllowSettlement ? nonHeldAmount : formattedAmount;
    const isMoreContentShown = shouldShowNextStep || hasScanningReceipt || (shouldShowAnyButton && shouldUseNarrowLayout);

    const confirmPayment = (type?: PaymentMethodType | undefined) => {
        if (!type) {
            return;
        }
        setPaymentType(type);
        setRequestType('pay');
        if (ReportUtils.hasHeldExpenses(moneyRequestReport.reportID)) {
            setIsHoldMenuVisible(true);
        } else if (chatReport) {
            IOU.payMoneyRequest(type, chatReport, moneyRequestReport, true);
        }
    };

    const confirmApproval = () => {
        setRequestType('approve');
        if (ReportUtils.hasHeldExpenses(moneyRequestReport.reportID)) {
            setIsHoldMenuVisible(true);
        } else {
            IOU.approveMoneyRequest(moneyRequestReport, true);
        }
    };

    const deleteTransaction = useCallback(() => {
        if (requestParentReportAction) {
            const iouTransactionID = requestParentReportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? requestParentReportAction.originalMessage?.IOUTransactionID ?? '' : '';
            if (ReportActionsUtils.isTrackExpenseAction(requestParentReportAction)) {
                IOU.deleteTrackExpense(moneyRequestReport?.reportID ?? '', iouTransactionID, requestParentReportAction, true);
                return;
            }
            IOU.deleteMoneyRequest(iouTransactionID, requestParentReportAction, true);
        }

        setIsDeleteRequestModalVisible(false);
    }, [moneyRequestReport?.reportID, requestParentReportAction, setIsDeleteRequestModalVisible]);

    const markAsCash = useCallback(() => {
        if (!requestParentReportAction) {
            return;
        }
        const iouTransactionID = requestParentReportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? requestParentReportAction.originalMessage?.IOUTransactionID ?? '' : '';
        const reportID = transactionThreadReport?.reportID ?? '';

        TransactionActions.markAsCash(iouTransactionID, reportID);
    }, [requestParentReportAction, transactionThreadReport?.reportID]);

    // The submit button should be success green colour only if the user is submitter and the policy does not have Scheduled Submit turned on
    const isWaitingForSubmissionFromCurrentUser = useMemo(
        () => chatReport?.isOwnPolicyExpenseChat && !policy?.harvesting?.enabled,
        [chatReport?.isOwnPolicyExpenseChat, policy?.harvesting?.enabled],
    );

    const threeDotsMenuItems = [HeaderUtils.getPinMenuItem(moneyRequestReport)];
    if (isPayer && isSettled && ReportUtils.isExpenseReport(moneyRequestReport)) {
        threeDotsMenuItems.push({
            icon: Expensicons.Trashcan,
            text: translate('iou.cancelPayment'),
            onSelected: () => setIsConfirmModalVisible(true),
        });
    }

    // If the report supports adding transactions to it, then it also supports deleting transactions from it.
    if (canDeleteRequest && !isEmptyObject(transactionThreadReport)) {
        threeDotsMenuItems.push({
            icon: Expensicons.Trashcan,
            text: translate('reportActionContextMenu.deleteAction', {action: requestParentReportAction}),
            onSelected: () => setIsDeleteRequestModalVisible(true),
        });
    }

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
                // Shows border if no buttons or next steps are showing below the header
                shouldShowBorderBottom={!isMoreContentShown && !allHavePendingRTERViolation}
                shouldShowThreeDotsButton
                threeDotsMenuItems={threeDotsMenuItems}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
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
                            formattedAmount={!ReportUtils.hasOnlyHeldExpenses(moneyRequestReport.reportID) ? displayedAmount : ''}
                            isDisabled={!canAllowSettlement}
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
            {allHavePendingRTERViolation && (
                <View>
                    {shouldShowMarkAsCashButton && shouldUseNarrowLayout && (
                        <View style={[styles.ph5, styles.pb3]}>
                            <Button
                                medium
                                success
                                text={translate('iou.markAsCash')}
                                style={[styles.w100, styles.pr0]}
                                onPress={markAsCash}
                            />
                        </View>
                    )}
                    <MoneyRequestHeaderStatusBar
                        title={
                            <Icon
                                src={Expensicons.Hourglass}
                                height={variables.iconSizeSmall}
                                width={variables.iconSizeSmall}
                                fill={theme.icon}
                            />
                        }
                        description={translate('iou.pendingMatchWithCreditCardDescription')}
                        shouldShowBorderBottom
                    />
                </View>
            )}
            <View style={isMoreContentShown ? [styles.dFlex, styles.flexColumn, styles.borderBottom] : []}>
                {shouldShowSettlementButton && shouldUseNarrowLayout && (
                    <View style={[styles.ph5, styles.pb2]}>
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
                            formattedAmount={!ReportUtils.hasOnlyHeldExpenses(moneyRequestReport.reportID) ? displayedAmount : ''}
                            shouldDisableApproveButton={shouldDisableApproveButton}
                            isDisabled={!canAllowSettlement}
                        />
                    </View>
                )}
                {shouldShowSubmitButton && shouldUseNarrowLayout && (
                    <View style={[styles.ph5, styles.pb2]}>
                        <Button
                            medium
                            success={isWaitingForSubmissionFromCurrentUser}
                            text={translate('common.submit')}
                            style={[styles.w100, styles.pr0]}
                            onPress={() => IOU.submitReport(moneyRequestReport)}
                            isDisabled={shouldDisableSubmitButton}
                        />
                    </View>
                )}
                {shouldShowNextStep && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <MoneyReportHeaderStatusBar nextStep={nextStep} />
                    </View>
                )}
                {hasScanningReceipt && (
                    <MoneyRequestHeaderStatusBar
                        title={
                            <Icon
                                src={Expensicons.ReceiptScan}
                                height={variables.iconSizeSmall}
                                width={variables.iconSizeSmall}
                                fill={theme.icon}
                            />
                        }
                        description={translate('iou.receiptScanInProgressDescription')}
                        shouldShowBorderBottom={false}
                    />
                )}
            </View>
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!ReportUtils.hasOnlyHeldExpenses(moneyRequestReport.reportID) ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    isSmallScreenWidth={shouldUseNarrowLayout}
                    onClose={() => setIsHoldMenuVisible(false)}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    chatReport={chatReport}
                    moneyRequestReport={moneyRequestReport}
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
            />
            <ConfirmModal
                title={translate('iou.deleteExpense')}
                isVisible={isDeleteRequestModalVisible}
                onConfirm={deleteTransaction}
                onCancel={() => setIsDeleteRequestModalVisible(false)}
                prompt={translate('iou.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        </View>
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';

export default MoneyReportHeader;
