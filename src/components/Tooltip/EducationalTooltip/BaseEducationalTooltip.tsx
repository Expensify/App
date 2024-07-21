import React, {memo, useEffect, useRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type TooltipProps from '@components/Tooltip/types';
import getBounds from './getBounds';

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({children, ...props}: TooltipProps) {
    const hideTooltipRef = useRef<() => void>();

    useEffect(
        () => () => {
            if (!hideTooltipRef.current) {
                return;
            }

            hideTooltipRef.current();
        },
        [],
    );

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
        <GenericTooltip
            shouldForceAnimate
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {({showTooltip, hideTooltip, updateTargetBounds}) => {
                // eslint-disable-next-line react-compiler/react-compiler
                hideTooltipRef.current = hideTooltip;
                return React.cloneElement(children as React.ReactElement, {
                    onLayout: (e: LayoutChangeEvent) => {
                        updateTargetBounds(getBounds(e));
                        showTooltip();
                    },
                });
            }}
        </GenericTooltip>
    );
}

BaseEducationalTooltip.displayName = 'BaseEducationalTooltip';

export default memo(BaseEducationalTooltip);
