import {useFocusEffect, useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {accountIDSelector} from '@selectors/Session';
import {tierNameSelector} from '@selectors/UserWallet';
import type {FlashListProps, FlashListRef, ViewToken} from '@shopify/flash-list';
import React, {useCallback, useContext, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView, StyleProp, ViewStyle} from 'react-native';
import Animated, {Easing, FadeOutUp, LinearTransition} from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {PressableWithFeedback} from '@components/Pressable';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import type {SearchColumnType, SearchGroupBy, SearchQueryJSON, SelectedTransactions} from '@components/Search/types';
import type ChatListItem from '@components/SelectionListWithSections/ChatListItem';
import type TaskListItem from '@components/SelectionListWithSections/Search/TaskListItem';
import type TransactionGroupListItem from '@components/SelectionListWithSections/Search/TransactionGroupListItem';
import type TransactionListItem from '@components/SelectionListWithSections/Search/TransactionListItem';
import type {
    ExtendedTargetedEvent,
    ReportActionListItemType,
    TaskListItemType,
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionListItemType,
} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import navigationRef from '@libs/Navigation/navigationRef';
import {getTableMinWidth} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import type {TransactionPreviewData} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolations} from '@src/types/onyx';
import BaseSearchList from './BaseSearchList';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0);

// Keep a ref to the horizontal scroll offset so we can restore it if users change the search query
let savedHorizontalScrollOffset = 0;

type SearchListItem = TransactionListItemType | TransactionGroupListItemType | ReportActionListItemType | TaskListItemType;
type SearchListItemComponentType = typeof TransactionListItem | typeof ChatListItem | typeof TransactionGroupListItem | typeof TaskListItem;

type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type SearchListProps = Pick<FlashListProps<SearchListItem>, 'onScroll' | 'contentContainerStyle' | 'onEndReached' | 'onEndReachedThreshold' | 'ListFooterComponent'> & {
    data: SearchListItem[];

    /** Default renderer for every item in the list */
    ListItem: SearchListItemComponentType;

    SearchTableHeader?: React.JSX.Element;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData) => void;

    /** Whether this is a multi-select list */
    canSelectMultiple: boolean;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void;

    /** Callback to fire when "Select All" checkbox is pressed. Only use along with `canSelectMultiple` */
    onAllCheckboxPress: () => void;

    /** Styles to apply to SelectionList container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to prevent default focusing of options and focus the text input when selecting an option */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

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

    /** Violations indexed by transaction ID */
    violations?: Record<string, TransactionViolations | undefined> | undefined;

    /** Custom card names */
    customCardNames?: Record<number, string>;

    /** Callback to fire when DEW modal should be opened */
    onDEWModalOpen?: () => void;

    /** Whether the DEW beta flag is enabled */
    isDEWBetaEnabled?: boolean;

    /** Selected transactions for determining isSelected state */
    selectedTransactions: SelectedTransactions;

    /** Whether all transactions have been loaded from snapshots in group-by views */
    hasLoadedAllTransactions?: boolean;

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
    return false;
}

