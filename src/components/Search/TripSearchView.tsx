import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';

import {isTripListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import type {NativeSyntheticEvent} from 'react-native';

import React from 'react';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {CommonSearchViewProps} from './searchViewProps';

import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import BaseSearchList from './SearchList/BaseSearchList';
import TripListItem from './SearchList/ListItem/TripListItem';
import SearchListViewLayout from './SearchListViewLayout';

type TripSearchViewProps = CommonSearchViewProps;

const keyExtractor = (item: SearchListItem, index: number) => item.keyForList ?? `${index}`;

const isRowDeleted = (item: SearchListItem) => item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

/**
 * The trip Search list, one row per trip room.
 *
 * Rendered by `<Search>` as a child of the selection providers, like the task list. Trip rows have no checkbox,
 * no exit animation and no long press, and tapping a row or its View action opens the trip room.
 */
function TripSearchView({
    queryJSON,
    data,
    columns,
    canSelectMultiple,
    isActionColumnWide,
    columnSizeOptions,
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
    onViewableItemsChanged,
    contentContainerStyle,
    containerStyle,
}: TripSearchViewProps) {
    const {type} = queryJSON;

    const {isOffline, isKeyboardShown, safeAreaPaddingBottomStyle, isLargeScreenWidth, toggleAll, selectedTransactions, listRef, modal, handleSelectRow, scrollToListIndex} =
        useSearchListViewState({data, isMobileSelectionModeEnabled, onSelectRow, shouldPreventLongPressRow: true});

    // Trips are a flat list, so visibility and selection counts are a single pass over the rows.
    const isItemVisible = (item: SearchListItem) => !isRowDeleted(item) || isOffline;
    const lastVisibleIndex = data.findLastIndex(isItemVisible);

    const selectedItemsLength = data.reduce((acc, item) => acc + (item.keyForList && selectedTransactions[item.keyForList]?.isSelected ? 1 : 0), 0);
    const totalItems = data.filter((item) => !isRowDeleted(item)).length;

    const renderItem = (item: SearchListItem, index: number, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => (
        // Trip rows never animate their exit (only grouped expenses do), so the wrapper just preserves the overflow clip.
        <AnimatedExitRow
            shouldApplyAnimation={false}
            hasItemsBeingRemoved={false}
        >
            {isTripListItemType(item) && (
                <TripListItem
                    showTooltip
                    onSelectRow={handleSelectRow}
                    item={item}
                    columns={columns}
                    isDisabled={isRowDeleted(item)}
                    onFocus={onFocus}
                    isLastItem={index === lastVisibleIndex && !ListFooterComponent}
                />
            )}
        </AnimatedExitRow>
    );

    const isSelectAllChecked = selectedItemsLength > 0 && selectedItemsLength === totalItems && hasLoadedAllTransactions;
    const selectAllButtonVisible = canSelectMultiple && !searchTableHeader;

    return (
        <SearchListViewLayout
            columns={columns}
            type={type}
            isActionColumnWide={isActionColumnWide}
            columnSizeOptions={columnSizeOptions}
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
                onViewableItemsChanged={onViewableItemsChanged}
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

export default TripSearchView;
