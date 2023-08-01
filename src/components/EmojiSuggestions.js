import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import * as EmojiUtils from '../libs/EmojiUtils';
import Text from './Text';
import getStyledTextArray from '../libs/GetStyledTextArray';
import AutoCompleteSuggestions from './AutoCompleteSuggestions';

const propTypes = {
    /** The index of the highlighted emoji */
    highlightedEmojiIndex: PropTypes.number,

    /** Array of suggested emoji */
    emojis: PropTypes.arrayOf(
        PropTypes.shape({
            /** The emoji code */
            code: PropTypes.string.isRequired,

            /** The name of the emoji */
            name: PropTypes.string.isRequired,

            /** Array of different skin tone variants.
             * If provided, it will be indexed with props.preferredSkinToneIndex */
            types: PropTypes.arrayOf(PropTypes.string.isRequired),
        }),
    ).isRequired,

    /** Fired when the user selects an emoji */
    onSelect: PropTypes.func.isRequired,

    /** Emoji prefix that follows the colon */
    prefix: PropTypes.string.isRequired,

    /** Show that we can use large emoji picker. Depending on available space
     * and whether the input is expanded, we can have a small or large emoji
     * suggester. When this value is false, the suggester will have a height of
     * 2.5 items. When this value is true, the height can be up to 5 items.  */
    isEmojiPickerLarge: PropTypes.bool.isRequired,

    /** Show that we should include ReportRecipientLocalTime view height */
    shouldIncludeReportRecipientLocalTimeHeight: PropTypes.bool.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinToneIndex: PropTypes.number.isRequired,
};

const defaultProps = {highlightedEmojiIndex: 0};

/**
 * Create unique keys for each emoji item
 * @param {Object} item
 * @param {Number} index
 * @returns {String}
 */
const keyExtractor = (item, index) => `${item.name}+${index}}`;

function EmojiSuggestions(props) {
    /**
     * Render an emoji suggestion menu item component.
     * @param {Object} item
     * @returns {JSX.Element}
     */
    const renderSuggestionMenuItem = (item) => {
        const styledTextArray = getStyledTextArray(item.name, props.prefix);

        return (
            <View style={styles.autoCompleteSuggestionContainer}>
                <Text style={styles.emojiSuggestionsEmoji}>{EmojiUtils.getEmojiCodeWithSkinColor(item, props.preferredSkinToneIndex)}</Text>
                <Text
                    numberOfLines={2}
                    style={styles.emojiSuggestionsText}
                >
                    :
                    {_.map(styledTextArray, ({text, isColored}, i) => (
                        <Text
                            key={`${text}+${i}`}
                            style={StyleUtils.getColoredBackgroundStyle(isColored)}
                        >
                            {text}
                        </Text>
                    ))}
                    :
                </Text>
            </View>
        );
    };

    return (
        <AutoCompleteSuggestions
            suggestions={props.emojis}
            renderSuggestionMenuItem={renderSuggestionMenuItem}
            keyExtractor={keyExtractor}
            highlightedSuggestionIndex={props.highlightedEmojiIndex}
            onSelect={props.onSelect}
            isSuggestionPickerLarge={props.isEmojiPickerLarge}
            shouldIncludeReportRecipientLocalTimeHeight={props.shouldIncludeReportRecipientLocalTimeHeight}
            accessibilityLabelExtractor={keyExtractor}
        />
    );
}

EmojiSuggestions.propTypes = propTypes;
EmojiSuggestions.defaultProps = defaultProps;
EmojiSuggestions.displayName = 'EmojiSuggestions';

export default EmojiSuggestions;
