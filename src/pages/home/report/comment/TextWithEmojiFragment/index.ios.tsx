import React, {useMemo} from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import {containsCustomEmoji, splitTextWithEmojis} from '@libs/EmojiUtils';
import type TextWithEmojiFragmentProps from './types';

function TextWithEmojiFragment({message = '', style}: TextWithEmojiFragmentProps) {
    const styles = useThemeStyles();
    const processedTextArray = useMemo(() => splitTextWithEmojis(message), [message]);

    return (
        <Text style={style}>
            {processedTextArray.map(({text, isEmoji}, index) =>
                isEmoji ? (
                    <Text
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        style={[styles.emojisWithTextFontSizeAligned, containsCustomEmoji(text) && styles.customEmojiFontAlignment]}
                    >
                        {text}
                    </Text>
                ) : (
                    convertToLTR(text)
                ),
            )}
        </Text>
    );
}

TextWithEmojiFragment.displayName = 'TextWithEmojiFragment';

export default TextWithEmojiFragment;
