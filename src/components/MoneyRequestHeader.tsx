import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as HeaderUtils from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import ConfirmModal from './ConfirmModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import ProcessMoneyRequestHoldMenu from './ProcessMoneyRequestHoldMenu';

type MoneyRequestHeaderProps = {
    /** The report currently being looked at */
    report: Report;

    /** The policy which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Whether we should display the header as in narrow layout */
    shouldUseNarrowLayout?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyRequestHeader({report, parentReportAction, policy, shouldUseNarrowLayout = false, onBackButtonPress}: MoneyRequestHeaderProps) {
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${(parentReportAction as ReportAction & OriginalMessageIOU)?.originalMessage?.IOUTransactionID ?? 0}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [shownHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_HOLD_USE_EXPLAINED, {initWithStoredValues: false});

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [shouldShowHoldMenu, setShouldShowHoldMenu] = useState(false);
    const moneyRequestReport = parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport?.reportID);
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const {windowWidth} = useWindowDimensions();

    // Only the requestor can take delete the expense, admins can only edit it.
    const isActionOwner = typeof parentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && parentReportAction.actorAccountID === session?.accountID;
    const isPolicyAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isApprover = ReportUtils.isMoneyRequestReport(moneyRequestReport) && moneyRequestReport?.managerID !== null && session?.accountID === moneyRequestReport?.managerID;

    const deleteTransaction = useCallback(() => {
        if (parentReportAction) {
            const iouTransactionID = parentReportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? parentReportAction.originalMessage?.IOUTransactionID ?? '' : '';
            if (ReportActionsUtils.isTrackExpenseAction(parentReportAction)) {
                IOU.deleteTrackExpense(parentReport?.reportID ?? '', iouTransactionID, parentReportAction, true);
                return;
            }
            IOU.deleteMoneyRequest(iouTransactionID, parentReportAction, true);
        }

        setIsDeleteModalVisible(false);
    }, [parentReport?.reportID, parentReportAction, setIsDeleteModalVisible]);

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);
    const isPending = TransactionUtils.isExpensifyCardTransaction(transaction) && TransactionUtils.isPending(transaction);

    const isDeletedParentAction = ReportActionsUtils.isDeletedAction(parentReportAction);
    const canHoldOrUnholdRequest = !isSettled && !isApproved && !isDeletedParentAction;

    // If the report supports adding transactions to it, then it also supports deleting transactions from it.
    const canDeleteRequest = isActionOwner && (ReportUtils.canAddOrDeleteTransactions(moneyRequestReport) || ReportUtils.isTrackExpenseReport(report)) && !isDeletedParentAction;

    const changeMoneyRequestStatus = () => {
        const iouTransactionID = parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? parentReportAction.originalMessage?.IOUTransactionID ?? '' : '';

        if (isOnHold) {
            IOU.unholdRequest(iouTransactionID, report?.reportID);
        } else {
            const activeRoute = encodeURIComponent(Navigation.getActiveRouteWithoutParams());
            Navigation.navigate(ROUTES.MONEY_REQUEST_HOLD_REASON.getRoute(policy?.type ?? CONST.POLICY.TYPE.PERSONAL, iouTransactionID, report?.reportID, activeRoute));
        }
    };

    useEffect(() => {
        if (canDeleteRequest) {
            return;
        }

        setIsDeleteModalVisible(false);
    }, [canDeleteRequest]);

    const threeDotsMenuItems = [HeaderUtils.getPinMenuItem(report)];
    if (canHoldOrUnholdRequest) {
        const isRequestIOU = parentReport?.type === 'iou';
        const isHoldCreator = ReportUtils.isHoldCreator(transaction, report?.reportID) && isRequestIOU;
        const isTrackExpenseReport = ReportUtils.isTrackExpenseReport(report);
        const canModifyStatus = !isTrackExpenseReport && (isPolicyAdmin || isActionOwner || isApprover);
        if (isOnHold && (isHoldCreator || (!isRequestIOU && canModifyStatus))) {
            threeDotsMenuItems.push({
                icon: Expensicons.Stopwatch,
                text: translate('iou.unholdExpense'),
                onSelected: () => changeMoneyRequestStatus(),
            });
        }
        if (!isOnHold && (isRequestIOU || canModifyStatus) && !isScanning) {
            threeDotsMenuItems.push({
                icon: Expensicons.Stopwatch,
                text: translate('iou.holdExpense'),
                onSelected: () => changeMoneyRequestStatus(),
            });
        }
    }

    useEffect(() => {
        setShouldShowHoldMenu(isOnHold && !shownHoldUseExplanation);
    }, [isOnHold, shownHoldUseExplanation]);

    useEffect(() => {
        if (!shouldShowHoldMenu) {
            return;
        }

        if (shouldUseNarrowLayout) {
            if (Navigation.getActiveRoute().slice(1) === ROUTES.PROCESS_MONEY_REQUEST_HOLD) {
                Navigation.goBack();
            }
        } else {
            Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD);
        }
    }, [shouldUseNarrowLayout, shouldShowHoldMenu]);

    const handleHoldRequestClose = () => {
        IOU.setShownHoldUseExplanation();
    };

    if (canDeleteRequest) {
        threeDotsMenuItems.push({
            icon: Expensicons.Trashcan,
            text: translate('reportActionContextMenu.deleteAction', {action: parentReportAction}),
            onSelected: () => setIsDeleteModalVisible(true),
        });
    }

    return (
        <>
            <View style={[styles.pl0]}>
                <HeaderWithBackButton
                    shouldShowBorderBottom={!isScanning && !isPending && !isOnHold}
                    shouldShowReportAvatarWithDisplay
                    shouldEnableDetailPageNavigation
                    shouldShowPinButton={false}
                    shouldShowThreeDotsButton
                    threeDotsMenuItems={threeDotsMenuItems}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                    report={{
                        ...report,
                        ownerAccountID: parentReport?.ownerAccountID,
                    }}
                    policy={policy}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={onBackButtonPress}
                />
                {isPending && (
                    <MoneyRequestHeaderStatusBar
                        title={translate('iou.pending')}
                        description={translate('iou.transactionPendingText')}
                        shouldShowBorderBottom={!isScanning}
                    />
                )}
                {isScanning && (
                    <MoneyRequestHeaderStatusBar
                        title={translate('iou.receiptStatusTitle')}
                        description={translate('iou.receiptStatusText')}
                        shouldShowBorderBottom={!isOnHold}
                    />
                )}
                {isOnHold && (
                    <MoneyRequestHeaderStatusBar
                        title={translate('iou.hold')}
                        description={translate('iou.expenseOnHold')}
                        shouldShowBorderBottom
                        danger
                    />
                )}
            </View>
            <ConfirmModal
                title={translate('iou.deleteExpense')}
                isVisible={isDeleteModalVisible}
                onConfirm={deleteTransaction}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('iou.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            {shouldUseNarrowLayout && shouldShowHoldMenu && (
                <ProcessMoneyRequestHoldMenu
                    onClose={handleHoldRequestClose}
                    onConfirm={handleHoldRequestClose}
                    isVisible={shouldShowHoldMenu}
                />
            )}
        </>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';

export default MoneyRequestHeader;
