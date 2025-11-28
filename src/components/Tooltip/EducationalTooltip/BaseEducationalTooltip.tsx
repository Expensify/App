import {NavigationContext, useIsFocused} from '@react-navigation/native';
import React, {memo, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {LayoutRectangle, NativeMethods, NativeSyntheticEvent} from 'react-native';
import {DeviceEventEmitter, Dimensions} from 'react-native';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type {EducationalTooltipProps, GenericTooltipState} from '@components/Tooltip/types';
import useIsResizing from '@hooks/useIsResizing';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import measureTooltipCoordinate, {getTooltipCoordinates} from './measureTooltipCoordinate';

type LayoutChangeEventWithTarget = NativeSyntheticEvent<{layout: LayoutRectangle; target: HTMLElement}>;

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({children, shouldRender = false, shouldHideOnNavigate = true, shouldHideOnScroll = false, uniqueID, ...props}: EducationalTooltipProps) {
    const genericTooltipStateRef = useRef<GenericTooltipState | undefined>(undefined);
    const tooltipElementRef = useRef<Readonly<NativeMethods> | undefined>(undefined);

    const [shouldMeasure, setShouldMeasure] = useState(false);
    const show = useRef<(() => void) | undefined>(undefined);

    const navigator = useContext(NavigationContext);
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();

    const isResizing = useIsResizing();

    const shouldSuppressTooltip = !isFocused && shouldHideOnNavigate;

    const renderTooltip = useCallback(() => {
        if (!tooltipElementRef.current || !genericTooltipStateRef.current || shouldSuppressTooltip) {
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
            const availableWidthForLeft = left - offset;
            const availableWidthForRight = dimensions.width - (right - offset);

            // Hide if the element scrolled out vertically or horizontally
            if (availableHeightForTop < 0 || availableHeightForBottom < 0 || availableWidthForLeft < 0 || availableWidthForRight < 0) {
                hideTooltip();
            } else {
                showTooltip();
            }
        });
    }, [insets.top, insets.bottom, insets.left, insets.right, shouldSuppressTooltip]);

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
        if (!shouldMeasure || shouldSuppressTooltip) {
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
    }, [shouldMeasure, shouldRender, shouldSuppressTooltip]);

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
            shouldRender={shouldRender}
            isEducationTooltip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {(genericTooltipState) => {
                const {updateTargetBounds, showTooltip} = genericTooltipState;
                // eslint-disable-next-line react-compiler/react-compiler
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
                    },
                });
            }}
        </GenericTooltip>
    );
}

BaseEducationalTooltip.displayName = 'BaseEducationalTooltip';

export default memo(BaseEducationalTooltip);
