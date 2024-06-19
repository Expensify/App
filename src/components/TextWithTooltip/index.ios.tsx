import React, {useMemo} from 'react';
import Text from '@components/Text';
import * as EmojiUtils from '@libs/EmojiUtils';
import CONST from '@src/CONST';
import type TextWithTooltipProps from './types';

function TextWithTooltip({text, style, emojiFontSize, numberOfLines = 1}: TextWithTooltipProps) {
    const containsEmoji = useMemo(() => {
        const emojisRegex = new RegExp(CONST.REGEX.EMOJIS, CONST.REGEX.EMOJIS.flags.concat('g'));
        return !!(emojiFontSize && emojisRegex.test(text));
    }, [emojiFontSize, text]);
    const processedTextArray = useMemo(() => (containsEmoji ? EmojiUtils.splitTextWithEmojis(text) : []), [containsEmoji, text]);

    return (
        <Text
            style={style}
            numberOfLines={numberOfLines}
        >
            {containsEmoji ? processedTextArray.map(({text: textItem, isEmoji}) => (isEmoji ? <Text style={{fontSize: emojiFontSize}}>{textItem}</Text> : textItem)) : text}
        </Text>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
