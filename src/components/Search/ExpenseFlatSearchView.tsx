import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';

import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';

import CONST from '@src/CONST';
import type {CardList, Transaction} from '@src/types/onyx';

import type {ForwardedRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useImperativeHandle} from 'react';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from './types';

import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import BaseSearchList from './SearchList/BaseSearchList';
import TransactionListItem from './SearchList/ListItem/TransactionListItem';
import SearchListViewLayout from './SearchListViewLayout';

/** Imperative handle the router uses for highlight-driven scrolling (mirrors SearchList's handle). */
type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type ExpenseFlatSearchViewProps = {
    /** The flat-expense search query. */
    queryJSON: SearchQueryJSON;

    /** The sorted, optimistic-stabilized rows to render (from the router's useSearchSnapshot). */
    data: SearchListItem[];

    /** The columns to render in the list (fade-stabilized by the router). */
    columns: SearchColumnType[];

    /** Whether the list supports multi-select. */
    canSelectMultiple: boolean;

    /** Whether the action column uses its wider variant (a deleted transaction is present). */
    isActionColumnWide: boolean;

    /** Precomputed attendee-tracking boolean (derived from policy-for-moving-expenses). */
    isAttendeesEnabledForMovingPolicy?: boolean;

    /** Non-personal and workspace cards for row rendering (subscribed once by the router). */
    nonPersonalAndWorkspaceCards?: CardList;

    /** Whether mobile selection mode is on. */
    isMobileSelectionModeEnabled: boolean;

    /** The column header element for the flat table (undefined on narrow layouts). */
    SearchTableHeader?: React.JSX.Element;

    /** Whether a table header bar is shown above the list. */
    tableHeaderVisible: boolean;

    /** Whether every transaction has been loaded (gates the fully-checked select-all state). */
    hasLoadedAllTransactions?: boolean;

    /** Transactions flagged for the post-create highlight animation (feeds BaseSearchList extraData). */
    newTransactions: Transaction[];

    /** The navigation/thread-creation handler for a row tap (owned by the router). */
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;

    /** The list footer (pagination / pending-expense skeleton). */
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
        // Flat view always animates row exits, so the only gate is excluding the last row.
        const shouldApplyAnimation = index < data.length - 1;

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
