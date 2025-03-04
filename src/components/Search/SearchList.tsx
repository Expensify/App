import {useIsFocused} from '@react-navigation/native';
import type {ContentStyle, FlashListProps, ListRenderItemInfo} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import React, {type Component, type ForwardedRef, forwardRef, type LegacyRef, type ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {type NativeScrollEvent, type NativeSyntheticEvent, type StyleProp, StyleSheet, View, type ViewStyle} from 'react-native';
import Animated, {type AnimatedProps} from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {PressableWithFeedback} from '@components/Pressable';
import type {ListItem, ReportActionListItemType, ReportListItemType, TransactionListItemType, ValidListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import variables from '@styles/variables';
import CONST from '@src/CONST';

const AnimatedFlashList = Animated.createAnimatedComponent<FlashListProps<SearchListItem>>(FlashList<SearchListItem>);
type SearchListItem = TransactionListItemType | ReportListItemType | ReportActionListItemType;

type SearchListHandle = {
    scrollAndHighlightItem?: (items: string[]) => void;
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type SearchListProps = {
    data: SearchListItem[];

    /** Default renderer for every item in the list */
    ListItem: ValidListItem;

    SearchTableHeader?: React.JSX.Element;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: SearchListItem) => void;

    /** Whether this is a multi-select list */
    canSelectMultiple: boolean;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: SearchListItem) => void;

    /** Callback to fire when "Select All" checkbox is pressed. Only use along with `canSelectMultiple` */
    onAllCheckboxPress?: () => void;

    /** Callback to fire when the list is scrolled */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Additional styles to apply to scrollable content */
    contentContainerStyle?: StyleProp<ContentStyle>;

    /**
     * How far from the end (in units of visible length of the list) the bottom edge of the
     * list must be from the end of the content to trigger the `onEndReached` callback.
     * Thus a value of 0.5 will trigger `onEndReached` when the end of the content is
     * within half the visible length of the list.
     */
    onEndReachedThreshold?: number;

    /** Called once when the scroll position gets within onEndReachedThreshold of the rendered content. */
    onEndReached?: () => void;

    /** Styles to apply to SelectionList container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Custom content to display in the footer of list component. If present ShowMore button won't be displayed */
    ListFooterComponent?: React.JSX.Element | null;
};

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
    }: SearchListProps,
    ref: ForwardedRef<SearchListHandle>,
) {
    const styles = useThemeStyles();
    const selectedItemsLength = data.reduce((acc, item) => (item.isSelected ? acc + 1 : acc), 0);
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const listRef = useRef<FlashList<SearchListItem>>(null);
    const hasKeyBeenPressed = useRef(false);
    const [itemsToHighlight, setItemsToHighlight] = useState<Set<string> | null>(null);
    const itemFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useStyledSafeAreaInsets();

    // _______________________________________ selection modal logic _______________________________________
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<SearchListItem>();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {selectionMode} = useMobileSelectionMode(true);
    // Check if selection should be on when the modal is opened
    const wasSelectionOnRef = useRef(false);
    // Keep track of the number of selected items to determine if we should turn off selection mode
    const selectionRef = useRef(0);

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
            if (!isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox || !isFocused) {
                // TODO: check if it works I deleted some conditions
                return;
            }
            setLongPressedItem(item);
            setIsModalVisible(true);
        },
        [isFocused, isSmallScreenWidth],
    );

    const turnOnSelectionMode = () => {
        turnOnMobileSelectionMode();
        setIsModalVisible(false);

        if (onCheckboxPress && longPressedItem) {
            onCheckboxPress?.(longPressedItem);
        }
    };
    // _______________________________________ selection modal logic _______________________________________

    // _______________________________________ arrow navigation logic _______________________________________

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
        maxIndex: data.length - 1,
        isActive: isFocused,
        onFocusedIndexChange: (index: number) => {
            scrollToIndex(index);
        },
        ...(!hasKeyBeenPressed.current && {setHasKeyBeenPressed}),
        isFocused,
    });

    const selectFocusedOption = () => {
        const focusedItem = data?.[focusedIndex];

        if (!focusedItem) {
            return;
        }

        onSelectRow(focusedItem);
    };

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

    // _______________________________________ arrow navigation logic _______________________________________

    // _______________________________________ arrow navigation logic _______________________________________

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

    // _______________________________________ arrow navigation logic _______________________________________

    const renderItem = useCallback(
        (info: ListRenderItemInfo<SearchListItem>) => {
            const isItemFocused = focusedIndex === info.index;
            const isItemHighlighted = !!itemsToHighlight?.has(info.item.keyForList ?? '');

            return (
                <ListItem
                    showTooltip={false}
                    isFocused={isItemFocused}
                    onSelectRow={onSelectRow}
                    onLongPressRow={handleLongPressRow}
                    onCheckboxPress={onCheckboxPress}
                    canSelectMultiple={canSelectMultiple}
                    item={info.item}
                />
            );
        },
        [ListItem, canSelectMultiple, focusedIndex, handleLongPressRow, onCheckboxPress, onSelectRow],
    );

    return (
        <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
            {canSelectMultiple && (
                <View style={[styles.userSelectNone, styles.peopleRow, styles.ph5, styles.pb3, styles.ph8, styles.pt3, styles.selectionListStickyHeader, styles.justifyContentStart]}>
                    <Checkbox
                        accessibilityLabel="TODO"
                        isChecked={selectedItemsLength === data.length}
                        onPress={() => {
                            listRef.current?.scrollToIndex({index: 0, animated: true});
                        }}
                    />
                    {SearchTableHeader ?? (
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={onAllCheckboxPress}
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            role="button"
                            accessibilityState={{checked: selectedItemsLength === data.length}}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                        </PressableWithFeedback>
                    )}
                </View>
            )}
            <AnimatedFlashList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.keyForList ?? `${index}`}
                estimatedItemSize={108}
                onScroll={onScroll}
                contentContainerStyle={StyleSheet.flatten(contentContainerStyle)} // We have to use flatten, because FlashList doesn't handle array styles
                showsVerticalScrollIndicator={false}
                ref={listRef}
                extraData={focusedIndex}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                removeClippedSubviews // TODO measure how it helps performance
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={Expensicons.Checkmark}
                    onPress={turnOnSelectionMode}
                />
            </Modal>
        </View>
    );
}

export default forwardRef(SearchList);
// TODO fix styles in Header VIew
