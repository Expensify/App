import LinkButton from '@components/ButtonComposed/composed/LinkButton';
import type FlatListRefType from '@components/FlashList/types';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';

import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useHandleSelectionMode from '@hooks/useHandleSelectionMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {navigationRef} from '@libs/Navigation/Navigation';
import {getMoneyRequestSpendBreakdown, getReportOfflinePendingActionAndErrors, isExpenseReport, isIOUReport} from '@libs/ReportUtils';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import isReportOpenInSuperWideRHP from '@navigation/helpers/isReportOpenInSuperWideRHP';
import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {StableReport} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle, ViewToken} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import type {MoneyRequestReportTransactionLongPressModalHandle} from './MoneyRequestReportTransactionLongPressModal';
import type {TransactionListItemData} from './useMoneyRequestReportGroupedTransactions';

import MoneyRequestReportGroupByButton from './MoneyRequestReportGroupByButton';
import MoneyRequestReportGroupHeader from './MoneyRequestReportGroupHeader';
import MoneyRequestReportListFooter from './MoneyRequestReportListFooter';
import MoneyRequestReportTableHeaderRow from './MoneyRequestReportTableHeaderRow';
import MoneyRequestReportTotalSpend from './MoneyRequestReportTotalSpend';
import MoneyRequestReportTransactionItem from './MoneyRequestReportTransactionItem';
import MoneyRequestReportTransactionLongPressModal from './MoneyRequestReportTransactionLongPressModal';
import MoneyRequestReportUnifiedList from './MoneyRequestReportUnifiedList';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';
import useMoneyRequestReportActiveTransactionIDs from './useMoneyRequestReportActiveTransactionIDs';
import useMoneyRequestReportColumns from './useMoneyRequestReportColumns';
import useMoneyRequestReportGroupedTransactions from './useMoneyRequestReportGroupedTransactions';
import useMoneyRequestReportLayout from './useMoneyRequestReportLayout';
import useMoneyRequestReportSortedTransactions, {EMPTY_VIOLATIONS} from './useMoneyRequestReportSortedTransactions';

/**
 * Bundle of data + JSX nodes the parent needs to render the unified list around the transaction-list state.
 * Wide on purpose: this is the single integration point between TransactionList's internal state and the parent
 * FlatList that renders both transactions and report actions in one virtualized scroll. Splitting would just smear the
 * same locals across multiple call sites without earning an abstraction.
 */
type MoneyRequestReportTransactionListController = {
    /** Chrome rendered above the transaction items: group-by dropdown + columns button (or empty state). Always page-pinned. */
    beforeListContent: React.ReactElement;

    /** The sortable column-header row. Rendered inside the table's horizontal scroller so it tracks the columns; null on narrow layouts and empty reports. */
    tableColumnHeader: React.ReactElement | null;

    /** Flat array of items to render between beforeListContent and afterListContent. */
    transactionListItems: TransactionListItemData[];

    /** Render a single transaction-list item. */
    renderTransactionListItem: (item: TransactionListItemData, position: {isFirst: boolean; isLast: boolean}) => React.ReactElement | null;

    /** Chrome rendered below the transaction items (pending placeholder, Add Expense, breakdown, total). Null when there are no transactions. */
    afterListContent: React.ReactElement | null;

    /** True when the rendered table is wider than the viewport; the parent renders it via `ExternalScrollFlashListTable` with its own horizontal scroller. */
    shouldScrollHorizontally: boolean;

    /** Pixel width of the table at full column visibility — passed to the horizontal scroll wrapper as `contentWidth`. */
    tableMinWidth: number;

    /** True when this report has no transactions; the parent should still render report actions but skip the transactions section. */
    isEmptyTransactions: boolean;
};

