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
import {clearActiveTransactionIDs, getActiveTransactionIDs, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getIOUActionForReportID,
    getOriginalMessage,
    isMoneyRequestAction,
    isSplitBillAction as isSplitBillActionReportActionsUtils,
    isTrackExpenseAction as isTrackExpenseActionReportActionsUtils,
} from '@libs/ReportActionsUtils';
import {areAllRequestsBeingSmartScanned as areAllRequestsBeingSmartScannedReportUtils, getTransactionsWithReceipts, isIOUReport} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {hasNonReimbursableTransactions as hasNonReimbursableTransactionsTransactionUtils, isTransactionPendingDelete} from '@libs/TransactionUtils';

import Navigation from '@navigation/Navigation';

import {contextMenuRef} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasOnceLoadedReportActionsSelector, isLoadingInitialReportActionsSelector, pendingNewTransactionIDsSelector} from '@src/selectors/ReportMetaData';
import type {ReportActions, Transaction} from '@src/types/onyx';

import type {ListRenderItem} from '@shopify/flash-list';
import type {LayoutChangeEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/core';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {MoneyRequestReportPreviewProps} from './types';

import MoneyRequestReportPreviewContent from './MoneyRequestReportPreviewContent';

// How many actions the IOU report has loaded. Only the count matters. A deferred press retries when it changes.
const reportActionCountSelector = (reportActions: OnyxEntry<ReportActions>) => Object.keys(reportActions ?? {}).length;

// Lets the report settle first so the two open as a cascade rather than at once.
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
    const {markReportRHPWidth, unmarkReportRHPWidth} = useWideRHPActions();
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
    // reimbursable derivations below so they include optimistically-deleted rows, exactly as before the decomposition.
    // Kept local to this component rather than passed down, so children only receive the derived values they need.
    const allReportTransactions = Object.values(reportTransactionsCollection ?? {}).filter((transaction): transaction is Transaction => !!transaction);
    const transactions = allReportTransactions.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const orderedTransactionsRef = useRef<Transaction[]>([]);
    const handleOrderedTransactionsChange = useCallback((orderedTransactions: Transaction[]) => {
        orderedTransactionsRef.current = orderedTransactions;
    }, []);
    // Rendered order, not collection order, or the arrows walk a sequence that is not on screen. Deleted rows have no thread.
    const [iouReportActionCount] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(iouReportID)}`, {
        selector: reportActionCountSelector,
    });
    // When this flips back to false it re-runs the drain effect, so a press settles even when the fetch returns nothing new.
    const [isLoadingInitialIOUReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${getNonEmptyStringOnyxID(iouReportID)}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    // Replayed once the report's actions load. The route it was made on is how we know it is still wanted.
    const pendingExpenseTransactionRef = useRef<{transaction: Transaction; originRoute: string} | null>(null);
    // Carries its own release: the timer is otherwise the only thing that hands the staged globals back.
    const cascadeTimerRef = useRef<{timer: ReturnType<typeof setTimeout>; release: () => void} | null>(null);
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID, allReportTransactions);
    const hasNonReimbursableTransactions = hasNonReimbursableTransactionsTransactionUtils(allReportTransactions);
    const areAllRequestsBeingSmartScanned = areAllRequestsBeingSmartScannedReportUtils(iouReportID, action, allReportTransactions);
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

    // An explicit choice supersedes anything an earlier press staged. Also reachable from the "View" button, which
    // opens the same report route, so the cascade's own "did the user navigate away" guard would not catch it.
    const cancelPendingPress = useCallback(() => {
        pendingExpenseTransactionRef.current = null;
        if (!cascadeTimerRef.current) {
            return;
        }
        clearTimeout(cascadeTimerRef.current.timer);
        cascadeTimerRef.current.release();
        cascadeTimerRef.current = null;
    }, []);

    const openReportFromPreview = useCallback(() => {
        if (!iouReportID || contextMenuRef.current?.isContextMenuOpening) {
            return;
        }

        cancelPendingPress();

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
    }, [cancelPendingPress, iouReportID, isSmallScreenWidth]);
    const [hasOnceLoadedReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${chatReportID}`, {
        selector: hasOnceLoadedReportActionsSelector,
    });
    const [pendingNewTransactionIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReportID}`, {
        selector: pendingNewTransactionIDsSelector,
    });
    const isFocused = useIsFocused();
    const newTransactions = useNewTransactions(hasOnceLoadedReportActions, transactions, pendingNewTransactionIDs, chatReportID, isFocused);
    // Don't surface the highlight while the preview is covered. it'd animate the one-shot off-screen and be missed.
    const isReportVisible = shouldUseNarrowLayout ? isFocused : true;
    const newTransactionIDs = new Set(isReportVisible ? newTransactions.map((transaction) => transaction.transactionID) : []);

    const transactionPreviewContainerStyles = [styles.h100, reportPreviewStyles.transactionPreviewCarouselStyle];

    const resolveChildReportID = useCallback(
        (transaction: Transaction) => {
            const transactionIOUAction = getIOUActionForReportID(transaction.reportID, transaction.transactionID);
            let childReportID = transactionIOUAction?.childReportID ?? transaction.transactionThreadReportID;
            if (childReportID) {
                // The thread exists but may not be cached, so seed a shell or it renders as not-found.
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
                        personalDetails: personalDetailsList,
                    })?.reportID;
                }
            }
            return childReportID;
        },
        [betas, currentUserAccountID, currentUserEmail, introSelected, iouReport, personalDetailsList, policyID],
    );

    const navigateToExpense = useCallback(
        (childReportID: string) => {
            startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${childReportID}`, {
                name: 'MoneyRequestReportPreview.Transaction',
                op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
            });

            // Read once per press: the abort compares this exact array by reference.
            const openableTransactionIDs = (orderedTransactionsRef.current.length > 0 ? orderedTransactionsRef.current : transactions)
                .filter((pressedTransaction) => !isTransactionPendingDelete(pressedTransaction))
                .map((pressedTransaction) => pressedTransaction.transactionID);

            if (isSmallScreenWidth && iouReportID) {
                // Report first, expense on top, so back returns to the report and then the chat. The expense must stay
                // in the RHP: removeScreenByKey only filters the root navigator, so a nested thread could never be removed.
                const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute());
                Navigation.navigate(reportRoute);
                setActiveTransactionIDs(openableTransactionIDs).then(() => {
                    // Clearing is global, so only drop the IDs if they are still the ones this press wrote.
                    const release = () => {
                        if (getActiveTransactionIDs().ids !== openableTransactionIDs) {
                            return;
                        }
                        clearActiveTransactionIDs();
                    };
                    const timer = setTimeout(() => {
                        cascadeTimerRef.current = null;
                        if (!Navigation.isActiveRoute(reportRoute)) {
                            release();
                            return;
                        }
                        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: reportRoute}));
                    }, PRESSED_EXPENSE_CASCADE_DELAY);
                    cascadeTimerRef.current = {timer, release};
                });
                return;
            }

            if (isSmallScreenWidth) {
                setActiveTransactionIDs(openableTransactionIDs);
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: Navigation.getActiveRoute()}));
                return;
            }

            if (iouReportID) {
                const reportRoute = ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo: Navigation.getActiveRoute()});
                markReportRHPWidth(iouReportID, 'super-wide');
                Navigation.navigate(reportRoute);
                setActiveTransactionIDs(openableTransactionIDs).then(() => {
                    markReportRHPWidth(childReportID, 'wide');
                    // Drop the staged width hint, or the thread would open wide from an unrelated entry point.
                    // Clearing the IDs is global, so only drop them if they are still the ones this press wrote.
                    const release = () => {
                        unmarkReportRHPWidth(childReportID);
                        if (getActiveTransactionIDs().ids !== openableTransactionIDs) {
                            return;
                        }
                        clearActiveTransactionIDs();
                    };
                    const timer = setTimeout(() => {
                        cascadeTimerRef.current = null;
                        if (!Navigation.isActiveRoute(reportRoute)) {
                            release();
                            return;
                        }
                        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: reportRoute}));
                    }, PRESSED_EXPENSE_CASCADE_DELAY);
                    cascadeTimerRef.current = {timer, release};
                });
                return;
            }

            setActiveTransactionIDs(openableTransactionIDs).then(() => {
                markReportRHPWidth(childReportID, 'wide');
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: childReportID, backTo: Navigation.getActiveRoute()}));
            });
        },
        [isSmallScreenWidth, iouReportID, markReportRHPWidth, unmarkReportRHPWidth, transactions],
    );

    const openTransactionFromPreview = useCallback(
        (transaction: Transaction) => {
            if (contextMenuRef.current?.isContextMenuOpening) {
                return;
            }

            // A new press supersedes what an earlier one staged, or the older press hijacks this navigation.
            pendingExpenseTransactionRef.current = null;
            if (cascadeTimerRef.current) {
                clearTimeout(cascadeTimerRef.current.timer);
                cascadeTimerRef.current.release();
                cascadeTimerRef.current = null;
            }

            // A single-expense report opens the report itself, not the lone expense.
            if (transactions.length <= 1) {
                openReportFromPreview();
                return;
            }

            // An offline-deleted expense stays in the carousel but its thread is gone, so it would land on "It's not here".
            if (transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                openReportFromPreview();
                return;
            }

            const isIOUActionLoaded = !!getIOUActionForReportID(transaction.reportID, transaction.transactionID);
            const childReportID = resolveChildReportID(transaction);
            if (childReportID) {
                if (!isIOUActionLoaded && iouReportID) {
                    // The report's actions are absent. Offline the shell has no parent action to render; online, fetch them
                    // or the arrows mint dead threads.
                    if (isOffline) {
                        openReportFromPreview();
                        return;
                    }
                    openReport({reportID: iouReportID, introSelected, betas, currentUserAccountID, hasReportActions: !!iouReportActionCount});
                }
                navigateToExpense(childReportID);
                return;
            }

            // Fetch and open once it settles. Offline the fetch never lands, so fall through to the cached parent report.
            if (!isIOUActionLoaded && iouReportID && !isOffline) {
                pendingExpenseTransactionRef.current = {transaction, originRoute: Navigation.getActiveRoute()};
                openReport({reportID: iouReportID, introSelected, betas, currentUserAccountID, hasReportActions: !!iouReportActionCount});
                return;
            }

            openReportFromPreview();
        },
        [betas, currentUserAccountID, introSelected, iouReportActionCount, iouReportID, isOffline, navigateToExpense, openReportFromPreview, resolveChildReportID, transactions.length],
    );

    useEffect(() => {
        const pendingPress = pendingExpenseTransactionRef.current;
        if (!pendingPress || isLoadingInitialIOUReportActions) {
            return;
        }
        // The user chose something else while the fetch was in flight, so replaying would yank them out of it.
        if (!isFocused || Navigation.getActiveRoute() !== pendingPress.originRoute) {
            pendingExpenseTransactionRef.current = null;
            return;
        }
        const pendingTransaction = pendingPress.transaction;
        const childReportID = resolveChildReportID(pendingTransaction);
        if (childReportID) {
            pendingExpenseTransactionRef.current = null;
            navigateToExpense(childReportID);
            return;
        }
        // Settled with no thread, so open the parent. Must not depend on the action count, or an empty result leaves the tap dead.
        pendingExpenseTransactionRef.current = null;
        openReportFromPreview();
    }, [iouReportActionCount, isFocused, isLoadingInitialIOUReportActions, navigateToExpense, openReportFromPreview, resolveChildReportID]);

    // A pending cascade must not navigate after unmount, and its staged globals must be handed back.
    useEffect(
        () => () => {
            if (!cascadeTimerRef.current) {
                return;
            }
            clearTimeout(cascadeTimerRef.current.timer);
            cascadeTimerRef.current.release();
            cascadeTimerRef.current = null;
        },
        [],
    );

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
            transactionsWithReceipts={transactionsWithReceipts}
            hasNonReimbursableTransactions={hasNonReimbursableTransactions}
            areAllRequestsBeingSmartScanned={areAllRequestsBeingSmartScanned}
            policy={policy}
            invoiceReceiverPersonalDetail={invoiceReceiverPersonalDetail}
            invoiceReceiverPolicy={invoiceReceiverPolicy}
            lastTransactionViolations={lastTransactionViolations}
            renderTransactionItem={renderItem}
            onOrderedTransactionsChange={handleOrderedTransactionsChange}
            onCancelPendingPress={cancelPendingPress}
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
