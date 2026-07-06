import AnimatedExitRow from '@components/Search/primitives/AnimatedExitRow';
import HorizontalTableScroll from '@components/Search/primitives/HorizontalTableScroll';
import SelectionTopBar from '@components/Search/primitives/SelectionTopBar';
import useRowLongPressMenu from '@components/Search/primitives/useRowLongPressMenu';
import useScrollRestoration from '@components/Search/primitives/useScrollRestoration';
import {useSearchRowSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';
import {useEditingCellState} from '@components/TransactionItemRow/EditableCell';

import useKeyboardState from '@hooks/useKeyboardState';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import useUndeleteTransactions from '@hooks/useUndeleteTransactions';

import DateUtils from '@libs/DateUtils';
import getPlatform from '@libs/getPlatform';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {splitGroupsIntoPairs} from '@libs/SearchUIUtils';

import variables from '@styles/variables';

import type {TransactionPreviewData} from '@userActions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {CardList, PolicyTagLists, Transaction} from '@src/types/onyx';

import type {FlashListProps, FlashListRef, ViewToken} from '@shopify/flash-list';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';

import React, {useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import type ChatListItem from './ListItem/ChatListItem';
import type ExpenseReportListItem from './ListItem/ExpenseReportListItem';
import type TaskListItem from './ListItem/TaskListItem';
import type TransactionGroupListItem from './ListItem/TransactionGroupListItem';
import type TransactionListItem from './ListItem/TransactionListItem';
import type {
    ReportActionListItemType,
    TaskListItemType,
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionYearGroupListItemType,
} from './ListItem/types';

import BaseSearchList from './BaseSearchList';
import GroupChildrenContainer from './ListItem/GroupChildrenContainer';
import GroupHeader from './ListItem/GroupHeader';
import {isGroupChildrenContainerItem, isGroupHeaderItem} from './ListItem/types';

type SearchListItem = TransactionListItemType | TransactionGroupListItemType | ReportActionListItemType | TaskListItemType;
type SearchListItemComponentType = typeof TransactionListItem | typeof ChatListItem | typeof TransactionGroupListItem | typeof TaskListItem | typeof ExpenseReportListItem;

type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type SearchListProps = Pick<FlashListProps<SearchListItem>, 'onScroll' | 'contentContainerStyle' | 'onEndReached' | 'onEndReachedThreshold' | 'ListFooterComponent'> & {
    data: SearchListItem[];

    /** Default renderer for every item in the list */
    ListItem: SearchListItemComponentType;

    SearchTableHeader?: React.JSX.Element;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;

    /** Whether this is a multi-select list */
    canSelectMultiple: boolean;

    /** Styles to apply to SelectionList container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to prevent long press of options */
    shouldPreventLongPressRow?: boolean;

    /** Whether to animate the items in the list */
    shouldAnimate?: boolean;

    /** The search query */
    queryJSON: SearchQueryJSON;

    /** Columns to show */
    columns: SearchColumnType[];

    /** Called when the viewability of rows changes, as defined by the viewabilityConfig prop. */
    onViewableItemsChanged?: (info: {changed: Array<ViewToken<SearchListItem>>; viewableItems: Array<ViewToken<SearchListItem>>}) => void;

    /** Invoked on mount and layout changes */
    onLayout?: () => void;

    /** Styles to apply to the content container */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Whether mobile selection mode is enabled */
    isMobileSelectionModeEnabled: boolean;

    newTransactions?: Transaction[];

    /** Non-personal and workspace cards (same drill path as former custom card names for rows) */
    nonPersonalAndWorkspaceCards?: CardList;

    /** All policies' tag lists, drilled from the list level so each row can resolve its policy's tags without an Onyx subscription per row */
    policyTags?: OnyxCollection<PolicyTagLists>;

    /** Whether all transactions have been loaded from snapshots in group-by views */
    hasLoadedAllTransactions?: boolean;

    /** Whether the action column should use its wider variant (e.g. when there is at least one deleted transaction) */
    isActionColumnWide?: boolean;

    /** Precomputed attendee-tracking boolean (derived from policy-for-moving-expenses) */
    isAttendeesEnabledForMovingPolicy?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<SearchListHandle>;
};

const keyExtractor = (item: SearchListItem, index: number) => item.keyForList ?? `${index}`;

function isTransactionGroupListItemArray(data: SearchListItem[]): data is TransactionGroupListItemType[] {
    if (data.length <= 0) {
        return false;
    }
    const firstElement = data.at(0);
    return typeof firstElement === 'object' && 'transactions' in firstElement;
}

function isTransactionMatchWithGroupItem(transaction: Transaction, groupItem: SearchListItem, groupBy: SearchGroupBy | undefined) {
    if (groupBy === CONST.SEARCH.GROUP_BY.CARD) {
        return transaction.cardID === (groupItem as TransactionCardGroupListItemType).cardID;
    }
    if (groupBy === CONST.SEARCH.GROUP_BY.FROM) {
        return !!transaction.transactionID;
    }
    if (groupBy === CONST.SEARCH.GROUP_BY.CATEGORY) {
        return (transaction.category ?? '') === ((groupItem as TransactionCategoryGroupListItemType).category ?? '');
    }
    if (groupBy === CONST.SEARCH.GROUP_BY.MERCHANT) {
        return (transaction.merchant ?? '') === ((groupItem as TransactionMerchantGroupListItemType).merchant ?? '');
    }
    if (groupBy === CONST.SEARCH.GROUP_BY.MONTH) {
        const monthGroup = groupItem as TransactionMonthGroupListItemType;
        const transactionDateString = transaction.modifiedCreated ?? transaction.created ?? '';
        return DateUtils.isDateStringInMonth(transactionDateString, monthGroup.year, monthGroup.month);
    }
    if (groupBy === CONST.SEARCH.GROUP_BY.WEEK) {
        const weekGroup = groupItem as TransactionWeekGroupListItemType;
        const transactionDateString = transaction.modifiedCreated ?? transaction.created ?? '';
        const datePart = transactionDateString.substring(0, 10);
        const {start: weekStart, end: weekEnd} = DateUtils.getWeekDateRange(weekGroup.week);
        return datePart >= weekStart && datePart <= weekEnd;
    }
    if (groupBy === CONST.SEARCH.GROUP_BY.YEAR) {
        const yearGroup = groupItem as TransactionYearGroupListItemType;
        const transactionDateString = transaction.modifiedCreated ?? transaction.created ?? '';
        const transactionYear = parseInt(transactionDateString.substring(0, 4), 10);
        return transactionYear === yearGroup.year;
    }
    if (groupBy === CONST.SEARCH.GROUP_BY.QUARTER) {
        const quarterGroup = groupItem as TransactionQuarterGroupListItemType;
        const transactionDateString = transaction.modifiedCreated ?? transaction.created ?? '';
        const transactionYear = parseInt(transactionDateString.substring(0, 4), 10);
        const transactionMonth = parseInt(transactionDateString.substring(5, 7), 10);
        // Calculate which quarter the transaction belongs to (1-4)
        const transactionQuarter = Math.floor((transactionMonth - 1) / 3) + 1;
        return transactionYear === quarterGroup.year && transactionQuarter === quarterGroup.quarter;
    }
    return false;
}

function SearchList({
    data,
    ListItem,
    SearchTableHeader,
    onSelectRow,
    canSelectMultiple,
    onScroll = () => {},
    contentContainerStyle,
    onEndReachedThreshold,
    onEndReached,
    containerStyle,
    ListFooterComponent,
    shouldPreventLongPressRow,
    queryJSON,
    columns,
    onViewableItemsChanged,
    onLayout,
    shouldAnimate,
    isMobileSelectionModeEnabled,
    newTransactions = [],
    nonPersonalAndWorkspaceCards,
    hasLoadedAllTransactions,
    policyTags,
    isActionColumnWide,
    isAttendeesEnabledForMovingPolicy,
    ref,
}: SearchListProps) {
    const styles = useThemeStyles();
    const {toggle, toggleAll} = useSearchRowSelectionActions();
    const {selectedTransactions} = useSearchSelectionContext();

    const {groupBy, type} = queryJSON;
    const flattenedItems = useMemo(() => {
        if (groupBy || type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            if (!isTransactionGroupListItemArray(data)) {
                return data;
            }
            return data.flatMap((item) => item.transactions);
        }
        return data;
    }, [data, groupBy, type]);
    const emptyReports = useMemo(() => {
        if (isTransactionGroupListItemArray(data)) {
            return data.filter((item) => item.transactions.length === 0 && item.keyForList);
        }
        return [];
    }, [data]);

    const selectedItemsLength = useMemo(() => {
        const selectedTransactionsCount = flattenedItems.reduce((acc, item) => {
            const isTransactionSelected = !!(item?.keyForList && selectedTransactions[item.keyForList]?.isSelected);
            return acc + (isTransactionSelected ? 1 : 0);
        }, 0);

        if (isTransactionGroupListItemArray(data)) {
            const selectedEmptyReports = emptyReports.reduce((acc, item) => {
                const isEmptyReportSelected = !!(item.keyForList && selectedTransactions[item.keyForList]?.isSelected);
                return acc + (isEmptyReportSelected ? 1 : 0);
            }, 0);

            return selectedEmptyReports + selectedTransactionsCount;
        }

        return selectedTransactionsCount;
    }, [flattenedItems, data, emptyReports, selectedTransactions]);

    const totalItems = useMemo(() => {
        if (isTransactionGroupListItemArray(data)) {
            const selectableEmptyReports = emptyReports.filter((item) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            const selectableTransactions = flattenedItems.filter((item) => {
                if ('pendingAction' in item) {
                    return item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                }
                return true;
            });
            return selectableEmptyReports.length + selectableTransactions.length;
        }

        const selectableTransactions = flattenedItems.filter((item) => {
            if ('pendingAction' in item) {
                return item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            }
            return true;
        });
        return selectableTransactions.length;
    }, [data, flattenedItems, emptyReports]);

    const {isOffline} = useNetwork();
    const listRef = useRef<FlashListRef<SearchListItem>>(null);
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const prevDataLength = usePrevious(data.length);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();

    const hasItemsBeingRemoved = prevDataLength && prevDataLength > data.length;
    const {isEditingCell, wasRecentlyEditingCell} = useEditingCellState();

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

    const onToggleGroup = useCallback((key: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, []);

    const isWeb = getPlatform() === CONST.PLATFORM.WEB;
    const shouldSplitGroups = !!groupBy && isLargeScreenWidth && isWeb;

    const {
        splitData: listData,
        stickyHeaderIndices,
        childrenContainerIndices,
    } = useMemo(() => {
        if (!shouldSplitGroups) {
            return {splitData: data, stickyHeaderIndices: undefined, childrenContainerIndices: CONST.EMPTY_ARRAY as readonly number[]};
        }

        const {splitData, stickyHeaderIndices: splitStickyIndices} = splitGroupsIntoPairs(data);
        const childrenIndices: number[] = [];

        for (let i = 0; i < splitData.length; i++) {
            const item = splitData.at(i);
            if (item && isGroupChildrenContainerItem(item)) {
                childrenIndices.push(i);
            }
        }

        return {
            splitData,
            stickyHeaderIndices: splitStickyIndices.length > 0 ? splitStickyIndices : undefined,
            childrenContainerIndices: childrenIndices,
        };
    }, [data, shouldSplitGroups]);

    const getItemType = useCallback(
        (item: SearchListItem) => {
            if (!shouldSplitGroups) {
                return undefined;
            }
            if (isGroupHeaderItem(item)) {
                return item.listItemType;
            }
            if (isGroupChildrenContainerItem(item)) {
                return item.listItemType;
            }
            return 'default';
        },
        [shouldSplitGroups],
    );

    const overrideItemLayout = useCallback((layout: {size?: number; span?: number}, item: SearchListItem) => {
        if (!isGroupHeaderItem(item)) {
            return;
        }
        // FlashList requires mutating the layout object passed to overrideItemLayout
        // eslint-disable-next-line no-param-reassign -- FlashList overrideItemLayout API
        layout.size = variables.tableRowHeight;
    }, []);

    const stickyHeaderConfig = useMemo(
        () =>
            shouldSplitGroups
                ? {
                      hideRelatedCell: true,
                      useNativeDriver: true,
                      zIndex: 2,
                  }
                : undefined,
        [shouldSplitGroups],
    );

    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const undeleteTransactions = useUndeleteTransactions();

    const handleUndelete = (transaction: Transaction) => undeleteTransactions([transaction]);

    const newTransactionIDByItemKey = (() => {
        if (newTransactions.length === 0) {
            return CONST.EMPTY_MAP;
        }

        const mappedTransactionIDs = new Map<string, string>();
        for (const item of data) {
            const matchedTransactionID = newTransactions.find((transaction) => isTransactionMatchWithGroupItem(transaction, item, groupBy))?.transactionID;
            if (matchedTransactionID && item.keyForList) {
                mappedTransactionIDs.set(item.keyForList, matchedTransactionID);
            }
        }

        return mappedTransactionIDs;
    })();

    const {onLongPressRow, modal} = useRowLongPressMenu({shouldPreventLongPressRow, isSmallScreenWidth, isMobileSelectionModeEnabled});

    // In mobile selection mode a row tap toggles selection. This must live here (not in <Search>) because
    // <Search> renders SearchWriteActionsProvider as its child, so the `toggle` it reads is the default no-op;
    // SearchList sits inside the provider and gets the real one.
    const handleSelectRow = useCallback(
        (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => {
            if (isMobileSelectionModeEnabled) {
                if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return;
                }
                toggle(item);
                return;
            }
            onSelectRow(item, transactionPreviewData, event);
        },
        [isMobileSelectionModeEnabled, toggle, onSelectRow],
    );

    /**
     * Scrolls to the desired item index in the FlashList (listData coordinates).
     * Used by keyboard navigation where focused indices map directly to listData rows.
     */
    const scrollToListIndex = useCallback(
        (index: number, animated = true) => {
            const item = listData.at(index);

            if (!listRef.current || !item || index === -1) {
                return;
            }

            if (isEditingCell || wasRecentlyEditingCell) {
                return;
            }

            listRef.current.scrollToIndex({index, animated, viewOffset: -variables.contentHeaderHeight});
        },
        [listData, isEditingCell, wasRecentlyEditingCell],
    );

    /**
     * Scrolls to the desired item index in the source data array.
     * Remaps to split listData indices when sticky group headers are active.
     */
    const scrollToDataIndex = useCallback(
        (index: number, animated = true) => {
            const item = data.at(index);

            if (!listRef.current || !item || index === -1) {
                return;
            }

            if (isEditingCell || wasRecentlyEditingCell) {
                return;
            }

            let targetIndex = index;
            if (shouldSplitGroups && item.keyForList) {
                const splitIndex = listData.findIndex((listItem) => listItem.keyForList === `header_${item.keyForList}`);
                if (splitIndex !== -1) {
                    targetIndex = splitIndex;
                }
            }

            listRef.current.scrollToIndex({index: targetIndex, animated, viewOffset: -variables.contentHeaderHeight});
        },
        [data, listData, shouldSplitGroups, isEditingCell, wasRecentlyEditingCell],
    );

    useScrollRestoration(listRef);

    useImperativeHandle(ref, () => ({scrollToIndex: scrollToDataIndex}), [scrollToDataIndex]);

    const isItemVisible = useCallback((item: SearchListItem) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline, [isOffline]);
    const firstVisibleIndex = useMemo(() => listData.findIndex(isItemVisible), [listData, isItemVisible]);
    const lastVisibleIndex = useMemo(() => listData.findLastIndex(isItemVisible), [listData, isItemVisible]);

    const renderItem = useCallback(
        (item: SearchListItem, index: number, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => {
            // Handle group header items (sticky)
            if (isGroupHeaderItem(item)) {
                const headerItem = item;
                const originalKey = item.groupKeyForList;
                return (
                    <GroupHeader
                        item={headerItem}
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

            // Handle children container items (animated expand/collapse)
            if (isGroupChildrenContainerItem(item)) {
                const containerItem = item;
                const originalKey = item.groupKeyForList;
                const containerNewTransactionID = item.keyForList ? newTransactionIDByItemKey.get(originalKey) : undefined;
                return (
                    <GroupChildrenContainer
                        item={containerItem}
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

            // Default rendering for non-group items
            const isDisabled = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            const shouldApplyAnimation = shouldAnimate && index < listData.length - 1;

            const newTransactionID = item.keyForList ? newTransactionIDByItemKey.get(item.keyForList) : undefined;

            return (
                <AnimatedExitRow
                    shouldApplyAnimation={!!shouldApplyAnimation}
                    hasItemsBeingRemoved={!!hasItemsBeingRemoved}
                >
                    <ListItem
                        showTooltip
                        isFocused={isItemFocused}
                        onSelectRow={handleSelectRow}
                        onLongPressRow={onLongPressRow}
                        onSelectionButtonPress={toggle}
                        canSelectMultiple={canSelectMultiple}
                        item={item}
                        columns={columns}
                        isDisabled={isDisabled}
                        groupBy={groupBy}
                        searchType={type}
                        lastPaymentMethod={lastPaymentMethod}
                        personalPolicyID={personalPolicyID}
                        userBillingGracePeriodEnds={userBillingGracePeriodEnds}
                        ownerBillingGracePeriodEnd={ownerBillingGracePeriodEnd}
                        nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                        policyTags={policyTags}
                        onFocus={onFocus}
                        newTransactionID={newTransactionID}
                        onUndelete={handleUndelete}
                        keyForList={item.keyForList}
                        isFirstItem={index === firstVisibleIndex}
                        isLastItem={index === lastVisibleIndex && !ListFooterComponent}
                    />
                </AnimatedExitRow>
            );
        },
        [
            type,
            groupBy,
            newTransactionIDByItemKey,
            shouldAnimate,
            listData.length,
            hasItemsBeingRemoved,
            ListItem,
            handleSelectRow,
            onLongPressRow,
            toggle,
            canSelectMultiple,
            columns,
            lastPaymentMethod,
            personalPolicyID,
            userBillingGracePeriodEnds,
            ownerBillingGracePeriodEnd,
            nonPersonalAndWorkspaceCards,
            policyTags,
            ListFooterComponent,
            handleUndelete,
            firstVisibleIndex,
            lastVisibleIndex,
            expandedGroups,
            onToggleGroup,
            bankAccountList,
            cardFeeds,
            conciergeReportID,
            visibleColumns,
        ],
    );

    const tableHeaderVisible = canSelectMultiple || !!SearchTableHeader;
    const selectAllButtonVisible = canSelectMultiple && !SearchTableHeader;
    const isSelectAllChecked = selectedItemsLength > 0 && selectedItemsLength === totalItems && hasLoadedAllTransactions;

    const content = (
        <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
            {tableHeaderVisible && (
                <SelectionTopBar
                    isLargeScreenWidth={isLargeScreenWidth}
                    shouldSplitGroups={shouldSplitGroups}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    selectedItemsLength={selectedItemsLength}
                    totalItems={totalItems}
                    hasLoadedAllTransactions={hasLoadedAllTransactions}
                    selectAllButtonVisible={selectAllButtonVisible}
                    onAllCheckboxPress={toggleAll}
                    SearchTableHeader={SearchTableHeader}
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
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                onViewableItemsChanged={onViewableItemsChanged}
                onLayout={onLayout}
                contentContainerStyle={contentContainerStyle}
                newTransactions={newTransactions}
                isAttendeesEnabledForMovingPolicy={isAttendeesEnabledForMovingPolicy}
                nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                stickyHeaderIndices={stickyHeaderIndices}
                getItemType={getItemType}
                stickyHeaderConfig={stickyHeaderConfig}
                disabledIndexes={shouldSplitGroups ? childrenContainerIndices : undefined}
                overrideItemLayout={shouldSplitGroups ? overrideItemLayout : undefined}
            />
            {modal}
        </View>
    );

    return (
        <HorizontalTableScroll
            columns={columns}
            type={queryJSON.type}
            isActionColumnWide={isActionColumnWide}
            isHeaderVisible={!!SearchTableHeader}
            dataKey={data}
        >
            {content}
        </HorizontalTableScroll>
    );
}

export default SearchList;
export {isTransactionMatchWithGroupItem};
