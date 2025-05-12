import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent, ListRenderItem} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import Performance from '@libs/Performance';
import {getIOUActionForReportID, isSplitBillAction as isSplitBillActionReportActionsUtils, isTrackExpenseAction as isTrackExpenseActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {isIOUReport} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import {contextMenuRef} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import MoneyRequestReportPreviewContent from './MoneyRequestReportPreviewContent';
import type {MoneyRequestReportPreviewProps} from './types';

function MoneyRequestReportPreview({
    iouReportID,
    policyID,
    chatReportID,
    action,
    containerStyles,
    contextMenuAnchor,
    isHovered = false,
    isWhisper = false,
    checkIfContextMenuActive = () => {},
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    shouldDisplayContextMenu = true,
    isInvoice = false,
    shouldShowBorder,
}: MoneyRequestReportPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {canBeMissing: true});
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
        {canBeMissing: true},
    );
    const [invoiceReceiverPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails) =>
            personalDetails?.[chatReport?.invoiceReceiver && 'accountID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.accountID : CONST.DEFAULT_NUMBER_ID],
        canBeMissing: true,
    });
    const [iouReport, transactions, violations] = useReportWithTransactionsAndViolations(iouReportID);
    const policy = usePolicy(policyID);
    const lastTransaction = transactions?.at(0);
    const lastTransactionViolations = useTransactionViolations(lastTransaction?.transactionID);
    const {isDelegateAccessRestricted} = useDelegateUserDetails();
    const isTrackExpenseAction = isTrackExpenseActionReportActionsUtils(action);
    const isSplitBillAction = isSplitBillActionReportActionsUtils(action);
    const [currentWidth, setCurrentWidth] = useState(256);
    const reportPreviewStyles = useMemo(
        () => StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, currentWidth, transactions.length === 1),
        [StyleUtils, currentWidth, shouldUseNarrowLayout, transactions.length],
    );

    const shouldShowIOUData = useMemo(() => {
        if (!isIOUReport(iouReport) && action.childType !== CONST.REPORT.TYPE.IOU) {
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return transactions.some((transaction) => (transaction?.modifiedAmount || transaction?.amount) < 0);
    }, [transactions, action.childType, iouReport]);

    const openReportFromPreview = useCallback(() => {
        if (!iouReportID || contextMenuRef.current?.isContextMenuOpening) {
            return;
        }

        Performance.markStart(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Timing.start(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, undefined, undefined, Navigation.getActiveRoute()));
    }, [iouReportID]);

    const renderItem: ListRenderItem<Transaction> = ({item}) => (
        <TransactionPreview
            chatReportID={chatReportID}
            action={getIOUActionForReportID(item.reportID, item.transactionID)}
            contextAction={action}
            reportID={item.reportID}
            isBillSplit={isSplitBillAction}
            isTrackExpense={isTrackExpenseAction}
            contextMenuAnchor={contextMenuAnchor}
            isWhisper={isWhisper}
            isHovered={isHovered}
            iouReportID={iouReportID}
            containerStyles={[styles.h100, reportPreviewStyles.transactionPreviewStyle, containerStyles]}
            shouldDisplayContextMenu={shouldDisplayContextMenu}
            transactionPreviewWidth={reportPreviewStyles.transactionPreviewStyle.width}
            transactionID={item.transactionID}
            reportPreviewAction={action}
            onPreviewPressed={openReportFromPreview}
            shouldShowIOUData={shouldShowIOUData}
        />
    );

    return (
        <MoneyRequestReportPreviewContent
            iouReportID={iouReportID}
            chatReportID={chatReportID}
            iouReport={iouReport}
            chatReport={chatReport}
            action={action}
            containerStyles={[reportPreviewStyles.componentStyle, containerStyles]}
            contextMenuAnchor={contextMenuAnchor}
            isHovered={isHovered}
            isWhisper={isWhisper}
            checkIfContextMenuActive={checkIfContextMenuActive}
            onPaymentOptionsShow={onPaymentOptionsShow}
            onPaymentOptionsHide={onPaymentOptionsHide}
            transactions={transactions}
            violations={violations}
            policy={policy}
            invoiceReceiverPersonalDetail={invoiceReceiverPersonalDetail}
            invoiceReceiverPolicy={invoiceReceiverPolicy}
            lastTransactionViolations={lastTransactionViolations}
            isDelegateAccessRestricted={isDelegateAccessRestricted}
            renderTransactionItem={renderItem}
            onLayout={(e: LayoutChangeEvent) => {
                setCurrentWidth(e.nativeEvent.layout.width ?? 255);
            }}
            currentWidth={currentWidth}
            reportPreviewStyles={reportPreviewStyles}
            shouldDisplayContextMenu={shouldDisplayContextMenu}
            isInvoice={isInvoice}
            onPress={openReportFromPreview}
            shouldShowBorder={shouldShowBorder}
        />
    );
}

MoneyRequestReportPreview.displayName = 'MoneyRequestReportPreview';

export default MoneyRequestReportPreview;
