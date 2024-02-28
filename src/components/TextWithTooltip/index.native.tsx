import React from 'react';
import Text from '@components/Text';
import type TextWithTooltipProps from './types';

function TextWithTooltip({text, textStyles, numberOfLines}: TextWithTooltipProps) {
    return (
        <Text
            style={textStyles}
            numberOfLines={numberOfLines ?? 1}
        >
            {text}
        </Text>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
