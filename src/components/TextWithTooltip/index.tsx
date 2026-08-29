import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper/selection';

import React, {useState} from 'react';

import type TextWithTooltipProps from './types';

type LayoutChangeEvent = {
    target: HTMLElement;
};

function TextWithTooltip({testID, text, shouldShowTooltip, style, numberOfLines = 1, forwardedFSClass, isCopyable = false}: TextWithTooltipProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Tooltip
            shouldRender={showTooltip}
            text={text}
        >
            <Text
                testID={testID}
                style={style}
                numberOfLines={numberOfLines}
                selectable={isCopyable}
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
                dataSet={isCopyable ? COPYABLE_TEXT_DATA_SET : undefined}
            >
                {text}
            </Text>
        </Tooltip>
    );
}

export default TextWithTooltip;
