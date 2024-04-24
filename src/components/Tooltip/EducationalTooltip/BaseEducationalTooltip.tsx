import React, {memo, useEffect, useRef} from 'react';
import type {LayoutChangeEvent, LayoutEvent} from 'react-native';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type TooltipProps from '@components/Tooltip/types';

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({children, ...props}: TooltipProps) {
    const hideTooltipRef = useRef<() => void>();

    // Automatically hide tooltip after 5 seconds
    useEffect(() => {
        if (!hideTooltipRef.current) {
            return;
        }

        const intervalID = setInterval(hideTooltipRef.current, 5000);
        return () => {
            clearInterval(intervalID);
        };
    }, []);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <GenericTooltip {...props}>
            {({showTooltip, hideTooltip, updateTargetBounds}) => {
                hideTooltipRef.current = hideTooltip;
                return React.cloneElement(children as React.ReactElement, {
                    onLayout: ({nativeEvent}: LayoutEvent | LayoutChangeEvent) => {
                        updateTargetBounds('target' in nativeEvent && typeof nativeEvent.target !== 'number' ? nativeEvent.target?.getBoundingClientRect() : nativeEvent.layout);
                        showTooltip();
                    },
                });
            }}
        </GenericTooltip>
    );
}

BaseEducationalTooltip.displayName = 'BaseEducationalTooltip';

export default memo(BaseEducationalTooltip);
