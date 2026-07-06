import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';

import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useImperativeHandle} from 'react';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON, SelectedTransactions} from './types';

import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import BaseSearchList from './SearchList/BaseSearchList';
import ExpenseReportListItem from './SearchList/ListItem/ExpenseReportListItem';
import SearchListViewLayout from './SearchListViewLayout';

/** Imperative handle the router uses for highlight-driven scrolling (mirrors SearchList's handle). */
type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type ExpenseReportSearchViewProps = {
    /** The expense-report search query. */
    queryJSON: SearchQueryJSON;

    /** The sorted report rows to render (from the router's useSearchSnapshot). */
    data: SearchListItem[];

    /** The columns to render in the list. */
    columns: SearchColumnType[];

    /** Whether the list supports multi-select. */
    canSelectMultiple: boolean;

    /** Whether the action column uses its wider variant. */
    isActionColumnWide: boolean;

    /** Whether mobile selection mode is on. */
    isMobileSelectionModeEnabled: boolean;

    /** The column header element (undefined on narrow layouts). */
    SearchTableHeader?: React.JSX.Element;

    /** Whether a table header bar is shown above the list. */
    tableHeaderVisible: boolean;

    /** Whether everything has been loaded (gates the fully-checked select-all state). */
    hasLoadedAllTransactions?: boolean;

    /** The navigation handler for a row tap (owned by the router). */
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;

    /** The list footer (pagination / pending skeleton). */
    ListFooterComponent?: React.JSX.Element;

    /** Fires when the list scrolls near its end (router's fetchMoreResults). */
    onEndReached: () => void;

    /** Fires on the list's first layout and on layout changes. */
    onLayout: () => void;

    /** Scroll handler forwarded to the list. */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Content container style for the list. */
    contentContainerStyle: StyleProp<ViewStyle>;

    /** Outer container style for the list wrapper. */
    containerStyle: StyleProp<ViewStyle>;

    /** Imperative handle for highlight-driven scrolling, set by the router. */
    ref?: ForwardedRef<SearchListHandle>;
};

const keyExtractor = (item: SearchListItem, index: number) => item.keyForList ?? `${index}`;

const isRowDeleted = (item: SearchListItem) => item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

const isRowSelected = (key: string | undefined, selectedTransactions: SelectedTransactions) => !!(key && selectedTransactions[key]?.isSelected);

/**
 * The expense-report Search list (the report view, no group-by).
 *
 * Rendered by `<Search>` as a child of the selection providers. The shared list state and interactions come
 * from `useSearchListViewState`, and the surrounding chrome from `SearchListViewLayout`; this view owns the
 * report specifics: the `ExpenseReportListItem` renderer and report-aware selection counts (selection is
 * tracked at the child-transaction level plus empty reports, so the counts flatten each report's
 * transactions rather than counting the report rows). Report rows do not animate their exit (only grouped
 * expenses do).
 */
