import {NavigationContext} from '@react-navigation/native';
import React, {memo, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {DeviceEventEmitter, Dimensions, type LayoutRectangle, NativeMethods, type NativeSyntheticEvent} from 'react-native';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type {EducationalTooltipProps, GenericTooltipState} from '@components/Tooltip/types';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import measureTooltipCoordinate, {getTooltipCoordiate} from './measureTooltipCoordinate';

type LayoutChangeEventWithTarget = NativeSyntheticEvent<{layout: LayoutRectangle; target: HTMLElement}>;

/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip({children, shouldRender = false, shouldHideOnNavigate = true, name = '', shouldHideOnEdge = false, ...props}: EducationalTooltipProps) {
    const genericTooltipStateRef = useRef<GenericTooltipState>();
    const tooltipElRef = useRef<React.Component & Readonly<NativeMethods>>();

    const [shouldMeasure, setShouldMeasure] = useState(false);
    const show = useRef<() => void>();

    const navigator = useContext(NavigationContext);
    const insets = useSafeAreaInsets();

    const setTooltipPosition = useCallback(
        (isScrolling: boolean, tooltipName: string) => {
            if (tooltipName !== name || !genericTooltipStateRef.current || !tooltipElRef.current) return;

            const {hideTooltip, showTooltip, updateTargetBounds} = genericTooltipStateRef.current;
            if (isScrolling) {
                hideTooltip();
            } else {
                getTooltipCoordiate(tooltipElRef.current, (bounds) => {
                    updateTargetBounds(bounds);
                    const {y, height} = bounds;

                    const offset = 10; // Buffer space
                    const dimensions = Dimensions.get('window');
                    const top = y - (insets.top || 0);
                    const bottom = y + height + insets.bottom || 0;

                    // Calculate the available space at the top, considering the header height and offset
                    const availableHeightForTop = top - (variables.contentHeaderHeight - offset);

                    // Calculate the total height available after accounting for the bottom tab and offset
                    const availableHeightForBottom = dimensions.height - (bottom + variables.bottomTabHeight - offset);

                    if (availableHeightForTop < 0 || availableHeightForBottom < 0) {
                        hideTooltip();
                    } else {
                        showTooltip();
                    }
                });
            }
        },
        [insets, name],
    );

    useLayoutEffect(() => {
        if (!shouldRender || !name || !shouldHideOnEdge) return;
        setTooltipPosition(false, name);
        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, ({isScrolling, tooltipName} = {}) => {
            setTooltipPosition(isScrolling, tooltipName);
        });

        return () => scrollingListener.remove();
    }, [shouldRender, name, shouldHideOnEdge, setTooltipPosition]);

    useEffect(() => {
        return () => {
            genericTooltipStateRef.current?.hideTooltip();
        };
    }, []);

    useEffect(() => {
        if (!shouldMeasure) {
            return;
        }
        if (!shouldRender) {
            genericTooltipStateRef.current?.hideTooltip();
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
                return React.cloneElement(children as React.ReactElement, {
                    onLayout: (e: LayoutChangeEventWithTarget) => {
                        if (!shouldMeasure) {
                            setShouldMeasure(true);
                        }
                        // e.target is specific to native, use e.nativeEvent.target on web instead
                        const target = e.target || e.nativeEvent.target;
                        tooltipElRef.current = target;
                        if (shouldHideOnEdge) {
                            return;
                        }
                        show.current = () => measureTooltipCoordinate(target, updateTargetBounds, showTooltip);
                    },
                });
            }}
        </GenericTooltip>
    );
}

BaseEducationalTooltip.displayName = 'BaseEducationalTooltip';

export default memo(BaseEducationalTooltip);
