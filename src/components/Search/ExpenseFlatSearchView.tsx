import type {FlashListRef} from '@shopify/flash-list';
import React, {useImperativeHandle, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
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
import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, Transaction} from '@src/types/onyx';
import AnimatedExitRow from './primitives/AnimatedExitRow';
import HorizontalTableScroll from './primitives/HorizontalTableScroll';
import SelectionTopBar from './primitives/SelectionTopBar';
import useRowLongPressMenu from './primitives/useRowLongPressMenu';
import useScrollRestoration from './primitives/useScrollRestoration';
import {useSearchRowSelectionActions, useSearchSelectionContext} from './SearchContext';
import BaseSearchList from './SearchList/BaseSearchList';
import TransactionListItem from './SearchList/ListItem/TransactionListItem';
import type {SearchListItem} from './SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from './types';

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
 * Consumes `useSearchSnapshot` and is rendered by `<Search>` as a child of the selection providers (so it
 * reads the real `toggle`/`toggleAll`/`selectedTransactions`). It composes the reusable Search list
 * primitives directly around `BaseSearchList` — no `SearchList` shell, no `ListItem` prop, no factory.
 * `TransactionListItem` is the only row renderer for the flat-expense path, and rows always animate, so the
 * group/sticky/chat/task branches of `SearchList` do not apply here. Keyboard navigation is inherited from
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
    const styles = useThemeStyles();
    const {type} = queryJSON;
    const {toggle, toggleAll} = useSearchRowSelectionActions();
    const {selectedTransactions} = useSearchSelectionContext();

    const {isOffline} = useNetwork();
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const {isEditingCell, wasRecentlyEditingCell} = useEditingCellState();

    const listRef = useRef<FlashListRef<SearchListItem>>(null);
    const prevDataLength = usePrevious(data.length);
    const hasItemsBeingRemoved = !!prevDataLength && prevDataLength > data.length;

    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const undeleteTransactions = useUndeleteTransactions();

    const handleUndelete = (transaction: Transaction) => undeleteTransactions([transaction]);

    // Flat lists have no group children to skip, so visibility is computed straight off the rendered rows.
    const isItemVisible = (item: SearchListItem) => !isRowDeleted(item) || isOffline;
    const firstVisibleIndex = data.findIndex(isItemVisible);
    const lastVisibleIndex = data.findLastIndex(isItemVisible);

    // Flat-expense selection counts: no empty groups, no group flattening — a single pass over the rows.
    const selectedItemsLength = data.reduce((acc, item) => acc + (item.keyForList && selectedTransactions[item.keyForList]?.isSelected ? 1 : 0), 0);
    const totalItems = data.filter((item) => !isRowDeleted(item)).length;

    const {onLongPressRow, modal} = useRowLongPressMenu({shouldPreventLongPressRow: false, isSmallScreenWidth, isMobileSelectionModeEnabled});

    // In mobile selection mode a row tap toggles selection. This must live inside the providers (not in the
    // router) because the `toggle` it reads is the default no-op outside SearchWriteActionsProvider; here it
    // resolves to the real action.
    const handleSelectRow = (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => {
        if (isMobileSelectionModeEnabled) {
            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }
            toggle(item);
            return;
        }
        onSelectRow(item, transactionPreviewData, event);
    };

    const scrollToListIndex = (index: number, animated = true) => {
        const item = data.at(index);
        if (!listRef.current || !item || index === -1) {
            return;
        }
        // Mirror SearchList: don't scroll while a row's cell is being inline-edited, which would blur/move it mid-edit.
        if (isEditingCell || wasRecentlyEditingCell) {
            return;
        }
        listRef.current.scrollToIndex({index, animated, viewOffset: -variables.contentHeaderHeight});
    };

    useScrollRestoration(listRef);

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
        <HorizontalTableScroll
            columns={columns}
            type={type}
            isActionColumnWide={isActionColumnWide}
            isHeaderVisible={!!searchTableHeader}
            dataKey={data}
        >
            <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
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
            </View>
        </HorizontalTableScroll>
    );
}

ExpenseFlatSearchView.displayName = 'ExpenseFlatSearchView';

export default ExpenseFlatSearchView;
