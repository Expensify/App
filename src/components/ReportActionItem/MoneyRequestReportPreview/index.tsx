import type {ListRenderItem} from '@shopify/flash-list';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
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
import {hasOnceLoadedReportActionsSelector} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';
import MoneyRequestReportPreviewContent from './MoneyRequestReportPreviewContent';
import type {MoneyRequestReportPreviewProps} from './types';

function MoneyRequestReportPreview({
    iouReportID,
    policyID,
    chatReportID,
    action,
    contextMenuAnchor,
    isHovered = false,
    isWhisper = false,
    checkIfContextMenuActive = () => {},
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    shouldDisplayContextMenu = true,
    shouldShowBorder,
    originalReportID,
}: MoneyRequestReportPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
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
    const newTransactions = useNewTransactions(hasOnceLoadedReportActions, transactions);
    const newTransactionIDs = new Set(newTransactions.map((transaction) => transaction.transactionID));

    const transactionPreviewContainerStyles = [styles.h100, reportPreviewStyles.transactionPreviewCarouselStyle];

    const openTransactionFromPreview = useCallback(
        (transactionIOUAction: ReturnType<typeof getIOUActionForReportID>) => {
            if (contextMenuRef.current?.isContextMenuOpening) {
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

            // On narrow layouts (mobile), push the report on top of the chat first and then the
            // transaction thread on top of the report, so the back button returns the user to the report.
            // On wide layouts the transaction thread opens in the RHP next to the report, so a single
            // navigation is enough.
            if (isSmallScreenWidth) {
                if (iouReportID) {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID, undefined, undefined, Navigation.getActiveRoute()));
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: Navigation.getActiveRoute()}));
        },
        [betas, currentUserAccountID, currentUserEmail, introSelected, iouReport, iouReportID, isSmallScreenWidth, openReportFromPreview],
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
                contextMenuAnchor={contextMenuAnchor}
                isWhisper={isWhisper}
                isHovered={isHovered}
                iouReportID={iouReportID}
                containerStyles={transactionPreviewContainerStyles}
                shouldDisplayContextMenu={shouldDisplayContextMenu}
                transactionPreviewWidth={reportPreviewStyles.transactionPreviewCarouselStyle.width}
                transactionID={item.transactionID}
                reportPreviewAction={action}
                onPreviewPressed={() => openTransactionFromPreview(transactionIOUAction)}
                shouldShowPayerAndReceiver={shouldShowPayerAndReceiver}
                shouldHighlight={!!newTransactionIDs?.has(item.transactionID)}
                originalReportID={originalReportID}
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
            contextMenuAnchor={contextMenuAnchor}
            isHovered={isHovered}
            isWhisper={isWhisper}
            checkIfContextMenuActive={checkIfContextMenuActive}
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
            shouldDisplayContextMenu={shouldDisplayContextMenu}
            onPress={openReportFromPreview}
            shouldShowBorder={shouldShowBorder}
            forwardedFSClass={CONST.FULLSTORY.CLASS.UNMASK}
            originalReportID={originalReportID}
        />
    );
}

export default MoneyRequestReportPreview;
