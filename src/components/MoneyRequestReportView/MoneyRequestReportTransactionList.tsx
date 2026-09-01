import LinkButton from '@components/ButtonComposed/composed/LinkButton';
import type FlatListRefType from '@components/FlashList/types';

import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getMoneyRequestSpendBreakdown, getReportOfflinePendingActionAndErrors, isExpenseReport, isIOUReport} from '@libs/ReportUtils';
import {getTransactionPendingAction} from '@libs/TransactionUtils';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {StableReport} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle, ViewToken} from 'react-native';

import React, {useRef} from 'react';
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
import useMoneyRequestReportPendingExpense from './useMoneyRequestReportPendingExpense';
import useMoneyRequestReportSortedTransactions, {EMPTY_VIOLATIONS} from './useMoneyRequestReportSortedTransactions';
import useMoneyRequestReportTransactionSelection from './useMoneyRequestReportTransactionSelection';

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

/**
 * Renders the money-request report's transactions section and composes the unified list around it.
 * The data/behavior concerns live in dedicated hooks (`useMoneyRequestReportSortedTransactions` /
 * `useMoneyRequestReportGroupedTransactions` / `useMoneyRequestReportTransactionSelection` /
 * `useMoneyRequestReportLayout` / `useMoneyRequestReportColumns`) so React Compiler can memoize each
 * derivation chain; this component just wires their outputs into the controller the unified list renders.
 */
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
    const {isOffline} = useNetwork();
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTagLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);

    const reportID = report?.reportID;
    const showPendingExpensePlaceholder = useMoneyRequestReportPendingExpense(reportID, transactions);

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

    const shouldShowGroupedTransactions = isExpenseReport(report) && !isIOUReport(report);
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

    const {isMobileSelectionModeEnabled, toggleTransaction, isTransactionSelected, groupSelectionState, toggleGroupSelection} = useMoneyRequestReportTransactionSelection({
        reportID,
        groupedTransactions,
    });

    const {columnsToShow, dateColumnSize, postedColumnSize, amountColumnSize, taxAmountColumnSize, minTableWidth, shouldScrollHorizontally, isExpenseReportViewFromIOUReport} =
        useMoneyRequestReportColumns({report, policy, transactions, reportActions});

    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);
    const {totalDisplaySpend} = getMoneyRequestSpendBreakdown(report);
    const hasPendingAction = hasPendingDeletionTransaction || transactions.some(getTransactionPendingAction);
    // `.length === 0` instead of lodash isEmpty: the compiler must treat an external call as possibly
    // mutating its argument, which extends the array's mutable range and blocks memoization downstream.
    const isEmptyTransactions = transactions.length === 0;

    /**
     * Navigate to the transaction thread for a transaction, creating one optimistically if it doesn't yet exist.
     */
    const navigateToTransaction = (activeTransactionID: string) => {
        navigateToTransactionThread({
            transactionID: activeTransactionID,
            reportActions,
            report,
            transaction: sortedTransactions.find((t) => t.transactionID === activeTransactionID),
            siblingTransactionIDs: visualOrderTransactionIDs,
        });
    };

    const handleLongPress = (transactionID: string) => {
        if (!isSmallScreenWidth) {
            return;
        }
        if (isMobileSelectionModeEnabled) {
            toggleTransaction(transactionID);
            return;
        }
        longPressModalRef.current?.show(transactionID);
    };

    const handleOnPress = (transactionID: string) => {
        if (isMobileSelectionModeEnabled) {
            toggleTransaction(transactionID);
            return;
        }

        navigateToTransaction(transactionID);
    };

    const handleArrowRightPress = (transactionID: string) => {
        navigateToTransaction(transactionID);
    };

    const openColumnsPage = () => {
        Navigation.navigate(ROUTES.REPORT_SETTINGS_COLUMNS.getRoute(report.reportID));
    };

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

export default MoneyRequestReportTransactionList;
export type {TransactionWithOptionalHighlight} from './useMoneyRequestReportSortedTransactions';
export type {TransactionListItemData} from './useMoneyRequestReportGroupedTransactions';
export type {MoneyRequestReportTransactionListController};
