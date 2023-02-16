import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';

// We take FlatList from this package to properly handle the scrolling of EmojiSuggestions in chats since one scroll is nested inside another
import {FlatList} from 'react-native-gesture-handler';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import Text from '../Text';
import colors from '../../styles/colors';
import CONST from '../../CONST';

const propTypes = {
    /** The index of the highlighted emoji */
    highlightedEmojiIndex: PropTypes.number,

    /** Array of suggested emoji */
    // eslint-disable-next-line react/forbid-prop-types
    emojis: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Fired when the user selects an emoji */
    onSelect: PropTypes.func.isRequired,

    /** Emoji prefix that follows the colon  */
    prefix: PropTypes.string.isRequired,

    /** Show that we can use large emoji picker.
     * Depending on available space and whether the input is expanded, we can have a small or large emoji suggester.
     * When this value is false suggester would have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isEmojiPickerLarge: PropTypes.bool.isRequired,

    /** Show that we should include ReportRecipientLocalTime view height */
    shouldIncludeReportRecipientLocalTimeHeight: PropTypes.bool.isRequired,
};

const defaultProps = {
    highlightedEmojiIndex: 0,
};

/**
 * Select the correct color for text.
 * @param {Boolean} isColored
 * @returns {String | null}
 */
const colorOfText = isColored => ({backgroundColor: isColored ? colors.yellow : null});

/**
 * Select name as key.
 * @param {Object} item
 * @returns {String}
 */
const keyExtractor = item => item.name;

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
 * Render a suggestion menu item component.
 * @param {String} name
 * @param {String} prefix
 * @returns {Array}
 */
const getStyledTextArray = (name, prefix) => {
    const texts = [];
    const prefixLocation = name.search(prefix);

    if (prefixLocation === 0 && prefix.length === name.length) {
        texts.push({text: prefix, isColored: true});
    } else if (prefixLocation === 0 && prefix.length !== name.length) {
        texts.push(
            {text: name.slice(0, prefix.length), isColored: true},
            {text: name.slice(prefix.length), isColored: false},
        );
    } else if (prefixLocation > 0 && prefix.length !== name.length) {
        texts.push(
            {text: name.slice(0, prefixLocation), isColored: false},
            {
                text: name.slice(prefixLocation, prefixLocation + prefix.length),
                isColored: true,
            },
            {
                text: name.slice(prefixLocation + prefix.length),
                isColored: false,
            },
        );
    } else {
        texts.push({text: name, isColored: false});
    }
    return texts;
};

const EmojiSuggestions = (props) => {
    /**
     * Render a suggestion menu item component.
     * @param {Object} item
     * @param {Number} index
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
                    <Text style={[styles.emojiSuggestionsText]}>{item.code}</Text>
                    <Text style={[styles.emojiSuggestionsText]}>
                        :
                        {_.map(styledTextArray, ({text, isColored}, i) => (
                            <Text key={i} style={colorOfText(isColored)}>
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
