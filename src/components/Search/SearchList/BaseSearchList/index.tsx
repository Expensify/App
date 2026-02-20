import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useMemo} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ExtendedTargetedEvent, SearchListItem} from '@components/SelectionListWithSections/types';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {isMobileChrome} from '@libs/Browser';
import CONST from '@src/CONST';
import type BaseSearchListProps from './types';

const AnimatedFlashListComponent = Animated.createAnimatedComponent(FlashList<SearchListItem>);

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
    newTransactions,
    selectedTransactions,
    customCardNames,
}: BaseSearchListProps) {
    const isFocused = useIsFocused();

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: flattenedItemsLength - 1,
        isActive: isFocused,
        onFocusedIndexChange: (index: number) => {
            scrollToIndex?.(index);
        },
        isFocused,
        captureOnInputs: false,
    });

    const renderItemWithKeyboardFocus = useCallback(
        ({item, index}: {item: SearchListItem; index: number}) => {
            const isItemFocused = focusedIndex === index;

            const onFocus = (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => {
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
            return renderItem(item, index, isItemFocused, onFocus);
        },
        [focusedIndex, renderItem, setFocusedIndex],
    );

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

    const extraData = useMemo(() => [columns, newTransactions, selectedTransactions, customCardNames], [columns, newTransactions, selectedTransactions, customCardNames]);

    return (
        <AnimatedFlashListComponent
            data={data}
            renderItem={renderItemWithKeyboardFocus}
            keyExtractor={keyExtractor}
            onScroll={onScroll}
            showsVerticalScrollIndicator
            ref={ref}
            extraData={extraData}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            ListFooterComponent={ListFooterComponent}
            onViewableItemsChanged={onViewableItemsChanged}
            onLayout={onLayout}
            removeClippedSubviews
            drawDistance={1000}
            contentContainerStyle={contentContainerStyle}
            maintainVisibleContentPosition={{disabled: true}}
        />
    );
}

export default BaseSearchList;
