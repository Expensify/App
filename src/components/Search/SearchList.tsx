import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListProps, ViewToken} from '@shopify/flash-list';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import Animated, {Easing, FadeOutUp, LinearTransition} from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {PressableWithFeedback} from '@components/Pressable';
import type ChatListItem from '@components/SelectionList/ChatListItem';
import type TaskListItem from '@components/SelectionList/Search/TaskListItem';
import type TransactionGroupListItem from '@components/SelectionList/Search/TransactionGroupListItem';
import type TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ExtendedTargetedEvent, ReportActionListItemType, TaskListItemType, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useInitialWindowDimensions from '@hooks/useInitialWindowDimensions';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {isMobileChrome} from '@libs/Browser';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {createItemHeightCalculator} from './itemHeightCalculator';
import ITEM_HEIGHTS from './itemHeights';
import type {SearchQueryJSON} from './types';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();
const AnimatedFlashListComponent = Animated.createAnimatedComponent(FlashList<SearchListItem>);

type SearchListItem = TransactionListItemType | TransactionGroupListItemType | ReportActionListItemType | TaskListItemType;
type SearchListItemComponentType = typeof TransactionListItem | typeof ChatListItem | typeof TransactionGroupListItem | typeof TaskListItem;

type SearchListHandle = {
    scrollAndHighlightItem?: (items: string[]) => void;
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type SearchListProps = Pick<FlashListProps<SearchListItem>, 'onScroll' | 'contentContainerStyle' | 'onEndReached' | 'onEndReachedThreshold' | 'ListFooterComponent'> & {
    data: SearchListItem[];

    /** Default renderer for every item in the list */
    ListItem: SearchListItemComponentType;

    SearchTableHeader?: React.JSX.Element;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: SearchListItem) => void;

    /** Whether this is a multi-select list */
    canSelectMultiple: boolean;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress: (item: SearchListItem) => void;

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

    /** Called when the viewability of rows changes, as defined by the viewabilityConfig prop. */
    onViewableItemsChanged?: (info: {changed: ViewToken[]; viewableItems: ViewToken[]}) => void;

    /** Invoked on mount and layout changes */
    onLayout?: () => void;

    /** Styles to apply to the content container */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** The estimated height of an item in the list */
    estimatedItemSize?: number;

    /** Whether mobile selection mode is enabled */
    isMobileSelectionModeEnabled: boolean;
};

const keyExtractor = (item: SearchListItem, index: number) => item.keyForList ?? `${index}`;

function isTransactionGroupListItemArray(data: SearchListItem[]): data is TransactionGroupListItemType[] {
    if (data.length <= 0) {
        return false;
    }
    const firstElement = data.at(0);
    return typeof firstElement === 'object' && 'transactions' in firstElement;
}

