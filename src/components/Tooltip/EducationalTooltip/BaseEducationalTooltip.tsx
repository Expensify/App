import React, {memo, useEffect, useRef, useState} from 'react';
import type {LayoutRectangle, NativeSyntheticEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type {EducationalTooltipProps} from '@components/Tooltip/types';
import ONYXKEYS from '@src/ONYXKEYS';
import measureTooltipCoordinate from './measureTooltipCoordinate';

type LayoutChangeEventWithTarget = NativeSyntheticEvent<{layout: LayoutRectangle; target: HTMLElement}>;

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({children, shouldAutoDismiss = false, shouldRender = false, ...props}: EducationalTooltipProps) {
    const hideTooltipRef = useRef<() => void>();

    const [shouldMeasure, setShouldMeasure] = useState(false);
    const show = useRef<() => void>();
    const [modal] = useOnyx(ONYXKEYS.MODAL);

    const shouldShow = !modal?.willAlertModalBecomeVisible && !modal?.isVisible;
    const didShowRef = useRef(false);

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

        // If the modal is open, hide the tooltip immediately and clear the timeout
        if (!shouldShow) {
            hideTooltipRef.current();
            return;
        }

        // Automatically hide tooltip after 5 seconds if shouldAutoDismiss is true
        const timerID = setTimeout(hideTooltipRef.current, 5000);
        return () => {
            clearTimeout(timerID);
        };
    }, [shouldAutoDismiss, shouldShow]);

    useEffect(() => {
        if (!shouldRender || !shouldMeasure || !shouldShow || didShowRef.current) {
            return;
        }
        // When tooltip is used inside an animated view (e.g. popover), we need to wait for the animation to finish before measuring content.
        setTimeout(() => {
            didShowRef.current = true;
            show.current?.();
        }, 500);
    }, [shouldMeasure, shouldRender, shouldShow]);

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
                    onLayout: (e: LayoutChangeEventWithTarget) => {
                        if (!shouldMeasure) {
                            setShouldMeasure(true);
                        }
                        // e.target is specific to native, use e.nativeEvent.target on web instead
                        const target = e.target || e.nativeEvent.target;
                        show.current = () => measureTooltipCoordinate(target, updateTargetBounds, showTooltip);
                    },
                });
            }}
        </GenericTooltip>
    );
}

BaseEducationalTooltip.displayName = 'BaseEducationalTooltip';

export default memo(BaseEducationalTooltip);
