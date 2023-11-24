import {FlashList} from '@shopify/flash-list';
import React, {ForwardedRef, forwardRef, ReactElement, useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
// We take ScrollView from this package to properly handle the scrolling of AutoCompleteSuggestions in chats since one scroll is nested inside another
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {Easing, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import viewForwardedRef from '@src/types/utils/viewForwardedRef';
import type {AutoCompleteSuggestionsProps, RenderSuggestionMenuItemProps} from './types';

const measureHeightOfSuggestionRows = (numRows: number, isSuggestionPickerLarge: boolean): number => {
    if (isSuggestionPickerLarge) {
        if (numRows > CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER) {
            // On large screens, if there are more than 5 suggestions, we display a scrollable window with a height of 5 items, indicating that there are more items available
            return CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
        }
        return numRows * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    }
    if (numRows > 2) {
        // On small screens, we display a scrollable window with a height of 2.5 items, indicating that there are more items available beyond what is currently visible
        return CONST.AUTO_COMPLETE_SUGGESTER.SMALL_CONTAINER_HEIGHT_FACTOR * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    }
    return numRows * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
};

function BaseAutoCompleteSuggestions<TSuggestion>(
    {
        highlightedSuggestionIndex,
        onSelect,
        accessibilityLabelExtractor,
        renderSuggestionMenuItem,
        suggestions,
        isSuggestionPickerLarge,
        keyExtractor,
    }: AutoCompleteSuggestionsProps<TSuggestion>,
    ref: ForwardedRef<View | HTMLDivElement>,
) {
    const styles = useThemeStyles();
    const rowHeight = useSharedValue(0);
    const scrollRef = useRef<FlashList<TSuggestion>>(null);
    /**
     * Render a suggestion menu item component.
     */
    const renderItem = useCallback(
        ({item, index}: RenderSuggestionMenuItemProps<TSuggestion>): ReactElement => (
            <PressableWithFeedback
                style={({hovered}) => StyleUtils.getAutoCompleteSuggestionItemStyle(highlightedSuggestionIndex, CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT, hovered, index)}
                hoverDimmingValue={1}
                onMouseDown={(e) => e.preventDefault()}
                onPress={() => onSelect(index)}
                onLongPress={() => {}}
                accessibilityLabel={accessibilityLabelExtractor(item, index)}
            >
                {renderSuggestionMenuItem(item, index)}
            </PressableWithFeedback>
        ),
        [highlightedSuggestionIndex, renderSuggestionMenuItem, onSelect, accessibilityLabelExtractor],
    );

    const innerHeight = CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT * suggestions.length;
    const animatedStyles = useAnimatedStyle(() => StyleUtils.getAutoCompleteSuggestionContainerStyle(rowHeight.value));

    useEffect(() => {
        rowHeight.value = withTiming(measureHeightOfSuggestionRows(suggestions.length, isSuggestionPickerLarge), {
            duration: 100,
            easing: Easing.inOut(Easing.ease),
        });
    }, [suggestions.length, isSuggestionPickerLarge, rowHeight]);

    useEffect(() => {
        if (!scrollRef.current) {
            return;
        }
        scrollRef.current.scrollToIndex({index: highlightedSuggestionIndex, animated: true});
    }, [highlightedSuggestionIndex]);

    return (
        <Animated.View
            ref={viewForwardedRef(ref)}
            style={[styles.autoCompleteSuggestionsContainer, animatedStyles]}
            exiting={FadeOutDown.duration(100).easing(Easing.inOut(Easing.ease))}
        >
            <FlashList
                estimatedItemSize={CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT}
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                data={suggestions}
                renderItem={renderItem}
                renderScrollComponent={ScrollView}
                keyExtractor={keyExtractor}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={innerHeight > rowHeight.value}
                extraData={highlightedSuggestionIndex}
            />
        </Animated.View>
    );
}

BaseAutoCompleteSuggestions.displayName = 'BaseAutoCompleteSuggestions';

export default forwardRef(BaseAutoCompleteSuggestions);
