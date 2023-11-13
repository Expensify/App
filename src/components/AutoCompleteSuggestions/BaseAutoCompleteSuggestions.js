import React, {useEffect, useRef} from 'react';
import {FlashList} from '@shopify/flash-list';
// We take ScrollView from this package to properly handle the scrolling of AutoCompleteSuggestions in chats since one scroll is nested inside another
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {Easing, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import CONST from '@src/CONST';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

/**
 * @param {Number} numRows
 * @param {Boolean} isSuggestionPickerLarge
 * @returns {Number}
 */
const measureHeightOfSuggestionRows = (numRows, isSuggestionPickerLarge) => {
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

function BaseAutoCompleteSuggestions(props) {
    const rowHeight = useSharedValue(0);
    const scrollRef = useRef(null);
    /**
     * Render a suggestion menu item component.
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     * @returns {JSX.Element}
     */
    const renderSuggestionMenuItem = ({item, index}) => (
        <PressableWithFeedback
            style={({hovered}) => StyleUtils.getAutoCompleteSuggestionItemStyle(props.highlightedSuggestionIndex, CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT, hovered, index)}
            hoverDimmingValue={1}
            onMouseDown={(e) => e.preventDefault()}
            onPress={() => props.onSelect(index)}
            onLongPress={() => {}}
            accessibilityLabel={props.accessibilityLabelExtractor(item, index)}
        >
            {props.renderSuggestionMenuItem(item, index)}
        </PressableWithFeedback>
    );

    const innerHeight = CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT * props.suggestions.length;
    const animatedStyles = useAnimatedStyle(() => StyleUtils.getAutoCompleteSuggestionContainerStyle(rowHeight.value));

    useEffect(() => {
        rowHeight.value = withTiming(measureHeightOfSuggestionRows(props.suggestions.length, props.isSuggestionPickerLarge), {
            duration: 100,
            easing: Easing.inOut(Easing.ease),
        });
    }, [props.suggestions.length, props.isSuggestionPickerLarge, rowHeight]);

    useEffect(() => {
        if (!scrollRef.current) {
            return;
        }
        scrollRef.current.scrollToIndex({index: props.highlightedSuggestionIndex, animated: true});
    }, [props.highlightedSuggestionIndex]);

    return (
        <Animated.View
            ref={props.forwardedRef}
            style={[styles.autoCompleteSuggestionsContainer, animatedStyles]}
            exiting={FadeOutDown.duration(100).easing(Easing.inOut(Easing.ease))}
        >
            <FlashList
                estimatedItemSize={CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT}
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                data={props.suggestions}
                renderItem={renderSuggestionMenuItem}
                renderScrollComponent={ScrollView}
                keyExtractor={props.keyExtractor}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={innerHeight > rowHeight.value}
            />
        </Animated.View>
    );
}

BaseAutoCompleteSuggestions.propTypes = propTypes;
BaseAutoCompleteSuggestions.displayName = 'BaseAutoCompleteSuggestions';

const BaseAutoCompleteSuggestionsWithRef = React.forwardRef((props, ref) => (
    <BaseAutoCompleteSuggestions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

BaseAutoCompleteSuggestionsWithRef.displayName = 'BaseAutoCompleteSuggestionsWithRef';

export default BaseAutoCompleteSuggestionsWithRef;
