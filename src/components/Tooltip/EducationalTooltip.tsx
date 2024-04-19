import React, {memo, useEffect, useRef} from 'react';
import type {LayoutChangeEvent, LayoutEvent} from 'react-native';
import type TooltipProps from './types';
import BaseTooltip from './BaseTooltip';

/**
 * A component used to wrap an element intended for displaying a tooltip. The term "tooltip's target" refers to the
 * wrapped element, which, upon hover, triggers the tooltip to be shown.
 * @param props
 * @returns
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
                        updateBounds('target' in nativeEvent ? nativeEvent.target?.getBoundingClientRect() : nativeEvent.layout);
                        showTooltip();
                    },
                });
            }}
        </BaseTooltip>
    );
}

EducationalTooltip.displayName = 'Tooltip';

export default memo(EducationalTooltip);
