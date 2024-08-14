import React, {memo, useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type {EducationalTooltipProps} from '@components/Tooltip/types';
import CONST from '@src/CONST';

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({children, shouldAutoDismiss = false, ...props}: EducationalTooltipProps) {
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
        if (!hideTooltipRef.current || !shouldAutoDismiss) {
            return;
        }

        const timerID = setTimeout(hideTooltipRef.current, 5000);
        return () => {
            clearTimeout(timerID);
        };
    }, [shouldAutoDismiss]);

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
                        // e.target is specific to native, use e.nativeEvent.target on web instead
                        const target = e.target || e.nativeEvent.target;
                        // When tooltip is used inside an animated view (e.g. popover), we need to wait for the animation to finish before measuring content.
                        setTimeout(() => {
                            InteractionManager.runAfterInteractions(() => {
                                target?.measure((fx, fy, width, height, px, py) => {
                                    updateTargetBounds({
                                        height,
                                        width,
                                        x: px,
                                        y: py,
                                    });
                                    showTooltip();
                                });
                            });
                        }, CONST.ANIMATED_TRANSITION);
                    },
                });
            }}
        </GenericTooltip>
    );
}

BaseEducationalTooltip.displayName = 'BaseEducationalTooltip';

export default memo(BaseEducationalTooltip);
