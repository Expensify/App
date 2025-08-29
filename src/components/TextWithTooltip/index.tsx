import React, {useState} from 'react';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type TextWithTooltipProps from './types';

type LayoutChangeEvent = {
    target: HTMLElement;
};

function TextWithTooltip({text, shouldShowTooltip, style, numberOfLines = 1}: TextWithTooltipProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Tooltip
            shouldRender={showTooltip}
            text={text}
        >
            <Text
                style={style}
                numberOfLines={numberOfLines}
                onLayout={(e) => {
                    const target = (e.nativeEvent as unknown as LayoutChangeEvent).target;
                    if (!shouldShowTooltip) {
                        return;
                    }
                    if (target.scrollWidth > target.offsetWidth) {
                        setShowTooltip(true);
                        return;
                    }
                    setShowTooltip(false);
                }}
            >
                {text}
            </Text>
        </Tooltip>
    );
}

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
