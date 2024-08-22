import React from 'react';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import Parser from '@libs/Parser';
import type TextWithTooltipProps from './types';

function TextWithTooltip({text, style, numberOfLines = 1, shouldRenderAsHTML = false}: TextWithTooltipProps) {
    return (
        <Text
            style={style}
            numberOfLines={numberOfLines}
        >
            {shouldRenderAsHTML ? <RenderHTML html={Parser.replace(text)} /> : text}
        </Text>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
