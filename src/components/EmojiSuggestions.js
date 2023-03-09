import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';

// We take FlatList from this package to properly handle the scrolling of EmojiSuggestions in chats since one scroll is nested inside another
import {FlatList} from 'react-native-gesture-handler';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import * as EmojiUtils from '../libs/EmojiUtils';
import Text from './Text';
import CONST from '../CONST';
import getStyledTextArray from '../libs/GetStyledTextArray';

const propTypes = {
    /** The index of the highlighted emoji */
    highlightedEmojiIndex: PropTypes.number,

    /** Array of suggested emoji */
    emojis: PropTypes.arrayOf(PropTypes.shape({
        /** The emoji code */
        code: PropTypes.string,

        /** The name of the emoji */
        name: PropTypes.string,
    })).isRequired,

    /** Fired when the user selects an emoji */
    onSelect: PropTypes.func.isRequired,

    /** Emoji prefix that follows the colon  */
    prefix: PropTypes.string.isRequired,

    /** Show that we can use large emoji picker.
     * Depending on available space and whether the input is expanded, we can have a small or large emoji suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isEmojiPickerLarge: PropTypes.bool.isRequired,

    /** Show that we should include ReportRecipientLocalTime view height */
    shouldIncludeReportRecipientLocalTimeHeight: PropTypes.bool.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinToneIndex: PropTypes.number.isRequired,
};

const defaultProps = {
    highlightedEmojiIndex: 0,
};

/**
 * @param {Number} numRows
 * @param {Boolean} isEmojiPickerLarge
 * @returns {Number}
 */
const measureHeightOfEmojiRows = (numRows, isEmojiPickerLarge) => {
    if (isEmojiPickerLarge) {
        return numRows * CONST.EMOJI_SUGGESTER.ITEM_HEIGHT;
    }
    if (numRows > 2) {
        // on small screens, we display a scrollable window with a height of 2.5 items, indicating that there are more items available beyond what is currently visible
        return CONST.EMOJI_SUGGESTER.SMALL_CONTAINER_HEIGHT_FACTOR * CONST.EMOJI_SUGGESTER.ITEM_HEIGHT;
    }
    return numRows * CONST.EMOJI_SUGGESTER.ITEM_HEIGHT;
};

/**
 * Create unique keys for each emoji item
 * @param {Object} item
 * @param {Number} index
 * @returns {String}
 */
const keyExtractor = (item, index) => `${item.name}+${index}}`;

const EmojiSuggestions = (props) => {
    /**
     * Render a suggestion menu item component.
     * @param {Object} params.item
     * @param {Number} params.index
     * @returns {JSX.Element}
     */
    const renderSuggestionMenuItem = ({item, index}) => {
        const styledTextArray = getStyledTextArray(item.name, props.prefix);

        return (
            <Pressable
                style={({hovered}) => StyleUtils.getEmojiSuggestionItemStyle(
                    props.highlightedEmojiIndex,
                    CONST.EMOJI_SUGGESTER.ITEM_HEIGHT,
                    hovered,
                    index,
                )}
                onMouseDown={e => e.preventDefault()}
                onPress={() => props.onSelect(index)}
            >
                <View style={styles.emojiSuggestionContainer}>
                    <Text style={styles.emojiSuggestionsEmoji}>{EmojiUtils.getEmojiCodeWithSkinColor(item, props.preferredSkinToneIndex)}</Text>
                    <Text style={styles.emojiSuggestionsText}>
                        :
                        {_.map(styledTextArray, ({text, isColored}, i) => (
                            <Text key={`${text}+${i}`} style={StyleUtils.getColoredBackgroundStyle(isColored)}>
                                {text}
                            </Text>
                        ))}
                        :
                    </Text>
                </View>
            </Pressable>
        );
    };

    const rowHeight = measureHeightOfEmojiRows(
        props.emojis.length,
        props.isEmojiPickerLarge,
    );

    return (
        <View
            style={[
                styles.emojiSuggestionsContainer,
                StyleUtils.getEmojiSuggestionContainerStyle(
                    rowHeight,
                    props.shouldIncludeReportRecipientLocalTimeHeight,
                ),
            ]}
        >
            <FlatList
                keyboardShouldPersistTaps="handled"
                data={props.emojis}
                renderItem={renderSuggestionMenuItem}
                keyExtractor={keyExtractor}
                style={{height: rowHeight}}
            />
        </View>
    );
};

EmojiSuggestions.propTypes = propTypes;
EmojiSuggestions.defaultProps = defaultProps;
EmojiSuggestions.displayName = 'EmojiSuggestions';

export default EmojiSuggestions;
