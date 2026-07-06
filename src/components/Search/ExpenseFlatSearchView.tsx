import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';
import type {CardList} from '@src/types/onyx';

import type {NativeSyntheticEvent} from 'react-native';

import React, {useImperativeHandle} from 'react';

import type {SearchListItem} from './SearchList/ListItem/types';
import type CommonSearchViewProps from './searchViewProps';

import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import BaseSearchList from './SearchList/BaseSearchList';
import TransactionListItem from './SearchList/ListItem/TransactionListItem';
import SearchListViewLayout from './SearchListViewLayout';

type ExpenseFlatSearchViewProps = CommonSearchViewProps & {isAttendeesEnabledForMovingPolicy?: boolean; nonPersonalAndWorkspaceCards?: CardList};

const keyExtractor = (item: SearchListItem, index: number) => item.keyForList ?? `${index}`;

const isRowDeleted = (item: SearchListItem) => item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

/**
 * The flat-expense Search list.
 *
 * Rendered by `<Search>` as a child of the selection providers (so it reads the real
 * `toggle`/`toggleAll`/`selectedTransactions`). The shared list state and interactions come from
 * `useSearchListViewState`, and the surrounding chrome (horizontal scroll, header bar, long-press menu)
 * from `SearchListViewLayout`; this view only owns the flat-expense specifics: the `TransactionListItem`
 * renderer, single-pass visibility/selection counts, and the highlight-scroll imperative handle.
 * `TransactionListItem` is the only row renderer here and rows always animate, so the
 * group/sticky/chat/task branches of `SearchList` do not apply. Keyboard navigation is inherited from
 * `BaseSearchList`; the post-create highlight stays in the router (the snapshot stamps
 * `shouldAnimateInHighlight`, and `newTransactions` flows into `extraData`).
 */
function ExpenseFlatSearchView({
    queryJSON,
    data,
    columns,
    canSelectMultiple,
    isActionColumnWide,
    isAttendeesEnabledForMovingPolicy,
    nonPersonalAndWorkspaceCards,
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
}: ExpenseFlatSearchViewProps) {
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
        hasItemsBeingRemoved,
        lastPaymentMethod,
        personalPolicyID,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        handleUndelete,
        onLongPressRow,
        modal,
        handleSelectRow,
        scrollToListIndex,
    } = useSearchListViewState({data, isMobileSelectionModeEnabled, onSelectRow, shouldPreventLongPressRow: false});

    // Flat lists have no group children to skip, so visibility is computed straight off the rendered rows.
    const isItemVisible = (item: SearchListItem) => !isRowDeleted(item) || isOffline;
    const firstVisibleIndex = data.findIndex(isItemVisible);
    const lastVisibleIndex = data.findLastIndex(isItemVisible);

    // Flat-expense selection counts: no empty groups, no group flattening — a single pass over the rows.
    const selectedItemsLength = data.reduce((acc, item) => acc + (item.keyForList && selectedTransactions[item.keyForList]?.isSelected ? 1 : 0), 0);
    const totalItems = data.filter((item) => !isRowDeleted(item)).length;

    // Flat data maps 1:1 to the rendered list, so highlight-scroll-to-index is the same as scroll-to-data-index.
    useImperativeHandle(ref, () => ({scrollToIndex: scrollToListIndex}), [scrollToListIndex]);

    const renderItem = (item: SearchListItem, index: number, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => {
        const isDisabled = isRowDeleted(item);
        // Only expense row exits animate; invoice and trip transaction lists do not (matches the legacy per-type gate).
        const shouldApplyAnimation = type === CONST.SEARCH.DATA_TYPES.EXPENSE && index < data.length - 1;

        return (
            <AnimatedExitRow
                shouldApplyAnimation={shouldApplyAnimation}
                hasItemsBeingRemoved={hasItemsBeingRemoved}
            >
                <TransactionListItem
                    showTooltip
                    isFocused={isItemFocused}
                    onSelectRow={handleSelectRow}
                    onLongPressRow={onLongPressRow}
                    onSelectionButtonPress={toggle}
                    canSelectMultiple={canSelectMultiple}
                    item={item}
                    columns={columns}
                    isDisabled={isDisabled}
                    lastPaymentMethod={lastPaymentMethod}
                    personalPolicyID={personalPolicyID}
                    userBillingGracePeriodEnds={userBillingGracePeriodEnds}
                    ownerBillingGracePeriodEnd={ownerBillingGracePeriodEnd}
                    nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                    onFocus={onFocus}
                    onUndelete={handleUndelete}
                    keyForList={item.keyForList}
                    isFirstItem={index === firstVisibleIndex}
                    isLastItem={index === lastVisibleIndex && !ListFooterComponent}
                />
            </AnimatedExitRow>
        );
    };

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
                isAttendeesEnabledForMovingPolicy={isAttendeesEnabledForMovingPolicy}
                nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
            />
            {modal}
        </SearchListViewLayout>
    );
}

ExpenseFlatSearchView.displayName = 'ExpenseFlatSearchView';

export default ExpenseFlatSearchView;
