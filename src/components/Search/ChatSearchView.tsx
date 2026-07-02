import React, {useImperativeHandle} from 'react';
import type {ForwardedRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';
import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import BaseSearchList from './SearchList/BaseSearchList';
import ChatListItem from './SearchList/ListItem/ChatListItem';
import type {SearchListItem} from './SearchList/ListItem/types';
import SearchListViewLayout from './SearchListViewLayout';
import type {SearchColumnType, SearchQueryJSON} from './types';

/** Imperative handle the router uses for highlight-driven scrolling (mirrors SearchList's handle). */
type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type ChatSearchViewProps = {
    /** The chat search query. */
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

    /** Rows flagged for the post-create highlight animation (feeds BaseSearchList extraData). */
    newTransactions: Transaction[];

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
 * The chat Search list.
 *
 * Rendered by `<Search>` as a child of the selection providers. The shared list state and interactions come
 * from `useSearchListViewState`, and the surrounding chrome from `SearchListViewLayout`; this view only owns
 * the chat specifics: the `ChatListItem` renderer and single-pass selection counts. Chat rows have no
 * column data, no checkbox, and no exit animation (only grouped expenses animate), and long press is
 * suppressed, so this is the leanest of the Search views.
 */
function ChatSearchView({
    queryJSON,
    data,
    columns,
    canSelectMultiple,
    isActionColumnWide,
    isMobileSelectionModeEnabled,
    SearchTableHeader: searchTableHeader,
    tableHeaderVisible,
    hasLoadedAllTransactions,
    newTransactions,
    onSelectRow,
    ListFooterComponent,
    onEndReached,
    onLayout,
    onScroll,
    contentContainerStyle,
    containerStyle,
    ref,
}: ChatSearchViewProps) {
    const {type} = queryJSON;

    const {isKeyboardShown, safeAreaPaddingBottomStyle, isLargeScreenWidth, toggleAll, selectedTransactions, listRef, onLongPressRow, modal, handleSelectRow, scrollToListIndex} =
        useSearchListViewState({
            data,
            isMobileSelectionModeEnabled,
            onSelectRow,
            shouldPreventLongPressRow: true,
        });

    // Chat is a flat list: no group children, no empty groups, so selection counts are a single pass.
    const selectedItemsLength = data.reduce((acc, item) => acc + (item.keyForList && selectedTransactions[item.keyForList]?.isSelected ? 1 : 0), 0);
    const totalItems = data.filter((item) => !isRowDeleted(item)).length;

    // Flat data maps 1:1 to the rendered list, so highlight-scroll-to-index is the same as scroll-to-data-index.
    useImperativeHandle(ref, () => ({scrollToIndex: scrollToListIndex}), [scrollToListIndex]);

    const renderItem = (item: SearchListItem, index: number, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => (
        // Chat rows never animate their exit (only grouped expenses do), so the wrapper just preserves the overflow clip.
        <AnimatedExitRow
            shouldApplyAnimation={false}
            hasItemsBeingRemoved={false}
        >
            <ChatListItem
                showTooltip
                isFocused={isItemFocused}
                onSelectRow={handleSelectRow}
                onLongPressRow={onLongPressRow}
                canSelectMultiple={canSelectMultiple}
                item={item}
                isDisabled={isRowDeleted(item)}
                onFocus={onFocus}
                keyForList={item.keyForList}
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
                newTransactions={newTransactions}
            />
            {modal}
        </SearchListViewLayout>
    );
}

ChatSearchView.displayName = 'ChatSearchView';

export default ChatSearchView;
