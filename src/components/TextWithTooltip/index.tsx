import React, {useState} from 'react';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type TextWithTooltipProps from './types';

type LayoutChangeEvent = {
    target: HTMLElement;
};

function TextWithTooltip({testID, text, shouldShowTooltip, style, numberOfLines = 1, forwardedFSClass, alwaysShowTooltip = false}: TextWithTooltipProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    // When alwaysShowTooltip is true, the tooltip is shown on hover regardless of text truncation
    const isTooltipVisible = alwaysShowTooltip ? shouldShowTooltip : showTooltip;

    return (
        <Tooltip
            shouldRender={isTooltipVisible}
            text={text}
        >
            <Text
                testID={testID}
                style={style}
                numberOfLines={numberOfLines}
                onLayout={(e) => {
                    const target = (e.nativeEvent as unknown as LayoutChangeEvent).target;
                    if (!shouldShowTooltip) {
                        return;
                    }
                    if (target.scrollWidth > target.offsetWidth || target.scrollHeight > target.offsetHeight) {
                        setShowTooltip(true);
                        return;
                    }
                    setShowTooltip(false);
                }}
                fsClass={forwardedFSClass}
            >
                {text}
            </Text>
        </Tooltip>
    );
}

export default TextWithTooltip;
