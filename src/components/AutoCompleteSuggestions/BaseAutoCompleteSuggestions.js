import React, {useEffect, useRef} from 'react';
import Animated, {Easing, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
// We take FlatList from this package to properly handle the scrolling of AutoCompleteSuggestions in chats since one scroll is nested inside another
import {FlatList} from 'react-native-gesture-handler';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import CONST from '../../CONST';
import {propTypes} from './autoCompleteSuggestionsPropTypes';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';

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

    /**
     * This function is used to compute the layout of any given item in our list. Since we know that each item will have the exact same height, this is a performance optimization
     * so that the heights can be determined before the options are rendered. Otherwise, the heights are determined when each option is rendering and it causes a lot of overhead on large
     * lists.
     *
     * Also, `scrollToIndex` should be used in conjunction with `getItemLayout`, otherwise there is no way to know the location of offscreen indices or handle failures.
     *
     * @param {Array} data - This is the same as the data we pass into the component
     * @param {Number} index the current item's index in the set of data
     *
     * @returns {Object}
     */
    const getItemLayout = (data, index) => ({
        length: CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT,
        offset: index * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT,
        index,
    });

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
            <FlatList
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                data={props.suggestions}
                renderItem={renderSuggestionMenuItem}
                keyExtractor={props.keyExtractor}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={innerHeight > rowHeight.value}
                style={{flex: 1}}
                getItemLayout={getItemLayout}
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
