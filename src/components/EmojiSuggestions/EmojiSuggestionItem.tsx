import type {Emoji} from '@assets/emojis/types';

import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getEmojiCodeWithSkinColor} from '@libs/EmojiUtils';
import getStyledTextArray from '@libs/GetStyledTextArray';

import React from 'react';
import {View} from 'react-native';

type EmojiSuggestionItemProps = {
    /** The emoji to render */
    item: Emoji;

    /** Emoji prefix that follows the colon, highlighted within the rendered name */
    prefix: string;

    /** Stores user's preferred skin tone */
    preferredSkinToneIndex: number;
};

/** A single row of the emoji suggester: the emoji glyph followed by its `:name:`. */
function EmojiSuggestionItem({item, prefix, preferredSkinToneIndex}: EmojiSuggestionItemProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const styledTextArray = getStyledTextArray(item.name, prefix);

    return (
        <View style={styles.autoCompleteSuggestionContainer}>
            <Text style={styles.emojiSuggestionsEmoji}>{getEmojiCodeWithSkinColor(item, preferredSkinToneIndex)}</Text>
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
}

export default EmojiSuggestionItem;
