import {usePersonalDetails} from '@components/OnyxListItemProvider';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';

import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getIOUActionForReportID, isSplitBillAction as isSplitBillActionReportActionsUtils, isTrackExpenseAction as isTrackExpenseActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {isIOUReport} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';

import Navigation from '@navigation/Navigation';

import {contextMenuRef} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasOnceLoadedReportActionsSelector, pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';

import type {ListRenderItem} from '@shopify/flash-list';
import type {LayoutChangeEvent} from 'react-native';

import {useIsFocused} from '@react-navigation/core';
import React, {useCallback, useMemo, useRef, useState} from 'react';

import type {MoneyRequestReportPreviewProps} from './types';

import MoneyRequestReportPreviewContent from './MoneyRequestReportPreviewContent';

function MoneyRequestReportPreview({
    iouReportID,
    iouReport,
    policyID,
    chatReportID,
    chatReport,
    action,
    isHovered = false,
    isWhisper = false,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    shouldShowBorder,
}: MoneyRequestReportPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const personalDetailsList = usePersonalDetails();
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(invoiceReceiverPolicyID)}`);
    const invoiceReceiverPersonalDetail = chatReport?.invoiceReceiver && 'accountID' in chatReport.invoiceReceiver ? personalDetailsList?.[chatReport.invoiceReceiver.accountID] : null;
    const reportTransactionsCollection = useReportTransactionsCollection(iouReportID);
    const {isOffline} = useNetwork();
    const transactions = useMemo(
        () =>
            Object.values(reportTransactionsCollection ?? {}).filter(
                (transaction): transaction is Transaction => !!transaction && (isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
            ),
        [reportTransactionsCollection, isOffline],
    );
    const policy = usePolicy(policyID);
    const lastTransaction = transactions?.at(0);
    const lastTransactionViolations = useTransactionViolations(lastTransaction?.transactionID);
    const isTrackExpenseAction = isTrackExpenseActionReportActionsUtils(action);
    const isSplitBillAction = isSplitBillActionReportActionsUtils(action);

    const widthsRef = useRef<{currentWidth: number | null; currentWrapperWidth: number | null}>({currentWidth: null, currentWrapperWidth: null});
    const [widths, setWidths] = useState({currentWidth: 0, currentWrapperWidth: 0});

    const updateWidths = useCallback(() => {
        const {currentWidth, currentWrapperWidth} = widthsRef.current;

        if (currentWidth && currentWrapperWidth) {
            setWidths({currentWidth, currentWrapperWidth});
        }
    }, []);

    const onCarouselLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const newWidth = e.nativeEvent.layout.width;
            if (widthsRef.current.currentWidth !== newWidth) {
                widthsRef.current.currentWidth = newWidth;
                updateWidths();
            }
        },
        [updateWidths],
    );
    const onWrapperLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const newWrapperWidth = e.nativeEvent.layout.width;
            if (widthsRef.current.currentWrapperWidth !== newWrapperWidth) {
                widthsRef.current.currentWrapperWidth = newWrapperWidth;
                updateWidths();
            }
        },
        [updateWidths],
    );

    const reportPreviewStyles = useMemo(
        () => StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, transactions.length, widths.currentWidth, widths.currentWrapperWidth),
        [StyleUtils, widths, shouldUseNarrowLayout, transactions.length],
    );
    const shouldShowPayerAndReceiver = useMemo(() => {
        if (!isIOUReport(iouReport) && action.childType !== CONST.REPORT.TYPE.IOU) {
            return false;
        }

        return transactions.some((transaction) => (Number(transaction?.modifiedAmount) || transaction?.amount) < 0);
    }, [transactions, action.childType, iouReport]);

    const openReportFromPreview = useCallback(() => {
        if (!iouReportID || contextMenuRef.current?.isContextMenuOpening) {
            return;
        }

        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${iouReportID}`, {
            name: 'MoneyRequestReportPreview',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });
        // Small screens navigate to full report view since super wide RHP
        // is not available on narrow layouts and would break the navigation logic.
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
        } else {
            Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo: Navigation.getActiveRoute()}));
        }
    }, [iouReportID, isSmallScreenWidth]);
    const [hasOnceLoadedReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${chatReportID}`, {
        selector: hasOnceLoadedReportActionsSelector,
    });
    const [pendingNewTransactionIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReportID}`, {
        selector: pendingNewTransactionIDsSelector,
    });
    const isFocused = useIsFocused();
    const newTransactions = useNewTransactions(hasOnceLoadedReportActions, transactions, pendingNewTransactionIDs, chatReportID, isFocused);
    // Don't surface the highlight while the preview is covered — it'd animate the one-shot off-screen and be missed.
    const isReportVisible = shouldUseNarrowLayout ? isFocused : true;
    const newTransactionIDs = new Set(isReportVisible ? newTransactions.map((transaction) => transaction.transactionID) : []);

    const transactionPreviewContainerStyles = [styles.h100, reportPreviewStyles.transactionPreviewCarouselStyle];

    const renderItem: ListRenderItem<Transaction> = ({item}) => (
        <TransactionPreview
            chatReport={chatReport}
            action={getIOUActionForReportID(item.reportID, item.transactionID)}
            contextAction={action}
            reportID={item.reportID}
            isBillSplit={isSplitBillAction}
            isTrackExpense={isTrackExpenseAction}
            isWhisper={isWhisper}
            isHovered={isHovered}
            iouReportID={iouReportID}
            containerStyles={transactionPreviewContainerStyles}
            transactionPreviewWidth={reportPreviewStyles.transactionPreviewCarouselStyle.width}
            transactionID={item.transactionID}
            reportPreviewAction={action}
            onPreviewPressed={openReportFromPreview}
            shouldShowPayerAndReceiver={shouldShowPayerAndReceiver}
            shouldHighlight={!!newTransactionIDs?.has(item.transactionID)}
        />
    );

    return (
        <MoneyRequestReportPreviewContent
            newTransactionIDs={newTransactionIDs}
            iouReportID={iouReportID}
            chatReportID={chatReportID}
            iouReport={iouReport}
            chatReport={chatReport}
            action={action}
            containerStyles={[reportPreviewStyles.componentStyle]}
            isHovered={isHovered}
            isWhisper={isWhisper}
            onPaymentOptionsShow={onPaymentOptionsShow}
            onPaymentOptionsHide={onPaymentOptionsHide}
            transactions={transactions}
            policy={policy}
            invoiceReceiverPersonalDetail={invoiceReceiverPersonalDetail}
            invoiceReceiverPolicy={invoiceReceiverPolicy}
            lastTransactionViolations={lastTransactionViolations}
            renderTransactionItem={renderItem}
            onCarouselLayout={onCarouselLayout}
            onWrapperLayout={onWrapperLayout}
            currentWidth={widths.currentWidth}
            reportPreviewStyles={reportPreviewStyles}
            onPress={openReportFromPreview}
            shouldShowBorder={shouldShowBorder}
            forwardedFSClass={CONST.FULLSTORY.CLASS.UNMASK}
        />
    );
}

export default MoneyRequestReportPreview;
