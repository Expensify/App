import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import type TextWithTooltipProps from './types';

function TextWithTooltip({text, style, numberOfLines = 1}: TextWithTooltipProps) {
    const styles = useThemeStyles();
    const processedTextArray = EmojiUtils.splitTextWithEmojis(text);

    return (
        <Text
            style={style}
            numberOfLines={numberOfLines}
        >
            {processedTextArray.length !== 0 ? EmojiUtils.getProcessedText(processedTextArray, [style, styles.emojisFontFamily]) : text}
        </Text>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
