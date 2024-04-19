import React, {memo, useEffect, useRef} from 'react';
import type {LayoutChangeEvent, LayoutEvent} from 'react-native';
import BaseTooltip from './BaseTooltip';
import type TooltipProps from './types';

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function EducationalTooltip({children, ...props}: TooltipProps) {
    const hideTooltipRef = useRef<() => void>();

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
        <BaseTooltip {...props}>
            {({showTooltip, hideTooltip, updateBounds}) => {
                hideTooltipRef.current = hideTooltip;
                return React.cloneElement(children as React.ReactElement, {
                    onLayout: ({nativeEvent}: LayoutEvent | LayoutChangeEvent) => {
                        updateBounds('target' in nativeEvent && typeof nativeEvent.target !== 'number' ? nativeEvent.target?.getBoundingClientRect() : nativeEvent.layout);
                        showTooltip();
                    },
                });
            }}
        </BaseTooltip>
    );
}

EducationalTooltip.displayName = 'EducationalTooltip';

export default memo(EducationalTooltip);
