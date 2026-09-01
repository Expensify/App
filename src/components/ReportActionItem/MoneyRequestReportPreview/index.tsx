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

const reportActionCountSelector = (reportActions: OnyxEntry<ReportActions>) => Object.keys(reportActions ?? {}).length;

// The stagger between the report and the expense that design asked for: https://github.com/Expensify/App/pull/92546#issuecomment-4687440972
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
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
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
    const [iouReportActionCount] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(iouReportID)}`, {
        selector: reportActionCountSelector,
    });
    const [isLoadingInitialIOUReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${getNonEmptyStringOnyxID(iouReportID)}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    const pendingExpenseTransactionRef = useRef<{transaction: Transaction; originRoute: string} | null>(null);
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
    // Transactions arrive in batches and `useNewTransactions` would diff each batch as newly added expenses.
    // Withhold the list until every transaction the report claims has arrived.
    const expectedTransactionCount = iouReport?.transactionCount ?? 0;
    const isDeliveryComplete = allReportTransactions.length >= expectedTransactionCount;
    // Adding an expense raises `transactionCount` the moment it happens, before its transaction reaches Onyx.
    // That would briefly make the check above false again and discard the list we compare against, so once
    // every expected transaction has arrived we keep comparing from then on.
    const [hasCompletedDelivery, setHasCompletedDelivery] = useState(false);
    if (isDeliveryComplete && !hasCompletedDelivery) {
        setHasCompletedDelivery(true);
    }
    const transactionsForDiff = isDeliveryComplete || hasCompletedDelivery ? transactions : undefined;
    const newTransactions = useNewTransactions(hasOnceLoadedReportActions, transactionsForDiff, pendingNewTransactionIDs, chatReportID, isFocused);
    // Don't surface the highlight while the preview is covered — it'd animate the one-shot off-screen and be missed.
    const isReportVisible = shouldUseNarrowLayout ? isFocused : true;
    const newTransactionIDs = new Set(isReportVisible ? newTransactions.map((transaction) => transaction.transactionID) : []);

    const transactionPreviewContainerStyles = [styles.h100, reportPreviewStyles.transactionPreviewCarouselStyle];

    const resolveChildReportID = useCallback(
        (transaction: Transaction) => {
            const transactionIOUAction = getIOUActionForReportID(transaction.reportID, transaction.transactionID);
            let childReportID = transactionIOUAction?.childReportID ?? transaction.transactionThreadReportID;
            if (childReportID) {
                setOptimisticTransactionThread(childReportID, iouReport?.reportID ?? transaction.reportID, transactionIOUAction?.reportActionID, iouReport?.policyID ?? policyID);
            } else if (transactionIOUAction?.reportActionID) {
                const transactionID = isMoneyRequestAction(transactionIOUAction) ? getOriginalMessage(transactionIOUAction)?.IOUTransactionID : undefined;
                if (transactionID) {
                    childReportID = createTransactionThreadReport({
                        introSelected,
                        conciergeChat,
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
        [betas, conciergeChat, currentUserAccountID, currentUserEmail, introSelected, iouReport, personalDetailsList, policyID],
    );

    const navigateToExpense = useCallback(
        (childReportID: string) => {
            startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${childReportID}`, {
                name: 'MoneyRequestReportPreview.Transaction',
                op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
            });

            const openableTransactionIDs = (orderedTransactionsRef.current.length > 0 ? orderedTransactionsRef.current : transactions)
                .filter((pressedTransaction) => !isTransactionPendingDelete(pressedTransaction))
                .map((pressedTransaction) => pressedTransaction.transactionID);

            if (isSmallScreenWidth && iouReportID) {
                const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute());
                Navigation.navigate(reportRoute);
                const seeded = setActiveTransactionIDs(openableTransactionIDs);
                const release = () => {
                    seeded.then(() => {
                        if (getActiveTransactionIDs().ids !== openableTransactionIDs) {
                            return;
                        }
                        clearActiveTransactionIDs();
                    });
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
                const seeded = setActiveTransactionIDs(openableTransactionIDs);
                markReportRHPWidth(childReportID, 'wide');
                const release = () => {
                    unmarkReportRHPWidth(childReportID);
                    seeded.then(() => {
                        if (getActiveTransactionIDs().ids !== openableTransactionIDs) {
                            return;
                        }
                        clearActiveTransactionIDs();
                    });
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

            pendingExpenseTransactionRef.current = null;
            if (cascadeTimerRef.current) {
                clearTimeout(cascadeTimerRef.current.timer);
                cascadeTimerRef.current.release();
                cascadeTimerRef.current = null;
            }

            if (transactions.length <= 1) {
                openReportFromPreview();
                return;
            }

            if (transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                openReportFromPreview();
                return;
            }

            const isIOUActionLoaded = !!getIOUActionForReportID(transaction.reportID, transaction.transactionID);
            const childReportID = resolveChildReportID(transaction);
            if (childReportID) {
                if (!isIOUActionLoaded && iouReportID) {
                    if (isOffline) {
                        openReportFromPreview();
                        return;
                    }
                    openReport({reportID: iouReportID, introSelected, betas, currentUserAccountID, hasReportActions: !!iouReportActionCount});
                }
                navigateToExpense(childReportID);
                return;
            }

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
        pendingExpenseTransactionRef.current = null;
        openReportFromPreview();
    }, [iouReportActionCount, isFocused, isLoadingInitialIOUReportActions, navigateToExpense, openReportFromPreview, resolveChildReportID]);

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
