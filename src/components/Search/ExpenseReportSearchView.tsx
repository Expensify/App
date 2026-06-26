import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';

import {isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import type {NativeSyntheticEvent} from 'react-native';

import React, {useImperativeHandle} from 'react';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {CommonSearchViewProps} from './searchViewProps';
import type {SelectedTransactions} from './types';

import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import BaseSearchList from './SearchList/BaseSearchList';
import ExpenseReportListItem from './SearchList/ListItem/ExpenseReportListItem';
import SearchListViewLayout from './SearchListViewLayout';

type ExpenseReportSearchViewProps = CommonSearchViewProps;

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
    newTransactions,
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
                newTransactions={newTransactions}
            />
            {modal}
        </SearchListViewLayout>
    );
}

export default ExpenseReportSearchView;
