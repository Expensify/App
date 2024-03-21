import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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
import type {Policy, Report, ReportAction, ReportActions, Session, Transaction} from '@src/types/onyx';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import ConfirmModal from './ConfirmModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import HoldBanner from './HoldBanner';
import * as Expensicons from './Icon/Expensicons';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import ProcessMoneyRequestHoldMenu from './ProcessMoneyRequestHoldMenu';

type MoneyRequestHeaderOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: OnyxEntry<Report>;

    /** All the data for the transaction */
    transaction: OnyxEntry<Transaction>;

    /** All report actions */
    // eslint-disable-next-line react/no-unused-prop-types
    parentReportActions: OnyxEntry<ReportActions>;

    /** Whether we should show the Hold Interstitial explaining the feature */
    shownHoldUseExplanation: OnyxEntry<boolean>;
};

type MoneyRequestHeaderProps = MoneyRequestHeaderOnyxProps & {
    /** The report currently being looked at */
    report: Report;

    /** The policy which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<ReportAction>;
};

function MoneyRequestHeader({session, parentReport, report, parentReportAction, transaction, shownHoldUseExplanation = false, policy}: MoneyRequestHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [shouldShowHoldMenu, setShouldShowHoldMenu] = useState(false);
    const moneyRequestReport = parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport?.reportID);
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();

    // Only the requestor can take delete the request, admins can only edit it.
    const isActionOwner = typeof parentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && parentReportAction.actorAccountID === session?.accountID;
    const isPolicyAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isApprover = ReportUtils.isMoneyRequestReport(moneyRequestReport) && (session?.accountID ?? null) === moneyRequestReport?.managerID;

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
            Navigation.navigate(ROUTES.MONEY_REQUEST_HOLD_REASON.getRoute(policy?.type ?? '', iouTransactionID, report?.reportID, activeRoute));
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
                text: translate('iou.unholdRequest'),
                onSelected: () => changeMoneyRequestStatus(),
            });
        }
        if (!isOnHold && (isRequestIOU || canModifyStatus)) {
            threeDotsMenuItems.push({
                icon: Expensicons.Stopwatch,
                text: translate('iou.holdRequest'),
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

        if (isSmallScreenWidth) {
            if (Navigation.getActiveRoute().slice(1) === ROUTES.PROCESS_MONEY_REQUEST_HOLD) {
                Navigation.goBack();
            }
        } else {
            Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD);
        }
    }, [isSmallScreenWidth, shouldShowHoldMenu]);

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
                    shouldShowPinButton={false}
                    shouldShowThreeDotsButton
                    threeDotsMenuItems={threeDotsMenuItems}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                    report={{
                        ...report,
                        ownerAccountID: parentReport?.ownerAccountID,
                    }}
                    policy={policy}
                    shouldShowBackButton={isSmallScreenWidth}
                    onBackButtonPress={() => Navigation.goBack(undefined, false, true)}
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
                        shouldShowBorderBottom
                    />
                )}
                {isOnHold && <HoldBanner />}
            </View>
            <ConfirmModal
                title={translate('iou.deleteRequest')}
                isVisible={isDeleteModalVisible}
                onConfirm={deleteTransaction}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('iou.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            {isSmallScreenWidth && shouldShowHoldMenu && (
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

const MoneyRequestHeaderWithTransaction = withOnyx<MoneyRequestHeaderProps, Pick<MoneyRequestHeaderOnyxProps, 'transaction' | 'shownHoldUseExplanation'>>({
    transaction: {
        key: ({report, parentReportActions}) => {
            const parentReportAction = (report.parentReportActionID && parentReportActions ? parentReportActions[report.parentReportActionID] : {}) as ReportAction & OriginalMessageIOU;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${parentReportAction.originalMessage.IOUTransactionID ?? 0}`;
        },
    },
    shownHoldUseExplanation: {
        key: ONYXKEYS.NVP_HOLD_USE_EXPLAINED,
        initWithStoredValues: true,
    },
})(MoneyRequestHeader);

export default withOnyx<Omit<MoneyRequestHeaderProps, 'transaction' | 'shownHoldUseExplanation'>, Omit<MoneyRequestHeaderOnyxProps, 'transaction' | 'shownHoldUseExplanation'>>({
    session: {
        key: ONYXKEYS.SESSION,
    },
    parentReport: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
    },
    parentReportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID ?? '0'}`,
        canEvict: false,
    },
})(MoneyRequestHeaderWithTransaction);
