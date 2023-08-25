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
import refPropType from './refPropTypes';

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

    /** Ref of the container enclosing the menu.
     * This is needed to render the menu in correct position inside a portal
     */
    containerRef: refPropType,
};

const defaultProps = {
    highlightedMentionIndex: 0,
    containerRef: {
        current: null,
    },
};

/**
 * Create unique keys for each mention item
 * @param {Object} item
 * @param {Number} index
 * @returns {String}
 */
const keyExtractor = (item) => item.alternateText;

function MentionSuggestions(props) {
    /**
     * Render a suggestion menu item component.
     * @param {Object} item
     * @returns {JSX.Element}
     */
    const renderSuggestionMenuItem = (item) => {
        const isIcon = item.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT;
        const styledDisplayName = getStyledTextArray(item.text, props.prefix);
        const styledHandle = item.text === item.alternateText ? '' : getStyledTextArray(item.alternateText, props.prefix);

        return (
            <View style={[styles.autoCompleteSuggestionContainer, styles.ph2]}>
                <View style={styles.mentionSuggestionsAvatarContainer}>
                    <Avatar
                        source={item.icons[0].source}
                        size={isIcon ? CONST.AVATAR_SIZE.MENTION_ICON : CONST.AVATAR_SIZE.SMALLER}
                        name={item.icons[0].name}
                        type={item.icons[0].type}
                        fill={styles.success}
                    />
                </View>
                <Text
                    style={[styles.mentionSuggestionsText, styles.flexShrink1]}
                    numberOfLines={1}
                >
                    {_.map(styledDisplayName, ({text, isColored}, i) => (
                        <Text
                            key={`${text}${i}`}
                            style={[StyleUtils.getColoredBackgroundStyle(isColored), styles.mentionSuggestionsDisplayName]}
                        >
                            {text}
                        </Text>
                    ))}
                </Text>
                <Text
                    style={[styles.mentionSuggestionsText, styles.flex1]}
                    numberOfLines={1}
                >
                    {_.map(
                        styledHandle,
                        ({text, isColored}, i) =>
                            text !== '' && (
                                <Text
                                    key={`${text}${i}`}
                                    style={[StyleUtils.getColoredBackgroundStyle(isColored), styles.mentionSuggestionsHandle, {...(isColored && {color: styles.text})}]}
                                >
                                    {text}
                                </Text>
                            ),
                    )}
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
            accessibilityLabelExtractor={keyExtractor}
            parentContainerRef={props.containerRef}
        />
    );
}

MentionSuggestions.propTypes = propTypes;
MentionSuggestions.defaultProps = defaultProps;
MentionSuggestions.displayName = 'MentionSuggestions';

export default MentionSuggestions;
