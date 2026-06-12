import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {GestureResponderEvent, NativeSyntheticEvent, StyleProp, ViewProps, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';
import {useEditingCellState} from '@components/TransactionItemRow/EditableCell';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useOnyx from '@hooks/useOnyx';
import useStableIndexedHandler from '@hooks/useStableIndexedHandler';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileChrome} from '@libs/Browser';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import {isFocusRestoreInProgress} from '@libs/NavigationFocusReturn';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isModalActiveSelector} from '@src/selectors/Modal';
import type BaseSearchListProps from './types';

const AnimatedFlashListComponent = Animated.createAnimatedComponent(FlashList<SearchListItem>);

type CellRendererComponentProps = ViewProps & {
    ref?: React.Ref<View>;
    style?: StyleProp<ViewStyle>;
};

function CellRendererComponent({children, ref, style, ...props}: CellRendererComponentProps) {
    const styles = useThemeStyles();

    return (
        <View
            ref={ref}
            {...props}
            // Keep the FlashList cell itself tracking the animated search pane width.
            style={[style, styles.w100]}
        >
            {children}
        </View>
    );
}

function BaseSearchList({
    data,
    columns,
    renderItem,
    onSelectRow,
    keyExtractor,
    onScroll,
    ref,
    scrollToIndex,
    onEndReached,
    onEndReachedThreshold,
    ListFooterComponent,
    onViewableItemsChanged,
    onLayout,
    contentContainerStyle,
    flattenedItemsLength,
    selectedTransactions,
    isAttendeesEnabledForMovingPolicy,
    nonPersonalAndWorkspaceCards,
    stickyHeaderIndices,
    getItemType,
}: BaseSearchListProps) {
    const hasKeyBeenPressed = useRef(false);
    const isFocused = useIsFocused();
    const {focusedCellId, isEditingCell} = useEditingCellState();

    const [isModalVisible] = useOnyx(ONYXKEYS.MODAL, {selector: isModalActiveSelector});

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
        maxIndex: flattenedItemsLength - 1,
        isActive: isFocused && !isModalVisible,
        onFocusedIndexChange: (index: number) => {
            scrollToIndex?.(index);
        },
        onArrowUpDownCallback: () => {
            ref?.current?.announceProgrammaticScroll();
        },
        setHasKeyBeenPressed,
        isFocused,
        captureOnInputs: false,
    });

    const handleFocusByIndex = (index: number, event: NativeSyntheticEvent<ExtendedTargetedEvent>) => {
        // The focus-return restore shouldn't move the keyboard cursor here, or the row gets highlighted and scrolled into view on back nav. The .focus() still restores DOM focus for screen readers.
        if (isFocusRestoreInProgress()) {
            return;
        }
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
    };
    const getOnFocus = useStableIndexedHandler(handleFocusByIndex);

    const renderItemWithKeyboardFocus = ({item, index}: {item: SearchListItem; index: number}) => {
        const isItemFocused = focusedIndex === index;
        return renderItem(item, index, isItemFocused, getOnFocus(index));
    };

    const selectFocusedOption = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            // Allow event propagation during cell editing so Enter can trigger TextInput.onSubmitEditing.
            // When not editing, stop propagation to prevent unintended button activation and handle row selection.
            if (isEditingCell) {
                return;
            }

            // If a cell has keyboard focus (via Tab), let the Enter event propagate to trigger the cell's onPress
            if (focusedCellId) {
                return;
            }

            event?.stopPropagation();

            const focusedItem = data.at(focusedIndex);

            if (!focusedItem) {
                return;
            }

            onSelectRow(focusedItem);
        },
        [data, focusedCellId, focusedIndex, isEditingCell, onSelectRow],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: false,
        shouldPreventDefault: false,
        isActive: isFocused && focusedIndex >= 0 && !isModalVisible,
        // Propagation is controlled manually in selectFocusedOption based on editing state
        shouldStopPropagation: false,
    });

    useEffect(() => {
        addKeyDownPressListener(setHasKeyBeenPressed);

        return () => removeKeyDownPressListener(setHasKeyBeenPressed);
    }, [setHasKeyBeenPressed]);

    const extraData = useMemo(
        () => [focusedIndex, columns, selectedTransactions, nonPersonalAndWorkspaceCards, isAttendeesEnabledForMovingPolicy],
        [focusedIndex, columns, selectedTransactions, nonPersonalAndWorkspaceCards, isAttendeesEnabledForMovingPolicy],
    );

    return (
        <AnimatedFlashListComponent
            data={data}
            renderItem={renderItemWithKeyboardFocus}
            keyExtractor={keyExtractor}
            onScroll={onScroll}
            showsVerticalScrollIndicator={false}
            ref={ref}
            extraData={extraData}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            ListFooterComponent={ListFooterComponent}
            onViewableItemsChanged={onViewableItemsChanged}
            onLayout={onLayout}
            CellRendererComponent={CellRendererComponent}
            removeClippedSubviews
            drawDistance={250}
            contentContainerStyle={contentContainerStyle}
            maintainVisibleContentPosition={{disabled: true}}
            stickyHeaderIndices={stickyHeaderIndices}
            getItemType={getItemType}
        />
    );
}

export default BaseSearchList;