function ExpenseReportSearchView({
    queryJSON,
    data,
    columns,
    canSelectMultiple,
    isActionColumnWide,
    isMobileSelectionModeEnabled,
    SearchTableHeader: searchTableHeader,
    tableHeaderVisible,
    hasLoadedAllTransactions,
    onSelectRow,
    ListFooterComponent,
    onEndReached,
    onLayout,
    onScroll,
    contentContainerStyle,
    containerStyle,
    ref,
}: ExpenseReportSearchViewProps) {
    const {type} = queryJSON;

    const {
        isOffline,
        isKeyboardShown,
        safeAreaPaddingBottomStyle,
        isLargeScreenWidth,
        toggle,
        toggleAll,
        selectedTransactions,
        listRef,
        lastPaymentMethod,
        personalPolicyID,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        onLongPressRow,
        modal,
        handleSelectRow,
        scrollToListIndex,
    } = useSearchListViewState({data, isMobileSelectionModeEnabled, onSelectRow, shouldPreventLongPressRow: false});

    // Report rows render 1:1 (no group splitting), so visibility is computed straight off the rows.
    const isItemVisible = (item: SearchListItem) => !isRowDeleted(item) || isOffline;
    const firstVisibleIndex = data.findIndex(isItemVisible);
    const lastVisibleIndex = data.findLastIndex(isItemVisible);

    // Selection is tracked per child transaction (plus empty reports), so flatten each report's transactions.
    const reportItems = data.filter(isTransactionReportGroupListItemType);
    const flattenedTransactions = reportItems.flatMap((item) => item.transactions);
    const emptyReports = reportItems.filter((item) => item.transactions.length === 0 && !!item.keyForList);
    const selectedItemsLength =
        flattenedTransactions.reduce((acc, item) => acc + (isRowSelected(item.keyForList, selectedTransactions) ? 1 : 0), 0) +
        emptyReports.reduce((acc, item) => acc + (isRowSelected(item.keyForList, selectedTransactions) ? 1 : 0), 0);
    const totalItems = flattenedTransactions.filter((item) => !isRowDeleted(item)).length + emptyReports.filter((item) => !isRowDeleted(item)).length;

    // Report data maps 1:1 to the rendered list, so highlight-scroll-to-index is the same as scroll-to-data-index.
    useImperativeHandle(ref, () => ({scrollToIndex: scrollToListIndex}), [scrollToListIndex]);

    const renderItem = (item: SearchListItem, index: number, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => (
        // Report rows never animate their exit (only grouped expenses do), so the wrapper just preserves the overflow clip.
        <AnimatedExitRow
            shouldApplyAnimation={false}
            hasItemsBeingRemoved={false}
        >
            <ExpenseReportListItem
                showTooltip
                isFocused={isItemFocused}
                onSelectRow={handleSelectRow}
                onLongPressRow={onLongPressRow}
                onSelectionButtonPress={toggle}
                canSelectMultiple={canSelectMultiple}
                item={item}
                columns={columns}
                isDisabled={isRowDeleted(item)}
                lastPaymentMethod={lastPaymentMethod}
                personalPolicyID={personalPolicyID}
                userBillingGracePeriodEnds={userBillingGracePeriodEnds}
                ownerBillingGracePeriodEnd={ownerBillingGracePeriodEnd}
                onFocus={onFocus}
                keyForList={item.keyForList}
                isFirstItem={index === firstVisibleIndex}
                isLastItem={index === lastVisibleIndex && !ListFooterComponent}
            />
        </AnimatedExitRow>
    );

    const isSelectAllChecked = selectedItemsLength > 0 && selectedItemsLength === totalItems && hasLoadedAllTransactions;
    const selectAllButtonVisible = canSelectMultiple && !searchTableHeader;

    return (
        <SearchListViewLayout
            columns={columns}
            type={type}
            isActionColumnWide={isActionColumnWide}
            isHeaderVisible={!!searchTableHeader}
            dataKey={data}
            isKeyboardShown={isKeyboardShown}
            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
            containerStyle={containerStyle}
        >
            {tableHeaderVisible && (
                <SelectionTopBar
                    isLargeScreenWidth={isLargeScreenWidth}
                    shouldSplitGroups={false}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    selectedItemsLength={selectedItemsLength}
                    totalItems={totalItems}
                    hasLoadedAllTransactions={hasLoadedAllTransactions}
                    selectAllButtonVisible={selectAllButtonVisible}
                    onAllCheckboxPress={toggleAll}
                    SearchTableHeader={searchTableHeader}
                />
            )}
            <BaseSearchList
                data={data}
                renderItem={renderItem}
                onSelectRow={handleSelectRow}
                keyExtractor={keyExtractor}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
                ref={listRef}
                columns={columns}
                scrollToIndex={scrollToListIndex}
                flattenedItemsLength={data.length}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.75}
                ListFooterComponent={ListFooterComponent}
                onLayout={onLayout}
                contentContainerStyle={contentContainerStyle}
            />
            {modal}
        </SearchListViewLayout>
    );
}

export default ExpenseReportSearchView;
