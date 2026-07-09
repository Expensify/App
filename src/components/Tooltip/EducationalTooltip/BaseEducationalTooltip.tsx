import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type {EducationalTooltipProps, GenericTooltipState} from '@components/Tooltip/types';

import useIsResizing from '@hooks/useIsResizing';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {LayoutRectangle, NativeMethods, NativeSyntheticEvent} from 'react-native';

import {NavigationContext, useIsFocused} from '@react-navigation/native';
import React, {memo, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {DeviceEventEmitter, Dimensions} from 'react-native';

import measureTooltipCoordinate, {getTooltipCoordinates} from './measureTooltipCoordinate';

type LayoutChangeEventWithTarget = NativeSyntheticEvent<{layout: LayoutRectangle; target: HTMLElement}>;

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({
    children,
    shouldRender = false,
    shouldDisplayTooltip,
    shouldHideOnNavigate = true,
    shouldHideOnScroll = false,
    uniqueID,
    ...props
}: EducationalTooltipProps) {
    const shouldShowTooltip = shouldDisplayTooltip ?? shouldRender;
    const genericTooltipStateRef = useRef<GenericTooltipState | undefined>(undefined);
    const tooltipElementRef = useRef<Readonly<NativeMethods> | undefined>(undefined);

    const [shouldMeasure, setShouldMeasure] = useState(false);
    const show = useRef<(() => void) | undefined>(undefined);
    const hasDisplayedTooltipRef = useRef(false);

    const navigator = useContext(NavigationContext);
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();

    const isResizing = useIsResizing();

    const shouldSuppressTooltip = !isFocused && shouldHideOnNavigate;

    const renderTooltip = useCallback(() => {
        if (!tooltipElementRef.current || !genericTooltipStateRef.current || shouldSuppressTooltip) {
            return;
        }

        if (!shouldShowTooltip) {
            genericTooltipStateRef.current.hideTooltip();
            return;
        }

        const {hideTooltip, showTooltip, updateTargetBounds} = genericTooltipStateRef.current;

        getTooltipCoordinates(tooltipElementRef.current, (bounds) => {
            updateTargetBounds(bounds);
            const {x, y, width: elementWidth, height} = bounds;

            const offset = 10; // Tooltip hides when content moves 10px past header/footer.
            const dimensions = Dimensions.get('window');
            const top = y - (insets.top || 0);
            const bottom = y + height + insets.bottom || 0;
            const left = x - (insets.left || 0);
            const right = x + elementWidth + (insets.right || 0);
            // Calculate the available space at the top, considering the header height and offset
            const availableHeightForTop = top - (variables.contentHeaderHeight - offset);

            // Calculate the total height available after accounting for the bottom tab and offset
            const availableHeightForBottom = dimensions.height - (bottom + variables.bottomTabHeight - offset);

            // Calculate available horizontal space, taking into account safe-area insets
            const availableWidthForLeft = left + offset;
            const availableWidthForRight = dimensions.width - (right - offset);

            // Hide if the element scrolled out vertically or horizontally
            if (availableHeightForTop < 0 || availableHeightForBottom < 0 || availableWidthForLeft < 0 || availableWidthForRight < 0) {
                hideTooltip();
            } else {
                showTooltip();
            }
        });
    }, [insets.top, insets.bottom, insets.left, insets.right, shouldShowTooltip, shouldSuppressTooltip]);

    useEffect(() => {
        if (!genericTooltipStateRef.current || !shouldRender) {
            return;
        }

        if (isResizing) {
            const {hideTooltip} = genericTooltipStateRef.current;

            // Hide the tooltip if the screen is being resized
            hideTooltip();
        } else {
            // Re-render the tooltip when resizing ends
            // This is necessary to ensure the tooltip is positioned correctly after resizing
            renderTooltip();
        }
    }, [isResizing, renderTooltip, shouldRender, uniqueID]);

    const setTooltipPosition = useCallback(
        (isScrolling: boolean) => {
            if (!shouldHideOnScroll || !genericTooltipStateRef.current) {
                return;
            }

            const {hideTooltip} = genericTooltipStateRef.current;
            if (isScrolling) {
                hideTooltip();
            } else {
                renderTooltip();
            }
        },
        [renderTooltip, shouldHideOnScroll],
    );

    useLayoutEffect(() => {
        if (!shouldRender || !shouldHideOnScroll) {
            return;
        }

        setTooltipPosition(false);
        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (isScrolling: boolean) => {
            setTooltipPosition(isScrolling);
        });

        return () => scrollingListener.remove();
    }, [shouldRender, shouldHideOnScroll, setTooltipPosition]);

    useEffect(() => {
        return () => {
            genericTooltipStateRef.current?.hideTooltip();
        };
    }, []);

    useEffect(() => {
        if (!shouldMeasure || shouldSuppressTooltip || !shouldShowTooltip) {
            return;
        }
        if (!shouldRender) {
            genericTooltipStateRef.current?.hideTooltip();
            return;
        }
        // When tooltip is used inside an animated view (e.g. popover), we need to wait for the animation to finish before measuring content.
        const timerID = setTimeout(() => {
            show.current?.();
        }, CONST.TOOLTIP_ANIMATION_DURATION);
        return () => {
            clearTimeout(timerID);
        };
    }, [shouldMeasure, shouldRender, shouldShowTooltip, shouldSuppressTooltip]);

    useEffect(() => {
        if (!shouldRender || !shouldShowTooltip || shouldSuppressTooltip || !shouldMeasure) {
            return;
        }
        // Re-measure immediately only after the tooltip has been shown at least once (e.g. when
        // shouldDisplayTooltip flips back to true after scroll/product-training gating). The first
        // display still relies on the delayed onLayout path above so animated containers can settle.
        if (hasDisplayedTooltipRef.current) {
            renderTooltip();
        }
        hasDisplayedTooltipRef.current = true;
    }, [shouldRender, shouldShowTooltip, shouldSuppressTooltip, shouldMeasure, renderTooltip]);

    useEffect(() => {
        if (!navigator) {
            return;
        }
        const unsubscribe = navigator.addListener('blur', () => {
            if (!shouldHideOnNavigate) {
                return;
            }
            genericTooltipStateRef.current?.hideTooltip();
        });
        return unsubscribe;
    }, [navigator, shouldHideOnNavigate]);

    return (
        <GenericTooltip
            shouldForceAnimate
            shouldRender={shouldShowTooltip}
            isEducationTooltip
            {...props}
        >
            {(genericTooltipState) => {
                const {updateTargetBounds, showTooltip} = genericTooltipState;
                genericTooltipStateRef.current = genericTooltipState;
                return React.cloneElement(children as React.ReactElement<{onLayout?: (e: LayoutChangeEventWithTarget) => void}>, {
                    onLayout: (e: LayoutChangeEventWithTarget) => {
                        if (!shouldMeasure) {
                            setShouldMeasure(true);
                        }
                        // e.target is specific to native, use e.nativeEvent.target on web instead
                        const target = e.target || e.nativeEvent.target;
                        tooltipElementRef.current = target;
                        show.current = () => measureTooltipCoordinate(target, updateTargetBounds, showTooltip);

                        // The wrapped component just moved (e.g. the device rotated). measure() only reports the
                        // new position once the native layout has landed, so this is the earliest we can trust it.
                        if (hasDisplayedTooltipRef.current) {
                            renderTooltip();
                        }
                    },
                });
            }}
        </GenericTooltip>
    );
}

export default memo(BaseEducationalTooltip);
