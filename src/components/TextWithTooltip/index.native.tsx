import React from 'react';
import Text from '@components/Text';
import type TextWithTooltipProps from './types';

function TextWithTooltip({text, textStyles}: TextWithTooltipProps) {
    return (
        <Text
            style={textStyles}
            numberOfLines={1}
        >
            {text}
        </Text>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
