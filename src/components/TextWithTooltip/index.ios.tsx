import React, {useMemo} from 'react';
import Text from '@components/Text';
import * as EmojiUtils from '@libs/EmojiUtils';
import CONST from '@src/CONST';
import type TextWithTooltipProps from './types';

function TextWithTooltip({text, style, emojiFontSize, numberOfLines = 1}: TextWithTooltipProps) {
    const processedTextArray = useMemo(() => {
        const emojisRegex = new RegExp(CONST.REGEX.EMOJIS, CONST.REGEX.EMOJIS.flags.concat('g'));
        const doesTextContainEmojis = !!(emojiFontSize && emojisRegex.test(text));

        if (!doesTextContainEmojis) {
            return [];
        }

        return EmojiUtils.splitTextWithEmojis(text);
    }, [emojiFontSize, text]);

    return (
        <Text
            style={style}
            numberOfLines={numberOfLines}
        >
            {processedTextArray.length !== 0 ? processedTextArray.map(({text: textItem, isEmoji}) => (isEmoji ? <Text style={{fontSize: emojiFontSize}}>{textItem}</Text> : textItem)) : text}
        </Text>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