function SearchList(
    {
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
        onViewableItemsChanged,
        onLayout,
        shouldAnimate,
        estimatedItemSize = ITEM_HEIGHTS.NARROW_WITHOUT_DRAWER.STANDARD,
        isMobileSelectionModeEnabled,
    }: SearchListProps,
    ref: ForwardedRef<SearchListHandle>,
) {
    const styles = useThemeStyles();

    const {initialHeight, initialWidth} = useInitialWindowDimensions();
    const {hash, groupBy, type} = queryJSON;
    const flattenedItems = useMemo(() => {
        if (groupBy) {
            if (!isTransactionGroupListItemArray(data)) {
                return data;
            }
            return data.flatMap((item) => item.transactions);
        }
        return data;
    }, [data, groupBy]);
    const flattenedItemsWithoutPendingDelete = useMemo(() => flattenedItems.filter((t) => t?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE), [flattenedItems]);

    const selectedItemsLength = useMemo(
        () =>
            flattenedItems.reduce((acc, item) => {
                return item?.isSelected ? acc + 1 : acc;
            }, 0),
        [flattenedItems],
    );

    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const listRef = useRef<FlashList<SearchListItem>>(null);
    const hasKeyBeenPressed = useRef(false);
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);
    const itemFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const prevDataLength = usePrevious(data.length);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<SearchListItem>();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
    });

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});

    const hasItemsBeingRemoved = prevDataLength && prevDataLength > data.length;
    const personalDetails = usePersonalDetails();

    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.validated, canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});

    const handleLongPressRow = useCallback(
        (item: SearchListItem) => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (shouldPreventLongPressRow || !isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox || !isFocused) {
                return;
            }
            // disable long press for empty expense reports
            if ('transactions' in item && item.transactions.length === 0) {
                return;
            }
            if (isMobileSelectionModeEnabled) {
                onCheckboxPress(item);
                return;
            }
            setLongPressedItem(item);
            setIsModalVisible(true);
        },
        [isFocused, isSmallScreenWidth, onCheckboxPress, isMobileSelectionModeEnabled, shouldPreventLongPressRow],
    );

    const turnOnSelectionMode = useCallback(() => {
        turnOnMobileSelectionMode();
        setIsModalVisible(false);

        if (onCheckboxPress && longPressedItem) {
            onCheckboxPress?.(longPressedItem);
        }
    }, [longPressedItem, onCheckboxPress]);

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

            listRef.current.scrollToIndex({index, animated, viewOffset: variables.contentHeaderHeight});
        },

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );
    const setHasKeyBeenPressed = useCallback(() => {
        if (hasKeyBeenPressed.current) {
            return;
        }
        // We need to track whether a key has been pressed to enable focus syncing only if a key has been pressed.
        // This is to avoid the default behavior of web showing blue border on click of items after a page refresh.
        hasKeyBeenPressed.current = true;
    }, []);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: flattenedItems.length - 1,
        isActive: isFocused,
        onFocusedIndexChange: (index: number) => {
            scrollToIndex(index);
        },
        ...(!hasKeyBeenPressed.current && {setHasKeyBeenPressed}),
        isFocused,
    });

    const selectFocusedOption = useCallback(() => {
        const focusedItem = data.at(focusedIndex);

        if (!focusedItem) {
            return;
        }

        onSelectRow(focusedItem);
    }, [data, focusedIndex, onSelectRow]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: false,
        shouldPreventDefault: false,
        isActive: isFocused && focusedIndex >= 0,
        shouldStopPropagation: true,
    });

    useEffect(() => {
        addKeyDownPressListener(setHasKeyBeenPressed);

        return () => removeKeyDownPressListener(setHasKeyBeenPressed);
    }, [setHasKeyBeenPressed]);

    /**
     * Highlights the items and scrolls to the first item present in the items list.
     *
     * @param items - The list of items to highlight.
     * @param timeout - The timeout in milliseconds before removing the highlight.
     */
    const scrollAndHighlightItem = useCallback(
        (items: string[]) => {
            const newItemsToHighlight = new Set<string>();
            items.forEach((item) => {
                newItemsToHighlight.add(item);
            });
            const index = data.findIndex((option) => newItemsToHighlight.has(option.keyForList ?? ''));
            scrollToIndex(index);
            setItemsToHighlight(newItemsToHighlight);

            if (itemFocusTimeoutRef.current) {
                clearTimeout(itemFocusTimeoutRef.current);
            }

            const duration =
                CONST.ANIMATED_HIGHLIGHT_ENTRY_DELAY +
                CONST.ANIMATED_HIGHLIGHT_ENTRY_DURATION +
                CONST.ANIMATED_HIGHLIGHT_START_DELAY +
                CONST.ANIMATED_HIGHLIGHT_START_DURATION +
                CONST.ANIMATED_HIGHLIGHT_END_DELAY +
                CONST.ANIMATED_HIGHLIGHT_END_DURATION;
            itemFocusTimeoutRef.current = setTimeout(() => {
                setItemsToHighlight(null);
            }, duration);
        },
        [data, scrollToIndex],
    );

    useImperativeHandle(ref, () => ({scrollAndHighlightItem, scrollToIndex}), [scrollAndHighlightItem, scrollToIndex]);

    const renderItem = useCallback(
        // eslint-disable-next-line react/no-unused-prop-types
        ({item, index}: {item: SearchListItem; index: number}) => {
            const isItemFocused = focusedIndex === index;
            const isItemHighlighted = !!itemsToHighlight?.has(item.keyForList ?? '');
            const isDisabled = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            return (
                <Animated.View
                    exiting={shouldAnimate ? FadeOutUp.duration(CONST.SEARCH.EXITING_ANIMATION_DURATION).easing(easing) : undefined}
                    entering={undefined}
                    style={styles.overflowHidden}
                    layout={shouldAnimate && hasItemsBeingRemoved ? LinearTransition.easing(easing).duration(CONST.SEARCH.EXITING_ANIMATION_DURATION) : undefined}
                >
                    <ListItem
                        showTooltip
                        isFocused={isItemFocused}
                        onSelectRow={onSelectRow}
                        onFocus={(event: NativeSyntheticEvent<ExtendedTargetedEvent>) => {
                            // Prevent unexpected scrolling on mobile Chrome after the context menu closes by ignoring programmatic focus not triggered by direct user interaction.
                            if (isMobileChrome() && event.nativeEvent) {
                                if (!event.nativeEvent.sourceCapabilities) {
                                    return;
                                }
                                // Ignore the focus if it's caused by a touch event on mobile chrome.
                                // For example, a long press will trigger a focus event on mobile chrome
                                if (event.nativeEvent.sourceCapabilities.firesTouchEvents) {
                                    return;
                                }
                            }
                            setFocusedIndex(index);
                        }}
                        onLongPressRow={handleLongPressRow}
                        onCheckboxPress={onCheckboxPress}
                        canSelectMultiple={canSelectMultiple}
                        item={{
                            shouldAnimateInHighlight: isItemHighlighted,
                            ...item,
                        }}
                        shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                        queryJSONHash={hash}
                        policies={policies}
                        isDisabled={isDisabled}
                        allReports={allReports}
                        groupBy={groupBy}
                        userWallet={userWallet}
                        isUserValidated={isUserValidated}
                        personalDetails={personalDetails}
                        userBillingFundID={userBillingFundID}
                    />
                </Animated.View>
            );
        },
        [
            focusedIndex,
            itemsToHighlight,
            shouldAnimate,
            styles.overflowHidden,
            hasItemsBeingRemoved,
            ListItem,
            handleLongPressRow,
            onCheckboxPress,
            onSelectRow,
            canSelectMultiple,
            shouldPreventDefaultFocusOnSelectRow,
            hash,
            policies,
            allReports,
            groupBy,
            setFocusedIndex,
            userWallet,
            isUserValidated,
            personalDetails,
            userBillingFundID,
        ],
    );

    const tableHeaderVisible = canSelectMultiple || !!SearchTableHeader;
    const selectAllButtonVisible = canSelectMultiple && !SearchTableHeader;
    const isSelectAllChecked = selectedItemsLength > 0 && selectedItemsLength === flattenedItemsWithoutPendingDelete.length;

    const getItemHeight = useMemo(
        () =>
            createItemHeightCalculator({
                isLargeScreenWidth,
                shouldUseNarrowLayout,
                type,
            }),
        [isLargeScreenWidth, shouldUseNarrowLayout, type],
    );

    const overrideItemLayout = useCallback(
        (layout: {span?: number; size?: number}, item: SearchListItem) => {
            if (!layout) {
                return;
            }
            const height = getItemHeight(item);
            // eslint-disable-next-line no-param-reassign
            return (layout.size = height > 0 ? height : estimatedItemSize);
        },
        [getItemHeight, estimatedItemSize],
    );

    const calculatedListHeight = useMemo(() => {
        return initialHeight - variables.contentHeaderHeight;
    }, [initialHeight]);

    const calculatedListWidth = useMemo(() => {
        if (shouldUseNarrowLayout) {
            return initialWidth;
        }

        if (isLargeScreenWidth) {
            return initialWidth - variables.navigationTabBarSize - variables.sideBarWithLHBWidth;
        }

        return initialWidth;
    }, [initialWidth, shouldUseNarrowLayout, isLargeScreenWidth]);

    const estimatedListSize = useMemo(() => {
        return {
            height: calculatedListHeight,
            width: calculatedListWidth,
        };
    }, [calculatedListHeight, calculatedListWidth]);

    return (
        <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
            {tableHeaderVisible && (
                <View style={[styles.searchListHeaderContainerStyle, styles.listTableHeader]}>
                    {canSelectMultiple && (
                        <Checkbox
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={selectedItemsLength > 0 && selectedItemsLength !== flattenedItemsWithoutPendingDelete.length}
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
                            <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                        </PressableWithFeedback>
                    )}
                </View>
            )}

            <AnimatedFlashListComponent
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
                ref={listRef}
                extraData={focusedIndex}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                onViewableItemsChanged={onViewableItemsChanged}
                onLayout={onLayout}
                removeClippedSubviews
                drawDistance={1000}
                estimatedItemSize={estimatedItemSize}
                overrideItemLayout={overrideItemLayout}
                estimatedListSize={estimatedListSize}
                contentContainerStyle={contentContainerStyle}
                overrideProps={{estimatedHeightSize: calculatedListHeight}}
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={Expensicons.CheckSquare}
                    onPress={turnOnSelectionMode}
                />
            </Modal>
        </View>
    );
}

export default forwardRef(SearchList);
