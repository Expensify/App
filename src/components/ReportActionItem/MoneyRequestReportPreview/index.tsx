import {usePersonalDetails} from '@components/OnyxListItemProvider';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';

import {createTransactionThreadReport, openReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
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

import type {ListRenderItem} from '@shopify/flash-list';
import type {LayoutChangeEvent} from 'react-native';

import {useIsFocused} from '@react-navigation/core';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {MoneyRequestReportPreviewProps} from './types';

import MoneyRequestReportPreviewContent from './MoneyRequestReportPreviewContent';

// Delay (ms) before the pressed expense opens on top of the report's wide RHP. Letting the report settle
// into the wide RHP first makes the two panels open as a cascade rather than appearing at once.
const PRESSED_EXPENSE_CASCADE_DELAY = 180;

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
    const {markReportIDAsExpense, markReportIDAsMultiTransactionExpense} = useWideRHPActions();
    const personalDetailsList = usePersonalDetails();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(invoiceReceiverPolicyID)}`);
    const invoiceReceiverPersonalDetail = chatReport?.invoiceReceiver && 'accountID' in chatReport.invoiceReceiver ? personalDetailsList?.[chatReport.invoiceReceiver.accountID] : null;
    const reportTransactionsCollection = useReportTransactionsCollection(iouReportID);
    const {isOffline} = useNetwork();
    // Full set of the report's transactions (matches ReportUtils' `getReportTransactions`). Used for the receipt/scan/
    // reimbursable derivations so they include optimistically-deleted rows, exactly as before the decomposition.
    const allReportTransactions = Object.values(reportTransactionsCollection ?? {}).filter((transaction): transaction is Transaction => !!transaction);
    const transactions = allReportTransactions.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    // Tracks how many actions the IOU report has loaded so a deferred expense press can be retried once
    // the actions arrive (they may be missing right after a cache clear).
    const [iouReportActionCount] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(iouReportID)}`, {
        selector: (reportActions) => Object.keys(reportActions ?? {}).length,
    });
    // Holds a pressed transaction whose thread report could not be resolved yet, so the expense can be
    // opened once the IOU report's actions have loaded instead of falling back to the parent report.
    const pendingExpenseTransactionRef = useRef<Transaction | null>(null);
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

    // Resolve the target transaction thread report. Prefer the IOU action's childReportID, then the
    // transaction's own thread id, and finally create the thread inline so the press never lands on a dead route.
    const resolveChildReportID = useCallback(
        (transaction: Transaction) => {
            const transactionIOUAction = getIOUActionForReportID(transaction.reportID, transaction.transactionID);
            let childReportID = transactionIOUAction?.childReportID ?? transaction.transactionThreadReportID;
            if (childReportID) {
                // The thread already exists, but it may not be cached (offline, or after a cache clear). Seed its
                // optimistic report shell + parent linkage so navigating to it renders the expense instead of a
                // blank/not-found screen — the same thing the canonical transaction-thread openers do.
                setOptimisticTransactionThread(childReportID, iouReport?.reportID ?? transaction.reportID, transactionIOUAction?.reportActionID, iouReport?.policyID ?? policyID);
            } else if (transactionIOUAction?.reportActionID) {
                const transactionID = isMoneyRequestAction(transactionIOUAction) ? getOriginalMessage(transactionIOUAction)?.IOUTransactionID : undefined;
                if (transactionID) {
                    childReportID = createTransactionThreadReport({
                        introSelected,
                        currentUserLogin: currentUserEmail ?? '',
                        currentUserAccountID,
                        betas,
                        iouReport,
                        iouReportAction: transactionIOUAction,
                    })?.reportID;
                }
            }
            return childReportID;
        },
        [betas, currentUserAccountID, currentUserEmail, introSelected, iouReport, policyID],
    );

    const navigateToExpense = useCallback(
        (childReportID: string) => {
            startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${childReportID}`, {
                name: 'MoneyRequestReportPreview.Transaction',
                op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
            });

            if (isSmallScreenWidth) {
                const backTo = Navigation.getActiveRoute();
                if (!iouReportID) {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID, undefined, undefined, backTo));
                    return;
                }

                // On mobile web, open the parent report as the top of the split (so it stays interactive and is never
                // frozen under the expense), then open the pressed expense in the RHP over it — the same way the report
                // view and the wide layout open an expense. Browser/OS back and the header back both close the RHP to
                // the fully-loaded report, then to the chat. Pushing the expense as a second split report screen
                // instead leaves the parent report frozen beneath it (freezeNonTopScreens), so hard-backing to that
                // just-thawed, still-loading report drops the first transaction-row tap.
                if (getPlatform() === CONST.PLATFORM.WEB) {
                    const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, backTo);
                    markReportIDAsExpense(childReportID);
                    setActiveTransactionIDs(transactions.map((transaction) => transaction.transactionID));
                    // Open the report first, then defer the expense's RHP by one frame so the report lands as its own
                    // browser-history entry — hard/browser back and the header back both stop on the report, then the
                    // chat. One frame keeps the report barely visible before the full-screen RHP covers it. (Opening
                    // both in the same tick removes the flash but drops the report from history, so back would skip it.)
                    Navigation.navigate(reportRoute);
                    setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: reportRoute})));
                    return;
                }

                // On native the wide RHP is unavailable and there is a swipe-back gesture, so open the expense with the
                // parent report as a real stack entry underneath as a single forward slide (see
                // openExpenseOverParentReport for the mechanics).
                Navigation.openExpenseOverParentReport(iouReportID, childReportID, backTo);
                return;
            }

            // On wide layouts open the expense report itself in the wide RHP (super wide for multi-expense
            // reports) and show the pressed expense on top of it — mirroring how an expense opens from the
            // report view — rather than navigating to the report in the Inbox. Back returns to the report,
            // and back again to the chat.
            if (iouReportID) {
                const reportRoute = ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo: Navigation.getActiveRoute()});
                markReportIDAsMultiTransactionExpense(iouReportID);
                Navigation.navigate(reportRoute);
                setActiveTransactionIDs(transactions.map((transaction) => transaction.transactionID)).then(() => {
                    markReportIDAsExpense(childReportID);
                    // Let the report's wide RHP settle before opening the pressed expense on top, so the two
                    // panels open as a cascade rather than at once.
                    setTimeout(() => {
                        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: reportRoute}));
                    }, PRESSED_EXPENSE_CASCADE_DELAY);
                });
                return;
            }

            // Fallback when the parent report is unknown: open the pressed expense alone in the wide RHP.
            setActiveTransactionIDs(transactions.map((transaction) => transaction.transactionID)).then(() => {
                markReportIDAsExpense(childReportID);
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: Navigation.getActiveRoute()}));
            });
        },
        [isSmallScreenWidth, iouReportID, markReportIDAsExpense, markReportIDAsMultiTransactionExpense, transactions],
    );

    const openTransactionFromPreview = useCallback(
        (transaction: Transaction) => {
            if (contextMenuRef.current?.isContextMenuOpening) {
                return;
            }

            // A report with a single expense opens the report itself, not the lone expense — opening the
            // expense directly would skip the report the user expects to land on.
            if (transactions.length <= 1) {
                openReportFromPreview();
                return;
            }

            const childReportID = resolveChildReportID(transaction);
            if (childReportID) {
                navigateToExpense(childReportID);
                return;
            }

            // The thread could not be resolved. If the IOU report's action for this expense isn't loaded yet
            // (e.g. right after a cache clear), fetch the report's actions and open the expense once they arrive
            // (see the effect below) instead of falling back to the parent report and losing the pressed expense.
            // Skip this while offline: openReport can't fetch, so the deferred press would never fire (dead tap) —
            // fall through to opening the cached parent report instead, matching the "View" button.
            const isIOUActionLoaded = !!getIOUActionForReportID(transaction.reportID, transaction.transactionID);
            if (!isIOUActionLoaded && iouReportID && !isOffline) {
                pendingExpenseTransactionRef.current = transaction;
                openReport({reportID: iouReportID, introSelected, betas});
                return;
            }

            openReportFromPreview();
        },
        [betas, introSelected, iouReportID, isOffline, navigateToExpense, openReportFromPreview, resolveChildReportID, transactions.length],
    );

    // Completes a deferred expense press once the IOU report's actions have loaded.
    useEffect(() => {
        const pendingTransaction = pendingExpenseTransactionRef.current;
        if (!pendingTransaction) {
            return;
        }
        const childReportID = resolveChildReportID(pendingTransaction);
        if (childReportID) {
            pendingExpenseTransactionRef.current = null;
            navigateToExpense(childReportID);
            return;
        }
        // The actions finished loading but the expense still has no resolvable thread — open the parent report.
        if (iouReportActionCount) {
            pendingExpenseTransactionRef.current = null;
            openReportFromPreview();
        }
    }, [iouReportActionCount, navigateToExpense, openReportFromPreview, resolveChildReportID]);

    const renderItem: ListRenderItem<Transaction> = ({item}) => {
        const transactionIOUAction = getIOUActionForReportID(item.reportID, item.transactionID);
        return (
            <TransactionPreview
                chatReport={chatReport}
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
                onPreviewPressed={() => openTransactionFromPreview(item)}
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
            allReportTransactions={allReportTransactions}
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
