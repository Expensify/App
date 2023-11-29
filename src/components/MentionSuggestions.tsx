import React from 'react';
import {View} from 'react-native';
import getStyledTextArray from '@libs/GetStyledTextArray';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import {Icon} from '@src/types/onyx/OnyxCommon';
import AutoCompleteSuggestions from './AutoCompleteSuggestions';
import Avatar from './Avatar';
import Text from './Text';

type Mention = {
    /** Display name of the user */
    text: string;

    /** The formatted email/phone number of the user */
    alternateText: string;

    /** Email/phone number of the user */
    login: string;

    /** Array of icons of the user. We use the first element of this array */
    icons: Icon[];
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
 */
const keyExtractor = (item: Mention) => item.alternateText;

function MentionSuggestions({prefix, mentions, highlightedMentionIndex = 0, onSelect, isMentionPickerLarge, measureParentContainer = () => {}}: MentionSuggestionsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    /**
     * Render a suggestion menu item component.
     */
    const renderSuggestionMenuItem = (item: Mention) => {
        const isIcon = item.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT;
        const styledDisplayName = getStyledTextArray(item.text, prefix);
        const styledHandle = item.text === item.alternateText ? undefined : getStyledTextArray(item.alternateText, prefix);

        return (
            <View style={[styles.autoCompleteSuggestionContainer, styles.ph2]}>
                <View style={styles.mentionSuggestionsAvatarContainer}>
                    <Avatar
                        source={item.icons[0].source}
                        size={isIcon ? CONST.AVATAR_SIZE.MENTION_ICON : CONST.AVATAR_SIZE.SMALLER}
                        name={item.icons[0].name}
                        type={item.icons[0].type}
                        fill={theme.success}
                        fallbackIcon={item.icons[0].fallbackIcon}
                    />
                </View>
                <Text
                    style={[styles.mentionSuggestionsText, styles.flexShrink1]}
                    numberOfLines={1}
                >
                    {styledDisplayName?.map(({text, isColored}, i) => (
                        <Text
                            // eslint-disable-next-line react/no-array-index-key
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
                    {styledHandle?.map(
                        ({text, isColored}, i) =>
                            Boolean(text) && (
                                <Text
                                    // eslint-disable-next-line react/no-array-index-key
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
