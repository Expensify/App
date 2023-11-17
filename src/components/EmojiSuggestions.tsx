import React, {ReactElement} from 'react';
import {View} from 'react-native';
import type {SimpleEmoji} from '@libs/EmojiTrie';
import * as EmojiUtils from '@libs/EmojiUtils';
import getStyledTextArray from '@libs/GetStyledTextArray';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import AutoCompleteSuggestions from './AutoCompleteSuggestions';
import Text from './Text';

type MeasureParentContainerCallback = (x: number, y: number, width: number) => void;

type EmojiSuggestionsProps = {
    /** The index of the highlighted emoji */
    highlightedEmojiIndex?: number;

    /** Array of suggested emoji */
    emojis: SimpleEmoji[];

    /** Fired when the user selects an emoji */
    onSelect: (index: number) => void;

    /** Emoji prefix that follows the colon */
    prefix: string;

    /** Show that we can use large emoji picker. Depending on available space
     * and whether the input is expanded, we can have a small or large emoji
     * suggester. When this value is false, the suggester will have a height of
     * 2.5 items. When this value is true, the height can be up to 5 items.  */
    isEmojiPickerLarge: boolean;

    /** Stores user's preferred skin tone */
    preferredSkinToneIndex: number;

    /** Meaures the parent container's position and dimensions. */
    measureParentContainer: (callback: MeasureParentContainerCallback) => void;
};

/**
 * Create unique keys for each emoji item
 */
const keyExtractor = (item: SimpleEmoji, index: number): string => `${item.name}+${index}}`;

function EmojiSuggestions({emojis, onSelect, prefix, isEmojiPickerLarge, preferredSkinToneIndex, highlightedEmojiIndex = 0, measureParentContainer = () => {}}: EmojiSuggestionsProps) {
    const styles = useThemeStyles();
    /**
     * Render an emoji suggestion menu item component.
     */
    const renderSuggestionMenuItem = (item: SimpleEmoji): ReactElement => {
        const styledTextArray = getStyledTextArray(item.name, prefix);

        return (
            <View style={styles.autoCompleteSuggestionContainer}>
                <Text style={styles.emojiSuggestionsEmoji}>{EmojiUtils.getEmojiCodeWithSkinColor(item, preferredSkinToneIndex)}</Text>
                <Text
                    numberOfLines={2}
                    style={styles.emojiSuggestionsText}
                >
                    :
                    {styledTextArray.map(({text, isColored}) => (
                        <Text
                            key={`${text}+${isColored}`}
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
            suggestions={emojis}
            renderSuggestionMenuItem={renderSuggestionMenuItem}
            keyExtractor={keyExtractor}
            highlightedSuggestionIndex={highlightedEmojiIndex}
            onSelect={onSelect}
            isSuggestionPickerLarge={isEmojiPickerLarge}
            accessibilityLabelExtractor={keyExtractor}
            measureParentContainer={measureParentContainer}
        />
    );
}

EmojiSuggestions.displayName = 'EmojiSuggestions';

export default EmojiSuggestions;
