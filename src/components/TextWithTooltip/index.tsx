import React, {memo, useCallback, useState} from 'react';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type TextWithTooltipProps from './types';

type LayoutChangeEvent = {
    target: HTMLElement;
};

const TextWithTooltip = memo(function TextWithTooltip({text, shouldShowTooltip, style, numberOfLines = 1}: TextWithTooltipProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    // Memoize the onLayout callback to prevent Text component re-renders
    const handleLayout = useCallback(
        (e: any) => {
            const target = (e.nativeEvent as unknown as LayoutChangeEvent).target;
            if (!shouldShowTooltip) {
                return;
            }
            if (target.scrollWidth > target.offsetWidth) {
                setShowTooltip(true);
                return;
            }
            setShowTooltip(false);
        },
        [shouldShowTooltip],
    );

    return (
        <Tooltip
            shouldRender={showTooltip}
            text={text}
        >
            <Text
                style={style}
                numberOfLines={numberOfLines}
                onLayout={handleLayout}
            >
                {text}
            </Text>
        </Tooltip>
    );
});

TextWithTooltip.displayName = 'TextWithTooltip';

export default TextWithTooltip;