function SearchList({
    data,
    ListItem,
    SearchTableHeader,
    onSelectRow,
    onCheckboxPress,
    canSelectMultiple,
    onScroll = () => {},
    onAllCheckboxPress,
    contentContainerStyle,
    onEndReachedThreshold,
    onEndReached,
    containerStyle,
    ListFooterComponent,
    shouldPreventDefaultFocusOnSelectRow,
    shouldPreventLongPressRow,
    queryJSON,
    columns,
    onViewableItemsChanged,
    onLayout,
    shouldAnimate,
    isMobileSelectionModeEnabled,
    newTransactions = [],
    violations,
    customCardNames,
    onDEWModalOpen,
    isDEWBetaEnabled,
    selectedTransactions,
    hasLoadedAllTransactions,
    ref,
}: SearchListProps) {
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['CheckSquare']);

    const {hash, groupBy, type} = queryJSON;
    const flattenedItems = useMemo(() => {
        if (groupBy || type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            if (!isTransactionGroupListItemArray(data)) {
                return data;
            }
            return data.flatMap((item) => item.transactions);
        }
        return data;
    }, [data, groupBy, type]);
    const flattenedItemsWithoutPendingDelete = useMemo(() => flattenedItems.filter((t) => t?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE), [flattenedItems]);

    const selectedItemsLength = useMemo(() => {
        return flattenedItemsWithoutPendingDelete.reduce((acc, item) => {
            if (item.keyForList && selectedTransactions[item.keyForList]?.isSelected) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }, [flattenedItemsWithoutPendingDelete, selectedTransactions]);

    const itemsWithSelection = useMemo(() => {
        return data.map((item) => {
            let isSelected = false;
            let itemWithSelection: SearchListItem = item;

            if ('transactions' in item && item.transactions) {
                if (!canSelectMultiple) {
                    itemWithSelection = {...item, isSelected: false};
                } else {
                    const hasAnySelected = item.transactions.some((t) => t.keyForList && selectedTransactions[t.keyForList]?.isSelected);

                    if (!hasAnySelected) {
                        itemWithSelection = {...item, isSelected: false};
                    } else {
                        let allNonDeletedSelected = true;
                        let hasNonDeletedTransactions = false;

                        const mappedTransactions = item.transactions.map((transaction) => {
                            const isTransactionSelected = !!(transaction.keyForList && selectedTransactions[transaction.keyForList]?.isSelected);

                            if (transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                                hasNonDeletedTransactions = true;
                                if (!isTransactionSelected) {
                                    allNonDeletedSelected = false;
                                }
                            }

                            return {...transaction, isSelected: isTransactionSelected};
                        });

                        isSelected = hasNonDeletedTransactions && allNonDeletedSelected;
                        itemWithSelection = {...item, isSelected, transactions: mappedTransactions};
                    }
                }
            } else {
                isSelected = !!(canSelectMultiple && item.keyForList && selectedTransactions[item.keyForList]?.isSelected);
                itemWithSelection = {...item, isSelected};
            }

            return {originalItem: item, itemWithSelection, isSelected};
        });
    }, [data, canSelectMultiple, selectedTransactions]);

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const listRef = useRef<FlashListRef<SearchListItem>>(null);
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const prevDataLength = usePrevious(data.length);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<SearchListItem>();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
    });

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: accountIDSelector});

    const hasItemsBeingRemoved = prevDataLength && prevDataLength > data.length;
    const personalDetails = usePersonalDetails();

    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector, canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});

    const route = useRoute();
    const {getScrollOffset} = useContext(ScrollOffsetContext);

    const [longPressedItemTransactions, setLongPressedItemTransactions] = useState<TransactionListItemType[]>();

    const {windowWidth} = useWindowDimensions();
    const minTableWidth = getTableMinWidth(columns);
    const shouldScrollHorizontally = !!SearchTableHeader && minTableWidth > windowWidth;

    const horizontalScrollViewRef = useRef<RNScrollView>(null);

    const handleHorizontalScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        savedHorizontalScrollOffset = event.nativeEvent.contentOffset.x;
    }, []);

    // Restore horizontal scroll position synchronously before paint using useLayoutEffect to avoid a visible shift on the table
    useLayoutEffect(() => {
        if (!shouldScrollHorizontally || savedHorizontalScrollOffset <= 0) {
            return;
        }
        horizontalScrollViewRef.current?.scrollTo({x: savedHorizontalScrollOffset, animated: false});
    }, [data, shouldScrollHorizontally]);

    const handleLongPressRow = useCallback(
        (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => {
            const currentRoute = navigationRef.current?.getCurrentRoute();
            if (currentRoute && route.key !== currentRoute.key) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (shouldPreventLongPressRow || !isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox) {
                return;
            }
            // disable long press for empty expense reports
            if ('transactions' in item && item.transactions.length === 0 && !groupBy) {
                return;
            }
            if (isMobileSelectionModeEnabled) {
                onCheckboxPress(item, itemTransactions);
                return;
            }
            setLongPressedItem(item);
            setLongPressedItemTransactions(itemTransactions);
            setIsModalVisible(true);
        },
        [groupBy, route.key, shouldPreventLongPressRow, isSmallScreenWidth, isMobileSelectionModeEnabled, onCheckboxPress],
    );

    const turnOnSelectionMode = useCallback(() => {
        turnOnMobileSelectionMode();
        setIsModalVisible(false);

        if (onCheckboxPress && longPressedItem) {
            onCheckboxPress?.(longPressedItem, longPressedItemTransactions);
        }
    }, [longPressedItem, onCheckboxPress, longPressedItemTransactions]);

    /**
     * Scrolls to the desired item index in the section list
     *
     * @param index - the index of the item to scroll to
     * @param animated - whether to animate the scroll
     */
    const scrollToIndex = useCallback(
        (index: number, animated = true) => {
            const item = data.at(index);

            if (!listRef.current || !item || index === -1) {
                return;
            }

            listRef.current.scrollToIndex({index, animated, viewOffset: -variables.contentHeaderHeight});
        },
        [data],
    );

    useFocusEffect(
        useCallback(() => {
            const offset = getScrollOffset(route);
            requestAnimationFrame(() => {
                if (!offset || !listRef.current) {
                    return;
                }

                listRef.current.scrollToOffset({offset, animated: false});
            });
        }, [getScrollOffset, route]),
    );

    useImperativeHandle(ref, () => ({scrollToIndex}), [scrollToIndex]);

    const renderItem = useCallback(
        (item: SearchListItem, index: number, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => {
            const isDisabled = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            const shouldApplyAnimation = shouldAnimate && index < data.length - 1;

            const newTransactionID = newTransactions.find((transaction) => isTransactionMatchWithGroupItem(transaction, item, groupBy))?.transactionID;

            const itemData = itemsWithSelection.at(index);
            const itemWithSelection = itemData?.itemWithSelection ?? item;

            return (
                <Animated.View
                    exiting={shouldApplyAnimation ? FadeOutUp.duration(CONST.SEARCH.EXITING_ANIMATION_DURATION).easing(easing) : undefined}
                    entering={undefined}
                    style={styles.overflowHidden}
                    layout={shouldApplyAnimation && hasItemsBeingRemoved ? LinearTransition.easing(easing).duration(CONST.SEARCH.EXITING_ANIMATION_DURATION) : undefined}
                >
                    <ListItem
                        showTooltip
                        isFocused={isItemFocused}
                        onSelectRow={onSelectRow}
                        onLongPressRow={handleLongPressRow}
                        onCheckboxPress={onCheckboxPress}
                        canSelectMultiple={canSelectMultiple}
                        item={itemWithSelection}
                        shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                        queryJSONHash={hash}
                        columns={columns}
                        policies={policies}
                        isDisabled={isDisabled}
                        allReports={allReports}
                        groupBy={groupBy}
                        searchType={type}
                        onDEWModalOpen={onDEWModalOpen}
                        isDEWBetaEnabled={isDEWBetaEnabled}
                        userWalletTierName={userWalletTierName}
                        isUserValidated={isUserValidated}
                        personalDetails={personalDetails}
                        userBillingFundID={userBillingFundID}
                        accountID={accountID}
                        isOffline={isOffline}
                        violations={violations}
                        customCardNames={customCardNames}
                        onFocus={onFocus}
                        newTransactionID={newTransactionID}
                    />
                </Animated.View>
            );
        },
        [
            type,
            groupBy,
            newTransactions,
            shouldAnimate,
            data.length,
            itemsWithSelection,
            styles.overflowHidden,
            hasItemsBeingRemoved,
            ListItem,
            onSelectRow,
            handleLongPressRow,
            onCheckboxPress,
            canSelectMultiple,
            shouldPreventDefaultFocusOnSelectRow,
            hash,
            columns,
            policies,
            allReports,
            userWalletTierName,
            isUserValidated,
            personalDetails,
            userBillingFundID,
            accountID,
            isOffline,
            violations,
            onDEWModalOpen,
            isDEWBetaEnabled,
            customCardNames,
        ],
    );

    const tableHeaderVisible = canSelectMultiple || !!SearchTableHeader;
    const selectAllButtonVisible = canSelectMultiple && !SearchTableHeader;
    const isSelectAllChecked = selectedItemsLength > 0 && selectedItemsLength === flattenedItemsWithoutPendingDelete.length && hasLoadedAllTransactions;

    const content = (
        <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
            {tableHeaderVisible && (
                <View style={[styles.searchListHeaderContainerStyle, styles.listTableHeader]}>
                    {canSelectMultiple && (
                        <Checkbox
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={selectedItemsLength > 0 && (selectedItemsLength !== flattenedItemsWithoutPendingDelete.length || !hasLoadedAllTransactions)}
                            onPress={() => {
                                onAllCheckboxPress();
                            }}
                            disabled={flattenedItems.length === 0}
                        />
                    )}

                    {SearchTableHeader}

                    {selectAllButtonVisible && (
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={onAllCheckboxPress}
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            role="button"
                            accessibilityState={{checked: isSelectAllChecked}}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            <Text style={[styles.textMicroSupporting, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                        </PressableWithFeedback>
                    )}
                </View>
            )}
            <BaseSearchList
                data={data}
                renderItem={renderItem}
                onSelectRow={onSelectRow}
                keyExtractor={keyExtractor}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
                ref={listRef}
                columns={columns}
                scrollToIndex={scrollToIndex}
                flattenedItemsLength={flattenedItems.length}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                onViewableItemsChanged={onViewableItemsChanged}
                onLayout={onLayout}
                contentContainerStyle={contentContainerStyle}
                newTransactions={newTransactions}
                selectedTransactions={selectedTransactions}
                customCardNames={customCardNames}
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={expensifyIcons.CheckSquare}
                    onPress={turnOnSelectionMode}
                />
            </Modal>
        </View>
    );

    if (shouldScrollHorizontally) {
        return (
            <ScrollView
                ref={horizontalScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator
                style={styles.flex1}
                contentContainerStyle={{width: minTableWidth}}
                contentOffset={{x: savedHorizontalScrollOffset, y: 0}}
                onScroll={handleHorizontalScroll}
                scrollEventThrottle={16}
            >
                {content}
            </ScrollView>
        );
    }

    return content;
}

export default SearchList;
