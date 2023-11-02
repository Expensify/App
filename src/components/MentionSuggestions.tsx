import React from 'react';
import {View} from 'react-native';
import getStyledTextArray from '@libs/GetStyledTextArray';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import AutoCompleteSuggestions from './AutoCompleteSuggestions';
import Avatar from './Avatar';
import AvatarType from './AvatarType';
import Text from './Text';

type Mention = {
    /** Display name of the user */
    text: string;

    /** Email/phone number of the user */
    alternateText: string;

    /** Array of icons of the user. We use the first element of this array */
    icons: AvatarType[];
};

type MentionSuggestionsProps = {
    /** The index of the highlighted mention */
    highlightedMentionIndex?: number;

    /** Array of suggested mentions */
    mentions: Mention[];

    /** Fired when the user selects an mention */
    onSelect: () => void;

    /** Mention prefix that follows the @ sign  */
    prefix: string;

    /** Show that we can use large mention picker.
     * Depending on available space and whether the input is expanded, we can have a small or large mention suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isMentionPickerLarge: boolean;

    /** Meaures the parent container's position and dimensions. */
    measureParentContainer: () => void;
};

/**
 * Create unique keys for each mention item
 * @param item
 * @param index
 */
const keyExtractor = (item: Mention) => item.alternateText;

function MentionSuggestions({prefix, mentions, highlightedMentionIndex = 0, onSelect, isMentionPickerLarge, measureParentContainer = () => {}}: MentionSuggestionsProps) {
    /**
     * Render a suggestion menu item component.
     * @param item
     */
    const renderSuggestionMenuItem = (item: Mention) => {
        const isIcon = item.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT;
        const styledDisplayName = getStyledTextArray(item.text, prefix);
        const styledHandle = item.text === item.alternateText ? '' : getStyledTextArray(item.alternateText, prefix);

        return (
            <View style={[styles.autoCompleteSuggestionContainer, styles.ph2]}>
                <View style={styles.mentionSuggestionsAvatarContainer}>
                    <Avatar
                        source={item.icons[0].source}
                        size={isIcon ? CONST.AVATAR_SIZE.MENTION_ICON : CONST.AVATAR_SIZE.SMALLER}
                        name={item.icons[0].name}
                        type={item.icons[0].type}
                        fill={themeColors.success}
                        fallbackIcon={item.icons[0].fallbackIcon}
                    />
                </View>
                <Text
                    style={[styles.mentionSuggestionsText, styles.flexShrink1]}
                    numberOfLines={1}
                >
                    {styledDisplayName.map(({text, isColored}, i) => (
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
                    {styledHandle &&
                        styledHandle.map(
                            ({text, isColored}, i) =>
                                Boolean(text) && (
                                    <Text
                                        key={`${text}${i}`}
                                        style={[StyleUtils.getColoredBackgroundStyle(isColored), styles.mentionSuggestionsHandle]}
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
            suggestions={mentions}
            renderSuggestionMenuItem={renderSuggestionMenuItem}
            keyExtractor={keyExtractor}
            highlightedSuggestionIndex={highlightedMentionIndex}
            onSelect={onSelect}
            isSuggestionPickerLarge={isMentionPickerLarge}
            accessibilityLabelExtractor={keyExtractor}
            measureParentContainer={measureParentContainer}
        />
    );
}

MentionSuggestions.displayName = 'MentionSuggestions';

export default MentionSuggestions;
