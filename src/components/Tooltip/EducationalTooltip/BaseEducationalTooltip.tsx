import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import type {LayoutRectangle, NativeSyntheticEvent} from 'react-native';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type {EducationalTooltipProps} from '@components/Tooltip/types';
import measureTooltipCoordinate from './measureTooltipCoordinate';
import * as TooltipManager from './TooltipManager';

type LayoutChangeEventWithTarget = NativeSyntheticEvent<{layout: LayoutRectangle; target: HTMLElement}>;

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({children, onHideTooltip: onHideTooltipProp, shouldRender = false, shouldAutoDismiss = false, ...props}: EducationalTooltipProps) {
    const hideTooltipRef = useRef<() => void>();

    const [shouldMeasure, setShouldMeasure] = useState(false);
    const show = useRef<() => void>();
    const removeActiveTooltipRef = useRef(() => {});
    const removePendingTooltipRef = useRef(() => {});

    const didShow = useRef(false);

    const onHideTooltip = useCallback(() => {
        if (!shouldRender) {
            return;
        }
        onHideTooltipProp?.();
    }, [onHideTooltipProp, shouldRender]);

    const closeTooltip = useCallback(() => {
        if (!didShow.current) {
            return;
        }
        hideTooltipRef.current?.();
        onHideTooltip?.();
        removeActiveTooltipRef.current();
    }, [onHideTooltip]);

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
        if (!shouldAutoDismiss) {
            return;
        }

        // Automatically hide tooltip after 5 seconds if shouldAutoDismiss is true
        const timerID = setTimeout(() => {
            closeTooltip();
        }, 5000);
        return () => {
            clearTimeout(timerID);
        };
    }, [shouldAutoDismiss, closeTooltip]);

    useEffect(() => {
        if (!shouldMeasure || !shouldRender || didShow.current) {
            return;
        }
        // When tooltip is used inside an animated view (e.g. popover), we need to wait for the animation to finish before measuring content.
        const timerID = setTimeout(() => {
            removePendingTooltipRef.current();
            show.current?.();
            didShow.current = true;
            removeActiveTooltipRef.current = TooltipManager.addActiveTooltip(closeTooltip);
        }, 500);
        removePendingTooltipRef.current = TooltipManager.addPendingTooltip(timerID);
        return () => {
            removePendingTooltipRef.current();
            clearTimeout(timerID);
        };
    }, [shouldMeasure, shouldRender, closeTooltip]);

    useEffect(
        () => closeTooltip,
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    return (
        <GenericTooltip
            shouldForceAnimate
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onHideTooltip={onHideTooltip}
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
