import {useIsFocused} from '@react-navigation/core';
import type {ListRenderItem} from '@shopify/flash-list';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {createTransactionThreadReport} from '@libs/actions/Report';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getIOUActionForReportID,
    getOriginalMessage,
    isMoneyRequestAction,
    isSplitBillAction as isSplitBillActionReportActionsUtils,
    isTrackExpenseAction as isTrackExpenseActionReportActionsUtils,
} from '@libs/ReportActionsUtils';
import {isIOUReport} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import Navigation from '@navigation/Navigation';
import {contextMenuRef} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasOnceLoadedReportActionsSelector, pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';
import MoneyRequestReportPreviewContent from './MoneyRequestReportPreviewContent';
import type {MoneyRequestReportPreviewProps} from './types';

function MoneyRequestReportPreview({
    iouReportID,
    policyID,
    chatReportID,
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
    const {markReportIDAsExpense} = useWideRHPActions();
    const personalDetailsList = usePersonalDetails();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(invoiceReceiverPolicyID)}`);
    const invoiceReceiverPersonalDetail = chatReport?.invoiceReceiver && 'accountID' in chatReport.invoiceReceiver ? personalDetailsList?.[chatReport.invoiceReceiver.accountID] : null;
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(iouReportID);
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
    const newTransactionIDs = new Set(newTransactions.map((transaction) => transaction.transactionID));

    const transactionPreviewContainerStyles = [styles.h100, reportPreviewStyles.transactionPreviewCarouselStyle];

    const openTransactionFromPreview = useCallback(
        (transactionIOUAction: ReturnType<typeof getIOUActionForReportID>) => {
            if (contextMenuRef.current?.isContextMenuOpening) {
                return;
            }

            // A report with a single expense opens the report itself, not the lone expense — opening the
            // expense directly would skip the report the user expects to land on.
            if (transactions.length <= 1) {
                openReportFromPreview();
                return;
            }

            // Resolve the target transaction thread report. If the thread has not been materialized yet,
            // create it inline so the click never lands on a dead route.
            let childReportID = transactionIOUAction?.childReportID;
            if (!childReportID && transactionIOUAction?.reportActionID) {
                const transactionID = isMoneyRequestAction(transactionIOUAction) ? getOriginalMessage(transactionIOUAction)?.IOUTransactionID : undefined;
                if (transactionID) {
                    const transactionThreadReport = createTransactionThreadReport({
                        introSelected,
                        currentUserLogin: currentUserEmail ?? '',
                        currentUserAccountID,
                        betas,
                        iouReport,
                        iouReportAction: transactionIOUAction,
                    });
                    childReportID = transactionThreadReport?.reportID;
                }
            }

            if (!childReportID) {
                // Fall back to opening the parent report rather than swallowing the click.
                openReportFromPreview();
                return;
            }

            startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${childReportID}`, {
                name: 'MoneyRequestReportPreview.Transaction',
                op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
            });

            // On narrow layouts push the report onto the stack first and then the expense on top, so the
            // back button returns to the report. On wide layouts mark the expense report so it opens in the
            // wide RHP with the report shown alongside it, matching how an expense opens from the report view.
            if (isSmallScreenWidth) {
                if (iouReportID) {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID, undefined, undefined, Navigation.getActiveRoute()));
                return;
            }

            if (iouReportID) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
            }
            markReportIDAsExpense(childReportID);
            setActiveTransactionIDs(transactions.map((transaction) => transaction.transactionID));
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: Navigation.getActiveRoute()}));
        },
        [betas, currentUserAccountID, currentUserEmail, introSelected, iouReport, iouReportID, isSmallScreenWidth, markReportIDAsExpense, openReportFromPreview, transactions],
    );

    const renderItem: ListRenderItem<Transaction> = ({item}) => {
        const transactionIOUAction = getIOUActionForReportID(item.reportID, item.transactionID);
        return (
            <TransactionPreview
                chatReportID={chatReportID}
                action={transactionIOUAction}
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
                onPreviewPressed={() => openTransactionFromPreview(transactionIOUAction)}
                shouldShowPayerAndReceiver={shouldShowPayerAndReceiver}
                shouldHighlight={!!newTransactionIDs?.has(item.transactionID)}
            />
        );
    };

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
