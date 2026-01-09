import type {ReactElement} from 'react';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {Emoji} from '@assets/emojis/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import getStyledTextArray from '@libs/GetStyledTextArray';
import AutoCompleteSuggestions from './AutoCompleteSuggestions';
import type {MeasureParentContainerAndCursorCallback} from './AutoCompleteSuggestions/types';
import Text from './Text';

type EmojiSuggestionsProps = {
    /** The index of the highlighted emoji */
    highlightedEmojiIndex?: number;

    /** Array of suggested emoji */
    emojis: Emoji[];

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

    /** Measures the parent container's position and dimensions. Also add cursor coordinates */
    measureParentContainerAndReportCursor: (callback: MeasureParentContainerAndCursorCallback) => void;

    /** Reset the emoji suggestions */
    resetSuggestions: () => void;
};

/**
 * Create unique keys for each emoji item
 */
const keyExtractor = (item: Emoji, index: number): string => `${item.name}+${index}}`;

function EmojiSuggestions({
    emojis,
    onSelect,
    prefix,
    isEmojiPickerLarge,
    preferredSkinToneIndex,
    highlightedEmojiIndex = 0,
    measureParentContainerAndReportCursor = () => {},
    resetSuggestions,
}: EmojiSuggestionsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    /**
     * Render an emoji suggestion menu item component.
     */
    const renderSuggestionMenuItem = useCallback(
        (item: Emoji): ReactElement => {
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
        },
        [prefix, styles.autoCompleteSuggestionContainer, styles.emojiSuggestionsEmoji, styles.emojiSuggestionsText, preferredSkinToneIndex, StyleUtils],
    );

    return (
        <AutoCompleteSuggestions
            suggestions={emojis}
            renderSuggestionMenuItem={renderSuggestionMenuItem}
            keyExtractor={keyExtractor}
            highlightedSuggestionIndex={highlightedEmojiIndex}
            onSelect={onSelect}
            isSuggestionPickerLarge={isEmojiPickerLarge}
            accessibilityLabelExtractor={keyExtractor}
            measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
            resetSuggestions={resetSuggestions}
        />
    );
}

export default EmojiSuggestions;
