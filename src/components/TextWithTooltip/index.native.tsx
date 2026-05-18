import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {getProcessedText, splitTextWithEmojis} from '@libs/EmojiUtils';
import type TextWithTooltipProps from './types';

function TextWithTooltip({testID, text, style, numberOfLines = 1, forwardedFSClass}: TextWithTooltipProps) {
    const styles = useThemeStyles();
    const processedTextArray = splitTextWithEmojis(text);

    return (
        <Text
            testID={testID}
            style={style}
            numberOfLines={numberOfLines}
            fsClass={forwardedFSClass}
        >
            {processedTextArray.length !== 0 ? getProcessedText(processedTextArray, [style, styles.emojisFontFamily]) : text}
        </Text>
    );
}

export default TextWithTooltip;