type MoneyRequestReportTransactionListProps = {
    /** The money request report containing the transactions (stable projection — read-state churn like lastReadTime won't re-render this subtree) */
    report: StableReport;

    /** The workspace to which the report belongs */
    policy?: OnyxTypes.Policy;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** Whether there is a pending delete transaction */
    hasPendingDeletionTransaction?: boolean;

    /** List of transactions that arrived when the report was open */
    newTransactions: OnyxTypes.Transaction[];

    /** Whether the report table is visible — gates the new-row highlight (background on wide, on-close on narrow) */
    isReportVisible?: boolean;

    /** Array of report actions for the report that these transactions belong to */
    reportActions: OnyxTypes.ReportAction[];

    /** Whether the report that these transactions belong to has any chat comments */
    hasComments: boolean;

    /** Whether the report actions are being loaded, used to show 'Comments' during loading state */
    isLoadingInitialReportActions?: boolean;

    /** Callback executed on layout */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Reversed list of report actions to render below the transactions section in the unified list. */
    visibleReportActions: OnyxTypes.ReportAction[];

    /** Renders a single report action row in the unified list. */
    renderReportAction: (reportAction: OnyxTypes.ReportAction, indexWithinReportActions: number) => React.ReactElement;

    /** Values outside the list data that should trigger report action rows to update. */
    reportActionsExtraData: unknown;

    /** Report action ID the unified list should initially scroll to, when deep-linked. */
    linkedReportActionID: string | undefined;

    /** Ref forwarded to the underlying FlashList. */
    listRef: FlatListRefType;

    /** Reports the unified list's last item index so the parent can jump to the bottom via scrollToIndex. */
    onLastItemIndexChange?: (index: number) => void;

    /** Accessibility label for the unified list. */
    accessibilityLabel: string;

    /** FlashList onLayout callback (distinct from the empty-state `onLayout` above). */
    onListLayout: () => void;

    /** FlashList onScroll callback. */
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** FlashList onScrollBeginDrag callback. */
    onScrollBeginDrag: () => void;

    /** FlashList onContentSizeChange callback. */
    onContentSizeChange: () => void;

    /** FlashList onViewableItemsChanged callback. */
    onViewableItemsChanged: (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => void;

    /** FlashList onEndReached callback. */
    onEndReached: () => void;

    /** FlashList onStartReached callback. */
    onStartReached: () => void;

    /** FlashList contentContainerStyle. */
    contentContainerStyle: StyleProp<ViewStyle>;

    /** Whether the initial report actions are still loading. */
    isLoadingInitialActions: boolean;

    /** Rendered at the very bottom of the list, below all report actions (e.g. the Concierge thinking tail indicator). */
    listFooterComponent?: React.ReactElement;
};

function MoneyRequestReportTransactionList({
    report,
    transactions,
    newTransactions,
    isReportVisible = true,
    reportActions,
    hasPendingDeletionTransaction = false,
    policy,
    hasComments,
    onLayout,
    isLoadingInitialReportActions = false,
    visibleReportActions,
    renderReportAction,
    reportActionsExtraData,
    linkedReportActionID,
    listRef,
    onLastItemIndexChange,
    accessibilityLabel,
    onListLayout,
    onScroll,
    onScrollBeginDrag,
    onContentSizeChange,
    onViewableItemsChanged,
    onEndReached,
    onStartReached,
    contentContainerStyle,
    isLoadingInitialActions,
    listFooterComponent,
}: MoneyRequestReportTransactionListProps) {
    useCopySelectionHelper();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Columns']);
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const navigateToTransactionThread = useNavigateToTransactionThread();
    const longPressModalRef = useRef<MoneyRequestReportTransactionLongPressModalHandle>(null);
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);
    const {isOffline} = useNetwork();

    const {totalDisplaySpend} = getMoneyRequestSpendBreakdown(report);
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTagLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);

    const shouldShowGroupedTransactions = isExpenseReport(report) && !isIOUReport(report);

    const hasPendingAction = useMemo(() => {
        return hasPendingDeletionTransaction || transactions.some(getTransactionPendingAction);
    }, [hasPendingDeletionTransaction, transactions]);

    const {selectedTransactionIDs} = useSearchSelectionContext();
    const {setSelectedTransactions, clearSelectedTransactions} = useSearchSelectionActions();
    useHandleSelectionMode(selectedTransactionIDs);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    const toggleTransaction = useCallback(
        (transactionID: string) => {
            let newSelectedTransactionIDs = selectedTransactionIDs;
            if (selectedTransactionIDs.includes(transactionID)) {
                newSelectedTransactionIDs = selectedTransactionIDs.filter((t) => t !== transactionID);
            } else {
                newSelectedTransactionIDs = [...selectedTransactionIDs, transactionID];
            }
            setSelectedTransactions(newSelectedTransactionIDs);
        },
        [setSelectedTransactions, selectedTransactionIDs],
    );

    const isTransactionSelected = useCallback((transactionID: string) => selectedTransactionIDs.includes(transactionID), [selectedTransactionIDs]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                if (navigationRef?.getRootState()?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
                    return;
                }
                clearSelectedTransactions(true);
            };
        }, [clearSelectedTransactions]),
    );

    const reportID = report?.reportID;

    // Skeleton placeholder for super-wide RHP: shown while the deferred write is pending
    // and dismissed when the optimistic transaction appears. If the deferred write is delayed
    // (up to 5s safety timeout), the skeleton may linger - this is acceptable as a visual
    // hint that the expense is being processed. The transaction count comparison is a
    // heuristic; simultaneous add+remove is rare enough not to warrant a dedicated signal.
    const [showPendingExpensePlaceholder, setShowPendingExpensePlaceholder] = useState(false);
    const transactionCountWhenSkeletonShown = useRef<number | null>(null);

    const hasOptimisticNewTransaction = useMemo(() => transactions.some((t) => getTransactionPendingAction(t) === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD), [transactions]);

    useFocusEffect(
        useCallback(() => {
            if (!showPendingExpensePlaceholder) {
                const pending = getPendingSubmitFollowUpAction();
                const hasPendingSubmit =
                    pending?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY &&
                    pending?.reportID === reportID &&
                    isReportOpenInSuperWideRHP(navigationRef.getRootState());

                if (!hasPendingSubmit || hasOptimisticNewTransaction) {
                    return;
                }

                transactionCountWhenSkeletonShown.current = transactions.length;
                setShowPendingExpensePlaceholder(true);
                return;
            }

            if (!hasOptimisticNewTransaction && (transactionCountWhenSkeletonShown.current === null || transactions.length <= transactionCountWhenSkeletonShown.current)) {
                return;
            }

            transactionCountWhenSkeletonShown.current = null;
            setShowPendingExpensePlaceholder(false);
        }, [showPendingExpensePlaceholder, reportID, transactions.length, hasOptimisticNewTransaction]),
    );

    useEffect(() => {
        clearSelectedTransactions(true);
        // We don't want to run the effect on change of clearSelectedTransactions since it can cause an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);

    const {sortBy, sortOrder, onSortPress, sortedTransactions, resolvedTransactions, highlightedTransactionIDs, transactionThreadReportIDByTransactionID, violationsByTransactionID} =
        useMoneyRequestReportSortedTransactions({
            report,
            policy,
            transactions,
            reportActions,
            newTransactions,
            policyCategories,
            policyTagLists,
        });

    const {columnsToShow, dateColumnSize, postedColumnSize, amountColumnSize, taxAmountColumnSize, minTableWidth, shouldScrollHorizontally, isExpenseReportViewFromIOUReport} =
        useMoneyRequestReportColumns({report, policy, transactions, reportActions});

    const {currentSelection, currentGroupBy, shouldGroupTransactions, selectLayout} = useMoneyRequestReportLayout(shouldShowGroupedTransactions);

    const {groupedTransactions, listItems, visualOrderTransactionIDs, lastTransactionID} = useMoneyRequestReportGroupedTransactions({
        report,
        sortedTransactions,
        resolvedTransactions,
        currentGroupBy,
        shouldGroupTransactions,
        isOffline,
    });
    useMoneyRequestReportActiveTransactionIDs(visualOrderTransactionIDs);

    const groupSelectionState = useMemo(() => {
        const state = new Map<string, {isSelected: boolean; isIndeterminate: boolean; isDisabled: boolean; pendingAction?: PendingAction}>();

        for (const group of groupedTransactions) {
            const groupTransactionIDs = group.transactions.filter((t) => !isTransactionPendingDelete(t)).map((t) => t.transactionID);
            const groupPendingAction = group.transactions.some((t) => getTransactionPendingAction(t)) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined;

            if (groupTransactionIDs.length === 0) {
                state.set(group.groupKey, {isSelected: false, isIndeterminate: false, isDisabled: true, pendingAction: groupPendingAction});
                continue;
            }

            const selectedCount = groupTransactionIDs.filter((id) => selectedTransactionIDs.includes(id)).length;
            state.set(group.groupKey, {
                isSelected: selectedCount === groupTransactionIDs.length,
                isIndeterminate: selectedCount > 0 && selectedCount < groupTransactionIDs.length,
                isDisabled: false,
                pendingAction: groupPendingAction,
            });
        }

        return state;
    }, [groupedTransactions, selectedTransactionIDs]);

    const toggleGroupSelection = useCallback(
        (groupKey: string) => {
            const group = groupedTransactions.find((g) => g.groupKey === groupKey);
            if (!group) {
                return;
            }
            const groupTransactionIDs = group.transactions.filter((t) => !isTransactionPendingDelete(t)).map((t) => t.transactionID);
            const anySelected = groupTransactionIDs.some((id) => selectedTransactionIDs.includes(id));

            let newSelectedTransactionIDs = selectedTransactionIDs;
            if (anySelected) {
                newSelectedTransactionIDs = selectedTransactionIDs.filter((id) => !groupTransactionIDs.includes(id));
            } else {
                newSelectedTransactionIDs = [...selectedTransactionIDs, ...groupTransactionIDs];
            }
            setSelectedTransactions(newSelectedTransactionIDs);
        },
        [groupedTransactions, selectedTransactionIDs, setSelectedTransactions],
    );

    /**
     * Navigate to the transaction thread for a transaction, creating one optimistically if it doesn't yet exist.
     */
    const navigateToTransaction = useCallback(
        (activeTransactionID: string) => {
            navigateToTransactionThread({
                transactionID: activeTransactionID,
                reportActions,
                report,
                transaction: sortedTransactions.find((t) => t.transactionID === activeTransactionID),
                siblingTransactionIDs: visualOrderTransactionIDs,
            });
        },
        [navigateToTransactionThread, reportActions, sortedTransactions, report, visualOrderTransactionIDs],
    );

    const isEmptyTransactions = isEmpty(transactions);

    const handleLongPress = useCallback(
        (transactionID: string) => {
            if (!isSmallScreenWidth) {
                return;
            }
            if (isMobileSelectionModeEnabled) {
                toggleTransaction(transactionID);
                return;
            }
            longPressModalRef.current?.show(transactionID);
        },
        [isSmallScreenWidth, isMobileSelectionModeEnabled, toggleTransaction],
    );

    const handleOnPress = useCallback(
        (transactionID: string) => {
            if (isMobileSelectionModeEnabled) {
                toggleTransaction(transactionID);
                return;
            }

            navigateToTransaction(transactionID);
        },
        [isMobileSelectionModeEnabled, toggleTransaction, navigateToTransaction],
    );

    const handleArrowRightPress = useCallback(
        (transactionID: string) => {
            navigateToTransaction(transactionID);
        },
        [navigateToTransaction],
    );

    const openColumnsPage = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_SETTINGS_COLUMNS.getRoute(report.reportID));
    }, [report.reportID]);

    const renderTransactionListItem = (item: TransactionListItemData, position: {isFirst: boolean; isLast: boolean}) => {
        const narrowSectionWrapperStyle = shouldUseNarrowLayout
            ? [styles.highlightBG, position.isFirst && styles.tableTopRadius, position.isLast && styles.tableBottomRadius, (position.isFirst || position.isLast) && styles.overflowHidden]
            : undefined;

        if (item.type === 'section-header') {
            const selectionState = groupSelectionState.get(item.groupKey) ?? {
                isSelected: false,
                isIndeterminate: false,
                isDisabled: false,
                pendingAction: undefined,
            };
            return (
                <View style={styles.ph5}>
                    <View style={narrowSectionWrapperStyle}>
                        <MoneyRequestReportGroupHeader
                            group={item.group}
                            groupKey={item.groupKey}
                            currency={report?.currency ?? ''}
                            isGroupedByTag={currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.TAG}
                            isSelectionModeEnabled={isMobileSelectionModeEnabled}
                            isSelected={selectionState.isSelected}
                            isIndeterminate={selectionState.isIndeterminate}
                            isDisabled={selectionState.isDisabled}
                            onToggleSelection={toggleGroupSelection}
                            pendingAction={selectionState.pendingAction}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                    </View>
                </View>
            );
        }
        const transaction = item.transaction;
        return (
            <View style={styles.ph5}>
                <View style={narrowSectionWrapperStyle}>
                    <MoneyRequestReportTransactionItem
                        transaction={transaction}
                        violations={violationsByTransactionID.get(transaction.transactionID) ?? EMPTY_VIOLATIONS}
                        shouldBeHighlighted={isReportVisible && highlightedTransactionIDs.has(transaction.transactionID)}
                        columns={columnsToShow}
                        report={report}
                        policy={policy}
                        policyCategories={policyCategories}
                        policyTagLists={policyTagLists}
                        isSelectionModeEnabled={isMobileSelectionModeEnabled}
                        toggleTransaction={toggleTransaction}
                        isSelected={isTransactionSelected(transaction.transactionID)}
                        handleOnPress={handleOnPress}
                        handleLongPress={handleLongPress}
                        dateColumnSize={dateColumnSize}
                        postedColumnSize={postedColumnSize}
                        amountColumnSize={amountColumnSize}
                        taxAmountColumnSize={taxAmountColumnSize}
                        onArrowRightPress={handleArrowRightPress}
                        nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards ?? {}}
                        isLastItem={!showPendingExpensePlaceholder && transaction.transactionID === lastTransactionID}
                        shouldScrollHorizontally={shouldScrollHorizontally}
                        transactionThreadReportID={transactionThreadReportIDByTransactionID.get(transaction.transactionID)}
                    />
                </View>
            </View>
        );
    };

    const beforeListContent = isEmptyTransactions ? (
        <>
            <SearchMoneyRequestReportEmptyState
                onLayout={onLayout}
                report={report}
                policy={policy}
            />
            <MoneyRequestReportTotalSpend
                isEmptyTransactions={isEmptyTransactions}
                totalDisplaySpend={totalDisplaySpend}
                report={report}
                hasPendingAction={hasPendingAction}
                hasComments={hasComments}
                isLoadingReportActions={isLoadingInitialReportActions}
            />
        </>
    ) : (
        <View onLayout={onLayout}>
            <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.ph5, shouldUseNarrowLayout ? styles.pb3 : styles.pb2]}>
                {shouldShowGroupedTransactions && (
                    <MoneyRequestReportGroupByButton
                        currentSelection={currentSelection}
                        onSelect={selectLayout}
                    />
                )}
                {!shouldUseNarrowLayout && !isExpenseReportViewFromIOUReport && (
                    <LinkButton
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={openColumnsPage}
                    >
                        <LinkButton.Icon
                            src={expensifyIcons.Columns}
                            fill={theme.link}
                            hoverFill={theme.linkHover}
                        />
                        <LinkButton.Text style={[styles.textMicroBold]}>{translate('search.columns')}</LinkButton.Text>
                    </LinkButton>
                )}
            </View>
        </View>
    );

    // The column-header row is kept separate from beforeListContent so the horizontal-table layout can render it
    // inside the table's horizontal scroller (it must track the columns) while the group-by/columns controls above
    // stay pinned to the page. In the inline layout the two are rendered back-to-back, preserving the original order.
    const tableColumnHeader =
        isEmptyTransactions || shouldUseNarrowLayout ? null : (
            <MoneyRequestReportTableHeaderRow
                transactions={transactions}
                pendingAction={reportPendingAction}
                columns={columnsToShow}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortPress={onSortPress}
                dateColumnSize={dateColumnSize}
                postedColumnSize={postedColumnSize}
                amountColumnSize={amountColumnSize}
                taxAmountColumnSize={taxAmountColumnSize}
                shouldScrollHorizontally={shouldScrollHorizontally}
            />
        );

    const afterListContent = isEmptyTransactions ? null : (
        <MoneyRequestReportListFooter
            report={report}
            policy={policy}
            transactions={transactions}
            hasPendingAction={hasPendingAction}
            showPendingExpensePlaceholder={showPendingExpensePlaceholder}
        />
    );

    const controller: MoneyRequestReportTransactionListController = {
        beforeListContent,
        tableColumnHeader,
        transactionListItems: isEmptyTransactions ? [] : listItems,
        renderTransactionListItem,
        afterListContent,
        shouldScrollHorizontally,
        tableMinWidth: minTableWidth,
        isEmptyTransactions,
    };

    return (
        <>
            <MoneyRequestReportUnifiedList
                controller={controller}
                report={report}
                policy={policy}
                visibleReportActions={visibleReportActions}
                renderReportAction={renderReportAction}
                reportActionsExtraData={reportActionsExtraData}
                linkedReportActionID={linkedReportActionID}
                newTransactionID={isReportVisible ? newTransactions.at(0)?.transactionID : undefined}
                listRef={listRef}
                onLastItemIndexChange={onLastItemIndexChange}
                accessibilityLabel={accessibilityLabel}
                onLayout={onListLayout}
                onScroll={onScroll}
                onScrollBeginDrag={onScrollBeginDrag}
                onContentSizeChange={onContentSizeChange}
                onViewableItemsChanged={onViewableItemsChanged}
                onEndReached={onEndReached}
                onStartReached={onStartReached}
                contentContainerStyle={contentContainerStyle}
                isOffline={isOffline}
                isLoadingInitialActions={isLoadingInitialActions}
                listFooterComponent={listFooterComponent}
            />
            <MoneyRequestReportTransactionLongPressModal
                ref={longPressModalRef}
                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                toggleTransaction={toggleTransaction}
            />
        </>
    );
}

export default memo(MoneyRequestReportTransactionList);
export type {TransactionWithOptionalHighlight} from './useMoneyRequestReportSortedTransactions';
export type {TransactionListItemData} from './useMoneyRequestReportGroupedTransactions';
export type {MoneyRequestReportTransactionListController};
