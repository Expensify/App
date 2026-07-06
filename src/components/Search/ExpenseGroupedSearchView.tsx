import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type {TransactionPreviewData} from '@libs/actions/Search';
import getPlatform from '@libs/getPlatform';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {isTransactionGroupListItemType, splitGroupsIntoPairs} from '@libs/SearchUIUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {CardList, Transaction} from '@src/types/onyx';

import type {ForwardedRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useImperativeHandle, useState} from 'react';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON, SelectedTransactions} from './types';

import useSearchListViewState from './hooks/useSearchListViewState';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import SelectionTopBar from './primitives/SelectionTopBar';
import {isTransactionMatchWithGroupItem} from './SearchList';
import BaseSearchList from './SearchList/BaseSearchList';
import GroupChildrenContainer from './SearchList/ListItem/GroupChildrenContainer';
import GroupHeader from './SearchList/ListItem/GroupHeader';
import TransactionGroupListItem from './SearchList/ListItem/TransactionGroupListItem';
import {isGroupChildrenContainerItem, isGroupHeaderItem} from './SearchList/ListItem/types';
import SearchListViewLayout from './SearchListViewLayout';

/** Imperative handle the router uses for highlight-driven scrolling (mirrors SearchList's handle). */
type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type ExpenseGroupedSearchViewProps = {
    /** The grouped-expense search query (a valid groupBy is set). */
    queryJSON: SearchQueryJSON;

    /** The sorted group rows to render (from the router's useSearchSnapshot). */
    data: SearchListItem[];

    /** The columns to render in the list. */
    columns: SearchColumnType[];

    /** Whether the list supports multi-select. */
    canSelectMultiple: boolean;

    /** Whether the action column uses its wider variant. */
    isActionColumnWide: boolean;

    /** Precomputed attendee-tracking boolean (derived from policy-for-moving-expenses). */
    isAttendeesEnabledForMovingPolicy?: boolean;

    /** Non-personal and workspace cards for row rendering (subscribed once by the router). */
    nonPersonalAndWorkspaceCards?: CardList;

    /** Whether mobile selection mode is on. */
    isMobileSelectionModeEnabled: boolean;

    /** The column header element (undefined on narrow layouts). */
    SearchTableHeader?: React.JSX.Element;

    /** Whether a table header bar is shown above the list. */
    tableHeaderVisible: boolean;

    /** Whether everything has been loaded (gates the fully-checked select-all state). */
    hasLoadedAllTransactions?: boolean;

    /** Transactions flagged for the post-create highlight animation. */
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

const isRowSelected = (key: string | undefined, selectedTransactions: SelectedTransactions) => !!(key && selectedTransactions[key]?.isSelected);

/**
 * On wide web layouts each group is split into a sticky header row plus a children-container row, so the
 * rendered list differs from the source data. Returns the rendered list plus the sticky-header and
 * children-container indices FlashList needs. On narrow/native layouts the group rows render as-is.
 */
function buildSplitGroupData(data: SearchListItem[], shouldSplitGroups: boolean) {
    if (!shouldSplitGroups) {
        return {listData: data, stickyHeaderIndices: undefined, childrenContainerIndices: CONST.EMPTY_ARRAY as readonly number[]};
    }

    const {splitData, stickyHeaderIndices} = splitGroupsIntoPairs(data);
    const childrenContainerIndices: number[] = [];
    for (let i = 0; i < splitData.length; i++) {
        const item = splitData.at(i);
        if (item && isGroupChildrenContainerItem(item)) {
            childrenContainerIndices.push(i);
        }
    }

    return {
        listData: splitData,
        stickyHeaderIndices: stickyHeaderIndices.length > 0 ? stickyHeaderIndices : undefined,
        childrenContainerIndices,
    };
}

/** Maps each group's `keyForList` to the id of a just-created transaction inside it, for the highlight animation. */
function buildNewTransactionIDMap(data: SearchListItem[], newTransactions: Transaction[], groupBy: SearchQueryJSON['groupBy']) {
    const map = new Map<string, string>();
    if (newTransactions.length === 0) {
        return map;
    }
    for (const item of data) {
        const matchedTransactionID = newTransactions.find((transaction) => isTransactionMatchWithGroupItem(transaction, item, groupBy))?.transactionID;
        if (matchedTransactionID && item.keyForList) {
            map.set(item.keyForList, matchedTransactionID);
        }
    }
    return map;
}

/**
 * The grouped-expense Search list (expense search with a valid group-by).
 *
 * Rendered by `<Search>` as a child of the selection providers. Shared list state and interactions come from
 * `useSearchListViewState`, and the surrounding chrome from `SearchListViewLayout`. This view owns the group
 * machinery: on wide web it splits each group into a sticky `GroupHeader` plus an expandable
 * `GroupChildrenContainer` (`shouldSplitGroups`); otherwise each group renders through `TransactionGroupListItem`.
 * Selection counts are report-aware (flattened over child transactions plus empty groups), and the scroll
 * handle remaps the router's data index to the split-list index.
 */
function ExpenseGroupedSearchView({
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
}: ExpenseGroupedSearchViewProps) {
    const {type, groupBy} = queryJSON;
    const {isLargeScreenWidth} = useResponsiveLayout();

    // Wide web layouts split each group into a sticky header row plus an expandable children-container row.
    // Computed here (not from the shared hook) because the split list feeds back into the hook as `listData`.
    const shouldSplit = !!groupBy && isLargeScreenWidth && getPlatform() === CONST.PLATFORM.WEB;
    const {listData, stickyHeaderIndices, childrenContainerIndices} = buildSplitGroupData(data, shouldSplit);

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
    const onToggleGroup = (key: string) =>
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });

    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const {
        isOffline,
        isKeyboardShown,
        safeAreaPaddingBottomStyle,
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
    } = useSearchListViewState({data, listData, isMobileSelectionModeEnabled, onSelectRow});

    const newTransactionIDByItemKey = buildNewTransactionIDMap(data, newTransactions, groupBy);

    // Selection is tracked per child transaction (plus empty groups), so flatten each group's transactions.
    const groupItems = data.filter(isTransactionGroupListItemType);
    const flattenedTransactions = groupItems.flatMap((item) => item.transactions);
    const emptyReports = groupItems.filter((item) => item.transactions.length === 0 && !!item.keyForList);
    const selectedItemsLength =
        flattenedTransactions.reduce((acc, item) => acc + (isRowSelected(item.keyForList, selectedTransactions) ? 1 : 0), 0) +
        emptyReports.reduce((acc, item) => acc + (isRowSelected(item.keyForList, selectedTransactions) ? 1 : 0), 0);
    const totalItems = flattenedTransactions.filter((item) => !isRowDeleted(item)).length + emptyReports.filter((item) => !isRowDeleted(item)).length;

    // Visibility is computed over the rendered (possibly split) list.
    const isItemVisible = (item: SearchListItem) => !isRowDeleted(item) || isOffline;
    const firstVisibleIndex = listData.findIndex(isItemVisible);
    const lastVisibleIndex = listData.findLastIndex(isItemVisible);

    // The router highlights by source-data index; remap it to the split-list index before scrolling.
    useImperativeHandle(
        ref,
        () => ({
            scrollToIndex: (index: number, animated = true) => {
                if (!shouldSplit) {
                    scrollToListIndex(index, animated);
                    return;
                }
                const item = data.at(index);
                const splitIndex = item?.keyForList ? listData.findIndex((listItem) => listItem.keyForList === `header_${item.keyForList}`) : -1;
                scrollToListIndex(splitIndex !== -1 ? splitIndex : index, animated);
            },
        }),
        [data, listData, shouldSplit, scrollToListIndex],
    );

    const getItemType = (item: SearchListItem) => {
        if (!shouldSplit) {
            return undefined;
        }
        if (isGroupHeaderItem(item) || isGroupChildrenContainerItem(item)) {
            return item.listItemType;
        }
        return 'default';
    };

    const overrideItemLayout = (layout: {size?: number; span?: number}, item: SearchListItem) => {
        if (!isGroupHeaderItem(item)) {
            return;
        }
        // FlashList requires mutating the layout object passed to overrideItemLayout.
        // eslint-disable-next-line no-param-reassign -- FlashList overrideItemLayout API
        layout.size = variables.tableRowHeight;
    };

    const stickyHeaderConfig = shouldSplit ? {hideRelatedCell: true, useNativeDriver: true, zIndex: 2} : undefined;

    const renderItem = (item: SearchListItem, index: number, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => {
        if (isGroupHeaderItem(item)) {
            const originalKey = item.groupKeyForList;
            return (
                <GroupHeader
                    item={item}
                    groupBy={groupBy}
                    searchType={type}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isExpanded={expandedGroups.has(originalKey)}
                    onToggle={() => onToggleGroup(originalKey)}
                    onSelectRow={handleSelectRow}
                    onCheckboxPress={toggle}
                    onLongPressRow={onLongPressRow}
                    onFocus={onFocus}
                    isFocused={isItemFocused}
                    isFirstItem={index === firstVisibleIndex}
                    isLastItem={false}
                    originalKey={originalKey}
                    lastPaymentMethod={lastPaymentMethod}
                    personalPolicyID={personalPolicyID}
                    userBillingGracePeriodEnds={userBillingGracePeriodEnds}
                    ownerBillingGracePeriodEnd={ownerBillingGracePeriodEnd}
                    visibleColumns={visibleColumns}
                />
            );
        }

        if (isGroupChildrenContainerItem(item)) {
            const originalKey = item.groupKeyForList;
            const containerNewTransactionID = item.keyForList ? newTransactionIDByItemKey.get(originalKey) : undefined;
            return (
                <GroupChildrenContainer
                    item={item}
                    isExpanded={expandedGroups.has(originalKey)}
                    groupBy={groupBy}
                    searchType={type}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    onSelectRow={handleSelectRow}
                    onCheckboxPress={toggle}
                    onLongPressRow={onLongPressRow}
                    nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                    onUndelete={handleUndelete}
                    isLastItem={index === lastVisibleIndex && !ListFooterComponent}
                    newTransactionID={containerNewTransactionID}
                    bankAccountList={bankAccountList}
                    cardFeeds={cardFeeds}
                    conciergeReportID={conciergeReportID}
                />
            );
        }

        // Non-split group rows: TransactionGroupListItem renders the whole group (header + children).
        const newTransactionID = item.keyForList ? newTransactionIDByItemKey.get(item.keyForList) : undefined;
        return (
            <AnimatedExitRow
                shouldApplyAnimation={index < listData.length - 1}
                hasItemsBeingRemoved={hasItemsBeingRemoved}
            >
                <TransactionGroupListItem
                    showTooltip
                    isFocused={isItemFocused}
                    onSelectRow={handleSelectRow}
                    onLongPressRow={onLongPressRow}
                    onSelectionButtonPress={toggle}
                    canSelectMultiple={canSelectMultiple}
                    item={item}
                    columns={columns}
                    isDisabled={isRowDeleted(item)}
                    groupBy={groupBy}
                    searchType={type}
                    lastPaymentMethod={lastPaymentMethod}
                    personalPolicyID={personalPolicyID}
                    userBillingGracePeriodEnds={userBillingGracePeriodEnds}
                    ownerBillingGracePeriodEnd={ownerBillingGracePeriodEnd}
                    nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                    onFocus={onFocus}
                    newTransactionID={newTransactionID}
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
                    shouldSplitGroups={shouldSplit}
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
                data={listData}
                renderItem={renderItem}
                onSelectRow={handleSelectRow}
                keyExtractor={keyExtractor}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
                ref={listRef}
                columns={columns}
                scrollToIndex={scrollToListIndex}
                flattenedItemsLength={listData.length}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.75}
                ListFooterComponent={ListFooterComponent}
                onLayout={onLayout}
                contentContainerStyle={contentContainerStyle}
                newTransactions={newTransactions}
                isAttendeesEnabledForMovingPolicy={isAttendeesEnabledForMovingPolicy}
                nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                stickyHeaderIndices={stickyHeaderIndices}
                getItemType={getItemType}
                stickyHeaderConfig={stickyHeaderConfig}
                disabledIndexes={shouldSplit ? childrenContainerIndices : undefined}
                overrideItemLayout={shouldSplit ? overrideItemLayout : undefined}
            />
            {modal}
        </SearchListViewLayout>
    );
}

export default ExpenseGroupedSearchView;
