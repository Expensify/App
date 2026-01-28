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
                if (isEmoji) {
                    if (!alignCustomEmoji) {
                        return (
                            <View
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                            >
                                <Text style={[styles.emojisWithTextFontSizeAligned, containsCustomEmoji(text) && styles.customEmojiFontAlignment]}>{text}</Text>
                            </View>
                        );
                    }
                    if (containsOnlyCustomEmoji(text)) {
                        return (
                            <Text
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                style={[styles.emojisWithTextFontSizeAligned, styles.customEmojiFontAlignment]}
                            >
                                {text}
                            </Text>
                        );
                    }
                }
                return convertToLTR(text);
            })}
        </Text>
    );
}

export default TextWithEmojiFragment;
