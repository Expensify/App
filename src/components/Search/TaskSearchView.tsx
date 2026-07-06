import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';

import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useImperativeHandle} from 'react';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from './types';

import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import BaseSearchList from './SearchList/BaseSearchList';
import TaskListItem from './SearchList/ListItem/TaskListItem';
import SearchListViewLayout from './SearchListViewLayout';

/** Imperative handle the router uses for highlight-driven scrolling (mirrors SearchList's handle). */
type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type TaskSearchViewProps = {
    /** The task search query. */
    queryJSON: SearchQueryJSON;

    /** The sorted rows to render (from the router's useSearchSnapshot). */
    data: SearchListItem[];

    /** The columns to render in the list (drives the table min-width and header). */
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

/**
 * The task Search list.
 *
 * Rendered by `<Search>` as a child of the selection providers. The shared list state and interactions come
 * from `useSearchListViewState`, and the surrounding chrome from `SearchListViewLayout`; this view only owns
 * the task specifics: the `TaskListItem` renderer and single-pass selection counts. Task rows have no column
 * data, no checkbox, and no exit animation (only grouped expenses animate), and long press is suppressed.
 */
function TaskSearchView({
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
}: TaskSearchViewProps) {
    const {type} = queryJSON;

    const {isOffline, isKeyboardShown, safeAreaPaddingBottomStyle, isLargeScreenWidth, toggleAll, selectedTransactions, listRef, onLongPressRow, modal, handleSelectRow, scrollToListIndex} =
        useSearchListViewState({data, isMobileSelectionModeEnabled, onSelectRow, shouldPreventLongPressRow: true});

    // Task is a flat list, so visibility and selection counts are a single pass over the rows.
    const isItemVisible = (item: SearchListItem) => !isRowDeleted(item) || isOffline;
    const lastVisibleIndex = data.findLastIndex(isItemVisible);

    const selectedItemsLength = data.reduce((acc, item) => acc + (item.keyForList && selectedTransactions[item.keyForList]?.isSelected ? 1 : 0), 0);
    const totalItems = data.filter((item) => !isRowDeleted(item)).length;

    // Flat data maps 1:1 to the rendered list, so highlight-scroll-to-index is the same as scroll-to-data-index.
    useImperativeHandle(ref, () => ({scrollToIndex: scrollToListIndex}), [scrollToListIndex]);

    const renderItem = (item: SearchListItem, index: number, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => (
        // Task rows never animate their exit (only grouped expenses do), so the wrapper just preserves the overflow clip.
        <AnimatedExitRow
            shouldApplyAnimation={false}
            hasItemsBeingRemoved={false}
        >
            <TaskListItem
                showTooltip
                isFocused={isItemFocused}
                onSelectRow={handleSelectRow}
                onLongPressRow={onLongPressRow}
                canSelectMultiple={canSelectMultiple}
                item={item}
                isDisabled={isRowDeleted(item)}
                onFocus={onFocus}
                keyForList={item.keyForList}
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

export default TaskSearchView;
