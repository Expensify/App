import {useIsFocused} from '@react-navigation/native';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {FlatList, ListRenderItemInfo, NativeSyntheticEvent, StyleProp, ViewStyle, ViewToken} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated from 'react-native-reanimated';
import type {FlatListPropsWithLayout} from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {PressableWithFeedback} from '@components/Pressable';
import type ChatListItem from '@components/SelectionList/ChatListItem';
import type ReportListItem from '@components/SelectionList/Search/ReportListItem';
import type TaskListItem from '@components/SelectionList/Search/TaskListItem';
import type TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ExtendedTargetedEvent, ReportActionListItemType, ReportListItemType, TaskListItemType, TransactionListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {isMobileChrome} from '@libs/Browser';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type SearchListItem = TransactionListItemType | ReportListItemType | ReportActionListItemType | TaskListItemType;
type SearchListItemComponentType = typeof TransactionListItem | typeof ChatListItem | typeof ReportListItem | typeof TaskListItem;

type SearchListHandle = {
    scrollAndHighlightItem?: (items: string[]) => void;
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type SearchListProps = Pick<FlatListPropsWithLayout<SearchListItem>, 'onScroll' | 'contentContainerStyle' | 'onEndReached' | 'onEndReachedThreshold' | 'ListFooterComponent'> & {
    data: SearchListItem[];

    /** Default renderer for every item in the list */
    ListItem: SearchListItemComponentType;

    SearchTableHeader?: React.JSX.Element;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: SearchListItem, isOpenedAsReport?: boolean) => void;

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

    /** The hash of the queryJSON */
    queryJSONHash: number;

    /** Whether to group the list by reports */
    shouldGroupByReports?: boolean;

    /** Called when the viewability of rows changes, as defined by the viewabilityConfig prop. */
    onViewableItemsChanged?: (info: {changed: ViewToken[]; viewableItems: ViewToken[]}) => void;

    /** Invoked on mount and layout changes */
    onLayout?: () => void;
};

const onScrollToIndexFailed = () => {};

function SearchList(
    {
        data,
        ListItem,
        SearchTableHeader,
        onSelectRow,
        onCheckboxPress,
        canSelectMultiple,
        onScroll,
        onAllCheckboxPress,
        contentContainerStyle,
        onEndReachedThreshold,
        onEndReached,
        containerStyle,
        ListFooterComponent,
        shouldPreventDefaultFocusOnSelectRow,
        shouldPreventLongPressRow,
        queryJSONHash,
        shouldGroupByReports,
        onViewableItemsChanged,
        onLayout,
    }: SearchListProps,
    ref: ForwardedRef<SearchListHandle>,
) {
    const styles = useThemeStyles();
    const flattenedTransactions = shouldGroupByReports ? (data as ReportListItemType[]).flatMap((item) => item.transactions) : data;
    const selectedItemsLength = flattenedTransactions.reduce((acc, item) => {
        return item.isSelected ? acc + 1 : acc;
    }, 0);
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const listRef = useRef<FlatList<SearchListItem>>(null);
    const hasKeyBeenPressed = useRef(false);
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);
    const itemFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const {selectionMode} = useMobileSelectionMode();
    const [longPressedItem, setLongPressedItem] = useState<SearchListItem>();
    // Check if selection should be on when the modal is opened
    const wasSelectionOnRef = useRef(false);
    // Keep track of the number of selected items to determine if we should turn off selection mode
    const selectionRef = useRef(0);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
    });

    useEffect(() => {
        selectionRef.current = selectedItemsLength;

        if (!isSmallScreenWidth) {
            if (selectedItemsLength === 0) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (!isFocused) {
            return;
        }
        if (!wasSelectionOnRef.current && selectedItemsLength > 0) {
            wasSelectionOnRef.current = true;
        }
        if (selectedItemsLength > 0 && !selectionMode?.isEnabled) {
            turnOnMobileSelectionMode();
        } else if (selectedItemsLength === 0 && selectionMode?.isEnabled && !wasSelectionOnRef.current) {
            turnOffMobileSelectionMode();
        }
    }, [selectionMode, isSmallScreenWidth, isFocused, selectedItemsLength]);

    useEffect(
        () => () => {
            if (selectionRef.current !== 0) {
                return;
            }
            turnOffMobileSelectionMode();
        },
        [],
    );

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
            if (selectionMode?.isEnabled) {
                onCheckboxPress(item);
                return;
            }
            setLongPressedItem(item);
            setIsModalVisible(true);
        },
        [isFocused, isSmallScreenWidth, onCheckboxPress, selectionMode?.isEnabled, shouldPreventLongPressRow],
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
        maxIndex: flattenedTransactions.length - 1,
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
        isActive: isFocused,
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
        ({item, index}: ListRenderItemInfo<SearchListItem>) => {
            const isItemFocused = focusedIndex === index;
            const isItemHighlighted = !!itemsToHighlight?.has(item.keyForList ?? '');

            return (
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
                    queryJSONHash={queryJSONHash}
                    policies={policies}
                />
            );
        },
        [
            ListItem,
            canSelectMultiple,
            focusedIndex,
            handleLongPressRow,
            itemsToHighlight,
            onCheckboxPress,
            onSelectRow,
            policies,
            queryJSONHash,
            setFocusedIndex,
            shouldPreventDefaultFocusOnSelectRow,
        ],
    );

    const tableHeaderVisible = canSelectMultiple || !!SearchTableHeader;
    const selectAllButtonVisible = canSelectMultiple && !SearchTableHeader;

    return (
        <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
            {tableHeaderVisible && (
                <View style={[styles.searchListHeaderContainerStyle, styles.listTableHeader]}>
                    {canSelectMultiple && (
                        <Checkbox
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            isChecked={flattenedTransactions.length > 0 && selectedItemsLength === flattenedTransactions.length}
                            isIndeterminate={selectedItemsLength > 0 && selectedItemsLength !== flattenedTransactions.length}
                            onPress={() => {
                                onAllCheckboxPress();
                            }}
                            disabled={flattenedTransactions.length === 0}
                        />
                    )}

                    {SearchTableHeader}

                    {selectAllButtonVisible && (
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={onAllCheckboxPress}
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            role="button"
                            accessibilityState={{checked: selectedItemsLength === flattenedTransactions.length}}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                        </PressableWithFeedback>
                    )}
                </View>
            )}

            <Animated.FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.keyForList ?? `${index}`}
                onScroll={onScroll}
                contentContainerStyle={contentContainerStyle}
                showsVerticalScrollIndicator={false}
                ref={listRef}
                extraData={focusedIndex}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                removeClippedSubviews
                onViewableItemsChanged={onViewableItemsChanged}
                onScrollToIndexFailed={onScrollToIndexFailed}
                onLayout={onLayout}
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
                shouldUseNewModal
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
