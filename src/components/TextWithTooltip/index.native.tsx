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
            {processedTextArray.length !== 0
                ? processedTextArray.map(({text: textItem, isEmoji}, index) =>
                      isEmoji ? (
                          <Text
                              // eslint-disable-next-line react/no-array-index-key
                              key={index}
                              style={[style, styles.emojisFontFamily]}
                          >
                              {textItem}
                          </Text>
                      ) : (
                          textItem
                      ),
                  )
                : text}
        </Text>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
