import React from 'react';
import {View, Pressable} from 'react-native';

// We take FlatList from this package to properly handle the scrolling of AutoCompleteSuggestions in chats since one scroll is nested inside another
import {FlatList} from 'react-native-gesture-handler';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import CONST from '../../CONST';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

/**
 * @param {Number} numRows
 * @param {Boolean} isSuggestionPickerLarge
 * @returns {Number}
 */
const measureHeightOfSuggestionRows = (numRows, isSuggestionPickerLarge) => {
    if (isSuggestionPickerLarge) {
        return numRows * CONST.AUTO_COMPLETE_SUGGESTER.ITEM_HEIGHT;
    }
    if (numRows > 2) {
        // On small screens, we display a scrollable window with a height of 2.5 items, indicating that there are more items available beyond what is currently visible
        return CONST.AUTO_COMPLETE_SUGGESTER.SMALL_CONTAINER_HEIGHT_FACTOR * CONST.AUTO_COMPLETE_SUGGESTER.ITEM_HEIGHT;
    }
    return numRows * CONST.AUTO_COMPLETE_SUGGESTER.ITEM_HEIGHT;
};

const BaseAutoCompleteSuggestions = (props) => {
    /**
     * Render a suggestion menu item component.
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     * @returns {JSX.Element}
     */
    const renderSuggestionMenuItem = ({item, index}) => (
        <Pressable
            style={({hovered}) => StyleUtils.getAutoCompleteSuggestionItemStyle(props.highlightedSuggestionIndex, CONST.AUTO_COMPLETE_SUGGESTER.ITEM_HEIGHT, hovered, index)}
            onMouseDown={(e) => e.preventDefault()}
            onPress={() => props.onSelect(index)}
            onLongPress={() => {}}
        >
            {props.renderSuggestionMenuItem(item, index)}
        </Pressable>
    );

    const rowHeight = measureHeightOfSuggestionRows(props.suggestions.length, props.isSuggestionPickerLarge);

    return (
        <View
            ref={props.forwardedRef}
            style={[styles.autoCompleteSuggestionsContainer, StyleUtils.getAutoCompleteSuggestionContainerStyle(rowHeight, props.shouldIncludeReportRecipientLocalTimeHeight)]}
        >
            <FlatList
                keyboardShouldPersistTaps="handled"
                data={props.suggestions}
                renderItem={renderSuggestionMenuItem}
                keyExtractor={props.keyExtractor}
                removeClippedSubviews={false}
                style={{height: rowHeight}}
            />
        </View>
    );
};

BaseAutoCompleteSuggestions.propTypes = propTypes;
BaseAutoCompleteSuggestions.displayName = 'BaseAutoCompleteSuggestions';

export default React.forwardRef((props, ref) => (
    <BaseAutoCompleteSuggestions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
