import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import type {NativeSyntheticEvent} from 'react-native';

import React, {useImperativeHandle} from 'react';

import type {SearchListItem} from './SearchList/ListItem/types';
import type CommonSearchViewProps from './searchViewProps';

import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import BaseSearchList from './SearchList/BaseSearchList';
import ChatListItem from './SearchList/ListItem/ChatListItem';
import SearchListViewLayout from './SearchListViewLayout';

type ChatSearchViewProps = CommonSearchViewProps;

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

export default ChatSearchView;
