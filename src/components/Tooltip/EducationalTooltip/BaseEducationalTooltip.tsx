import {NavigationContext} from '@react-navigation/native';
import React, {memo, useContext, useEffect, useRef, useState} from 'react';
import type {LayoutRectangle, NativeSyntheticEvent} from 'react-native';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type {EducationalTooltipProps} from '@components/Tooltip/types';
import measureTooltipCoordinate from './measureTooltipCoordinate';

type LayoutChangeEventWithTarget = NativeSyntheticEvent<{layout: LayoutRectangle; target: HTMLElement}>;

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({children, shouldRender = false, shouldHideOnNavigate = true, ...props}: EducationalTooltipProps) {
    const hideTooltipRef = useRef<() => void>();

    const [shouldMeasure, setShouldMeasure] = useState(false);
    const show = useRef<() => void>();

    const navigator = useContext(NavigationContext);

    useEffect(() => {
        return () => {
            hideTooltipRef.current?.();
        };
    }, []);

    useEffect(() => {
        if (!shouldMeasure) {
            return;
        }
        if (!shouldRender) {
            hideTooltipRef.current?.();
            return;
        }
        // When tooltip is used inside an animated view (e.g. popover), we need to wait for the animation to finish before measuring content.
        const timerID = setTimeout(() => {
            show.current?.();
        }, 500);
        return () => {
            clearTimeout(timerID);
        };
    }, [shouldMeasure, shouldRender]);

    useEffect(() => {
        if (!navigator) {
            return;
        }
        const unsubscribe = navigator.addListener('blur', () => {
            if (!shouldHideOnNavigate) {
                return;
            }
            hideTooltipRef.current?.();
        });
        return unsubscribe;
    }, [navigator, shouldHideOnNavigate]);

    return (
        <GenericTooltip
            shouldForceAnimate
            shouldRender={shouldRender}
            isEducationTooltip
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
