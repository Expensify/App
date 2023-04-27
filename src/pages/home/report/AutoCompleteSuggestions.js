import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';

// We take FlatList from this package to properly handle the scrolling of AutoCompleteSuggestions in chats since one scroll is nested inside another
import {FlatList} from 'react-native-gesture-handler';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import CONST from '../../../CONST';

const propTypes = {
    /** Array of suggestions */
    // eslint-disable-next-line react/forbid-prop-types
    suggestions: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Function used to render each suggestion, returned JSX will be enclosed inside a Pressable component */
    renderSuggestionMenuItem: PropTypes.func.isRequired,

    /** Create unique keys for each suggestion item */
    keyExtractor: PropTypes.func.isRequired,

    /** The index of the highlighted suggestion */
    highlightedSuggestionIndex: PropTypes.number.isRequired,

    /** Fired when the user selects a suggestion */
    onSelect: PropTypes.func.isRequired,

    /** Show that we can use large auto-complete suggestion picker.
     * Depending on available space and whether the input is expanded, we can have a small or large mention suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isSuggestionPickerLarge: PropTypes.bool.isRequired,

    /** Show that we should include ReportRecipientLocalTime view height */
    shouldIncludeReportRecipientLocalTimeHeight: PropTypes.bool.isRequired,
};

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

const AutoCompleteSuggestions = (props) => {
    /**
     * Render a suggestion menu item component.
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     * @returns {JSX.Element}
     */
    const renderSuggestionMenuItem = ({item, index}) => (
        <Pressable
            style={({hovered}) => StyleUtils.getAutoCompleteSuggestionItemStyle(
                props.highlightedSuggestionIndex,
                CONST.AUTO_COMPLETE_SUGGESTER.ITEM_HEIGHT,
                hovered,
                index,
            )}
            onMouseDown={e => e.preventDefault()}
            onPress={() => props.onSelect(index)}
        >
            {props.renderSuggestionMenuItem(item, index)}
        </Pressable>
    );

    const rowHeight = measureHeightOfSuggestionRows(
        props.suggestions.length,
        props.isSuggestionPickerLarge,
    );

    return (
        <View
            style={[
                styles.autoCompleteSuggestionsContainer,
                StyleUtils.getAutoCompleteSuggestionContainerStyle(
                    rowHeight,
                    props.shouldIncludeReportRecipientLocalTimeHeight,
                ),
            ]}
        >
            <FlatList
                keyboardShouldPersistTaps="handled"
                data={props.suggestions}
                renderItem={renderSuggestionMenuItem}
                keyExtractor={props.keyExtractor}
                style={{height: rowHeight}}
            />
        </View>
    );
};

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
