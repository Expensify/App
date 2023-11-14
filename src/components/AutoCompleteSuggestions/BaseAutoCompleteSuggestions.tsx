import React, {ForwardedRef, forwardRef, ReactElement, useEffect, useRef} from 'react';
import {FlatListProps} from 'react-native';
// We take FlatList from this package to properly handle the scrolling of AutoCompleteSuggestions in chats since one scroll is nested inside another
import {FlatList} from 'react-native-gesture-handler';
import Animated, {Easing, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import CONST from '@src/CONST';
import type AutoCompleteSuggestionsProps from './types';

type RenderSuggestionMenuItemProps<TSuggestion> = {
    item: TSuggestion;
    index: number;
};

type GetItemLayout<TSuggestion> = FlatListProps<TSuggestion>['getItemLayout'];

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
    ref: ForwardedRef<Animated.View | HTMLDivElement>,
) {
    const rowHeight = useSharedValue(0);
    const scrollRef = useRef<FlatList>(null);
    /**
     * Render a suggestion menu item component.
     */
    const renderItem = ({item, index}: RenderSuggestionMenuItemProps<TSuggestion>): ReactElement => (
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
    );

    /**
     * This function is used to compute the layout of any given item in our list. Since we know that each item will have the exact same height, this is a performance optimization
     * so that the heights can be determined before the options are rendered. Otherwise, the heights are determined when each option is rendering and it causes a lot of overhead on large
     * lists.
     *
     * Also, `scrollToIndex` should be used in conjunction with `getItemLayout`, otherwise there is no way to know the location of offscreen indices or handle failures.
     *
     * @param data - This is the same as the data we pass into the component
     * @param index the current item's index in the set of data
     */
    const getItemLayout: GetItemLayout<TSuggestion> = (data, index) => ({
        length: CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT,
        offset: index * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT,
        index,
    });

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
            ref={ref as ForwardedRef<Animated.View>}
            style={[styles.autoCompleteSuggestionsContainer, animatedStyles]}
            exiting={FadeOutDown.duration(100).easing(Easing.inOut(Easing.ease))}
        >
            <FlatList
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                data={suggestions}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={innerHeight > rowHeight.value}
                style={{flex: 1}}
                getItemLayout={getItemLayout}
            />
        </Animated.View>
    );
}

BaseAutoCompleteSuggestions.displayName = 'BaseAutoCompleteSuggestions';

export default forwardRef(BaseAutoCompleteSuggestions);
