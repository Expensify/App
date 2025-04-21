import React, {useMemo, useState} from 'react';
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
import {getIOUActionForReportID, isSplitBillAction as isSplitBillActionReportActionsUtils, isTrackExpenseAction as isTrackExpenseActionReportActionsUtils} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
}: MoneyRequestReportPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {canBeMissing: false});
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
        {canBeMissing: false},
    );
    const [invoiceReceiverPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails) =>
            personalDetails?.[chatReport?.invoiceReceiver && 'accountID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.accountID : CONST.DEFAULT_NUMBER_ID],
        canBeMissing: false,
    });
    const [iouReport, transactions, violations, deletedTransactions] = useReportWithTransactionsAndViolations(iouReportID);
    const transactionsOrDeleted = useMemo(() => {
        if (!deletedTransactions) {
            return transactions;
        }
        const transactionIDs = transactions.map((transaction) => transaction.transactionID);
        return [...transactions, ...deletedTransactions.filter((transaction) => !transactionIDs.includes(transaction.transactionID))];
    }, [transactions, deletedTransactions]);
    const policy = usePolicy(policyID);
    const lastTransaction = transactionsOrDeleted?.at(0);
    const lastTransactionViolations = useTransactionViolations(lastTransaction?.transactionID);
    const {isDelegateAccessRestricted} = useDelegateUserDetails();
    const isTrackExpenseAction = isTrackExpenseActionReportActionsUtils(action);
    const isSplitBillAction = isSplitBillActionReportActionsUtils(action);
    const [currentWidth, setCurrentWidth] = useState(256);
    const reportPreviewStyles = useMemo(
        () => StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, currentWidth, transactionsOrDeleted.length === 1),
        [StyleUtils, currentWidth, shouldUseNarrowLayout, transactionsOrDeleted.length],
    );

    const renderItem: ListRenderItem<Transaction> = ({item}) => (
        <TransactionPreview
            chatReportID={chatReportID}
            action={getIOUActionForReportID(item.reportID, item.transactionID)}
            reportID={item.reportID}
            isBillSplit={isSplitBillAction}
            isTrackExpense={isTrackExpenseAction}
            contextMenuAnchor={contextMenuAnchor}
            isWhisper={isWhisper}
            isHovered={isHovered}
            iouReportID={iouReportID}
            onPreviewPressed={() => {}}
            wrapperStyle={reportPreviewStyles.transactionPreviewStyle}
            containerStyles={[styles.h100, containerStyles]}
            transactionID={item.transactionID}
        />
    );

    return (
        <MoneyRequestReportPreviewContent
            containerStyles={[reportPreviewStyles.componentStyle, containerStyles]}
            contextMenuAnchor={contextMenuAnchor}
            isHovered={isHovered}
            isWhisper={isWhisper}
            checkIfContextMenuActive={checkIfContextMenuActive}
            onPaymentOptionsShow={onPaymentOptionsShow}
            onPaymentOptionsHide={onPaymentOptionsHide}
            action={action}
            chatReportID={chatReportID}
            iouReportID={iouReportID}
            policyID={undefined}
            iouReport={iouReport}
            transactions={transactionsOrDeleted}
            violations={violations}
            chatReport={chatReport}
            policy={policy}
            invoiceReceiverPersonalDetail={invoiceReceiverPersonalDetail}
            invoiceReceiverPolicy={invoiceReceiverPolicy}
            lastTransactionViolations={lastTransactionViolations}
            isDelegateAccessRestricted={isDelegateAccessRestricted}
            renderItem={renderItem}
            getCurrentWidth={(e: LayoutChangeEvent) => {
                setCurrentWidth(e.nativeEvent.layout.width ?? 255);
            }}
            reportPreviewStyles={reportPreviewStyles}
            shouldDisplayContextMenu={shouldDisplayContextMenu}
            isInvoice={isInvoice}
        />
    );
}

MoneyRequestReportPreview.displayName = 'MoneyRequestReportPreview';

export default MoneyRequestReportPreview;
