import React, {useMemo} from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import {splitTextWithEmojis} from '@libs/EmojiUtils';
import type TextWithEmojiFragmentProps from './types';

function TextWithEmojiFragment({message = '', style, alignCustomEmoji = false}: TextWithEmojiFragmentProps) {
    const styles = useThemeStyles();
    const processedTextArray = useMemo(() => splitTextWithEmojis(message), [message]);
    return (
        <Text style={style}>
            {processedTextArray.map(({text, isEmoji}, index) =>
                isEmoji ? (
                    <Text
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        style={alignCustomEmoji ? style : styles.emojisWithTextFontSize}
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

export default TextWithEmojiFragment;
