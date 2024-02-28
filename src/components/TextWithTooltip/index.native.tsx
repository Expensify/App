import React from 'react';
import Text from '@components/Text';
import type TextWithTooltipProps from './types';

function TextWithTooltip({text, style, numberOfLines = 1}: TextWithTooltipProps) {
    return (
        <Text
            style={style}
            numberOfLines={numberOfLines}
        >
            {text}
        </Text>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
