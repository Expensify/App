import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as HeaderUtils from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
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
import * as Expensicons from './Icon/Expensicons';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import {usePersonalDetails} from './OnyxProvider';

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
};

type MoneyRequestHeaderProps = MoneyRequestHeaderOnyxProps & {
    /** The report currently being looked at */
    report: Report;

    /** The policy which the report is tied to */
    policy: Policy;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: ReportAction & OriginalMessageIOU;
};

function MoneyRequestHeader({session, parentReport, report, parentReportAction, transaction, policy}: MoneyRequestHeaderProps) {
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const moneyRequestReport = parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport?.reportID);
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();

    // Only the requestor can take delete the request, admins can only edit it.
    const isActionOwner = typeof parentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && parentReportAction.actorAccountID === session?.accountID;

    const deleteTransaction = useCallback(() => {
        IOU.deleteMoneyRequest(parentReportAction?.originalMessage?.IOUTransactionID ?? '', parentReportAction, true);
        setIsDeleteModalVisible(false);
    }, [parentReportAction, setIsDeleteModalVisible]);

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);
    const isPending = TransactionUtils.isExpensifyCardTransaction(transaction) && TransactionUtils.isPending(transaction);
    const canModifyRequest = isActionOwner && !isSettled && !isApproved && !ReportActionsUtils.isDeletedAction(parentReportAction);
    let canDeleteRequest = canModifyRequest;

    if (ReportUtils.isPaidGroupPolicyExpenseReport(moneyRequestReport)) {
        // If it's a paid policy expense report, only allow deleting the request if it's not submitted or the user is the policy admin
        canDeleteRequest = canDeleteRequest && (ReportUtils.isDraftExpenseReport(moneyRequestReport) || PolicyUtils.isPolicyAdmin(policy));
    }

    useEffect(() => {
        if (canDeleteRequest) {
            return;
        }

        setIsDeleteModalVisible(false);
    }, [canDeleteRequest]);
    const threeDotsMenuItems = [HeaderUtils.getPinMenuItem(report)];
    if (canModifyRequest) {
        if (!TransactionUtils.hasReceipt(transaction)) {
            threeDotsMenuItems.push({
                icon: Expensicons.Receipt,
                text: translate('receipt.addReceipt'),
                onSelected: () =>
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                            CONST.IOU.ACTION.EDIT,
                            CONST.IOU.TYPE.REQUEST,
                            transaction?.transactionID ?? '',
                            report.reportID,
                            Navigation.getActiveRouteWithoutParams(),
                        ),
                    ),
            });
        }
        if (canDeleteRequest) {
            threeDotsMenuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('reportActionContextMenu.deleteAction', {action: parentReportAction}),
                onSelected: () => setIsDeleteModalVisible(true),
            });
        }
    }

    return (
        <>
            <View style={[styles.pl0]}>
                <HeaderWithBackButton
                    shouldShowBorderBottom={!isScanning && !isPending}
                    shouldShowAvatarWithDisplay
                    shouldShowPinButton={false}
                    shouldShowThreeDotsButton
                    threeDotsMenuItems={threeDotsMenuItems}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                    report={{
                        ...report,
                        ownerAccountID: parentReport?.ownerAccountID,
                    }}
                    policy={policy}
                    personalDetails={personalDetails}
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
        </>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';

const MoneyRequestHeaderWithTransaction = withOnyx<MoneyRequestHeaderProps, Pick<MoneyRequestHeaderOnyxProps, 'transaction'>>({
    transaction: {
        key: ({report, parentReportActions}) => {
            const parentReportAction = (report.parentReportActionID && parentReportActions ? parentReportActions[report.parentReportActionID] : {}) as ReportAction & OriginalMessageIOU;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${parentReportAction.originalMessage.IOUTransactionID ?? 0}`;
        },
    },
})(MoneyRequestHeader);

export default withOnyx<Omit<MoneyRequestHeaderProps, 'transaction'>, Omit<MoneyRequestHeaderOnyxProps, 'transaction'>>({
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
