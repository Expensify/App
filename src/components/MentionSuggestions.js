import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import Text from './Text';
import CONST from '../CONST';
import Avatar from './Avatar';
import AutoCompleteSuggestions from './AutoCompleteSuggestions';
import getStyledTextArray from '../libs/GetStyledTextArray';
import avatarPropTypes from './avatarPropTypes';

const propTypes = {
    /** The index of the highlighted mention */
    highlightedMentionIndex: PropTypes.number,

    /** Array of suggested mentions */
    mentions: PropTypes.arrayOf(
        PropTypes.shape({
            /** Display name of the user */
            text: PropTypes.string,

            /** Email/phone number of the user */
            alternateText: PropTypes.string,

            /** Array of icons of the user. We use the first element of this array */
            icons: PropTypes.arrayOf(avatarPropTypes),
        }),
    ).isRequired,

    /** Fired when the user selects an mention */
    onSelect: PropTypes.func.isRequired,

    /** Mention prefix that follows the @ sign  */
    prefix: PropTypes.string.isRequired,

    /** Show that we can use large mention picker.
     * Depending on available space and whether the input is expanded, we can have a small or large mention suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isMentionPickerLarge: PropTypes.bool.isRequired,

    /** Show that we should include ReportRecipientLocalTime view height */
    shouldIncludeReportRecipientLocalTimeHeight: PropTypes.bool.isRequired,
};

const defaultProps = {
    highlightedMentionIndex: 0,
};

/**
 * Create unique keys for each mention item
 * @param {Object} item
 * @param {Number} index
 * @returns {String}
 */
const keyExtractor = (item) => item.alternateText;

const MentionSuggestions = (props) => {
    /**
     * Render a suggestion menu item component.
     * @param {Object} item
     * @returns {JSX.Element}
     */
    const renderSuggestionMenuItem = (item) => {
        const displayedText = _.uniq([item.text, item.alternateText]).join(' - ');
        const styledTextArray = getStyledTextArray(displayedText, props.prefix);

        return (
            <View style={[styles.autoCompleteSuggestionContainer, styles.ph2]}>
                <Avatar
                    source={item.icons[0].source}
                    size={CONST.AVATAR_SIZE.SMALLER}
                    name={item.icons[0].name}
                    type={item.icons[0].type}
                />
                <Text
                    style={styles.mentionSuggestionsText}
                    numberOfLines={1}
                >
                    {_.map(styledTextArray, ({text, isColored}, i) => (
                        <Text
                            key={`${text}${i}`}
                            style={StyleUtils.getColoredBackgroundStyle(isColored)}
                        >
                            {text}
                        </Text>
                    ))}
                </Text>
            </View>
        );
    };

    return (
        <AutoCompleteSuggestions
            suggestions={props.mentions}
            renderSuggestionMenuItem={renderSuggestionMenuItem}
            keyExtractor={keyExtractor}
            highlightedSuggestionIndex={props.highlightedMentionIndex}
            onSelect={props.onSelect}
            isSuggestionPickerLarge={props.isMentionPickerLarge}
            shouldIncludeReportRecipientLocalTimeHeight={props.shouldIncludeReportRecipientLocalTimeHeight}
        />
    );
};

MentionSuggestions.propTypes = propTypes;
MentionSuggestions.defaultProps = defaultProps;
MentionSuggestions.displayName = 'MentionSuggestions';

export default MentionSuggestions;
