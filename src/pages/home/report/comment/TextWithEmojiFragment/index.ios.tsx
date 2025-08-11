import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import {containsCustomEmoji, containsOnlyCustomEmoji, splitTextWithEmojis} from '@libs/EmojiUtils';
import type TextWithEmojiFragmentProps from './types';

function TextWithEmojiFragment({message = '', style, alignCustomEmoji = false}: TextWithEmojiFragmentProps) {
    const styles = useThemeStyles();
    const processedTextArray = useMemo(() => splitTextWithEmojis(message), [message]);

    return (
        <Text style={style}>
            {processedTextArray.map(({text, isEmoji}, index) => {
                const charsBeforeEmoji = processedTextArray.slice(0, index).reduce((sum, part) => sum + part.text.length, 0);

                if (isEmoji) {
                    if (alignCustomEmoji && containsOnlyCustomEmoji(text)) {
                        return (
                            <Text
                                key={index}
                                style={[styles.emojisWithTextFontSizeAligned, styles.customEmojiFontAlignment]}
                            >
                                {text}
                            </Text>
                        );
                    }
                    if (alignCustomEmoji && charsBeforeEmoji > 50) {
                        return null;
                    }

                    return (
                        <View
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                        >
                            <Text style={[styles.emojisWithTextFontSizeAligned, containsCustomEmoji(text) && styles.customEmojiFontAlignment]}>{text}</Text>
                        </View>
                    );
                }
                return convertToLTR(text);
            })}
        </Text>
    );
}

TextWithEmojiFragment.displayName = 'TextWithEmojiFragment';

export default TextWithEmojiFragment;
