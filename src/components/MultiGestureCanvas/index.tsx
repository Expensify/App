import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {Dimensions} from '@src/types/utils/Layout';

import type {NativeGesture, PanGesture} from 'react-native-gesture-handler';
import type {SharedValue} from 'react-native-reanimated';

import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {GestureDetector, useCompetingGestures, useSimultaneousGestures} from 'react-native-gesture-handler';
import Animated, {cancelAnimation, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';

import type {OnScaleChangedCallback, OnSwipeDownCallback, OnTapCallback, ZoomRange} from './types';

import {DEFAULT_ZOOM_RANGE, SPRING_CONFIG} from './constants';
import usePanGesture from './usePanGesture';
import usePinchGesture from './usePinchGesture';
import useTapGestures from './useTapGestures';
import * as MultiGestureCanvasUtils from './utils';

type MultiGestureCanvasProps = ChildrenProps & {
    /**
     * Whether the canvas is currently active (in the screen) or not.
     * Disables certain gestures and functionality
     */
    isActive?: boolean;

    /** The width and height of the canvas.
     *  This is needed in order to properly scale the content in the canvas
     */
    canvasSize: Dimensions;

    /** The width and height of the content.
     *  This is needed in order to properly scale the content in the canvas
     */
    contentSize?: Dimensions;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange?: Partial<ZoomRange>;

    /** A shared value of type boolean, that indicates disabled the transformation gestures (pinch, pan, double tap) */
    shouldDisableTransformationGestures?: SharedValue<boolean>;

    /** A shared value updated while transform gestures or transform animations are active. */
    isTransformGestureActive?: SharedValue<boolean>;

    isPagerScrollEnabled: SharedValue<boolean>;

    /** If there is a pager wrapping the canvas that swipes with a pan gesture (web), the canvas pan gesture needs to work simultaneously with it */
    pagerGesture?: PanGesture;

    isUsedInCarousel: boolean;

    /** Handles scale changed event */
    onScaleChanged?: OnScaleChangedCallback;

    /** Handles scale changed event */
    onTap?: OnTapCallback;

    /** Handles swipe down event */
    onSwipeDown?: OnSwipeDownCallback;

    /** Whether swipe-down-to-close should be disabled while preserving other pan gestures. */
    shouldDisableSwipeDownToClose?: boolean;

    /** Whether the wrapper should prevent the browser's default touch-end behavior. */
    shouldPreventTouchEndDefault?: boolean;

    /** We need to ensure that any native gesture handlers in this component tree is working simultaneously with panning and do not get blocked. */
    externalGestureHandler?: NativeGesture;
};

const defaultContentSize = {width: 1, height: 1};

function MultiGestureCanvas({
    canvasSize,
    contentSize: contentSizeProp,
    zoomRange: zoomRangeProp,
    isActive = true,
    children,
    pagerGesture,
    isUsedInCarousel,
    shouldDisableTransformationGestures: shouldDisableTransformationGesturesProp,
    isTransformGestureActive: isTransformGestureActiveProp,
    isPagerScrollEnabled,
    onTap,
    onScaleChanged,
    onSwipeDown,
    shouldDisableSwipeDownToClose = false,
    shouldPreventTouchEndDefault = true,
    externalGestureHandler,
}: MultiGestureCanvasProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const contentSize = contentSizeProp ?? defaultContentSize;
    const shouldDisableTransformationGesturesFallback = useSharedValue(false);
    const shouldDisableTransformationGestures = shouldDisableTransformationGesturesProp ?? shouldDisableTransformationGesturesFallback;
    const isTransformGestureActiveFallback = useSharedValue(false);
    const isTransformGestureActive = isTransformGestureActiveProp ?? isTransformGestureActiveFallback;

    const zoomRange = useMemo(
        () => ({
            min: zoomRangeProp?.min ?? DEFAULT_ZOOM_RANGE.min,
            max: zoomRangeProp?.max ?? DEFAULT_ZOOM_RANGE.max,
        }),
        [zoomRangeProp?.max, zoomRangeProp?.min],
    );

    // Based on the (original) content size and the canvas size, we calculate the horizontal and vertical scale factors
    // to fit the content inside the canvas
    // We later use the lower of the two scale factors to fit the content inside the canvas
    const {minScale: minContentScale, maxScale: maxContentScale} = useMemo(() => MultiGestureCanvasUtils.getCanvasFitScale({canvasSize, contentSize}), [canvasSize, contentSize]);

    const zoomScale = useSharedValue(1);

    // Adding together zoom scale and the initial scale to fit the content into the canvas
    // Using the minimum content scale, so that the image is not bigger than the canvas
    // and not smaller than needed to fit
    const totalScale = useDerivedValue(() => zoomScale.get() * minContentScale, [minContentScale]);

    const panTranslateX = useSharedValue(0);
    const panTranslateY = useSharedValue(0);
    const isSwipingDownToClose = useSharedValue(false);

    const pinchScale = useSharedValue(1);
    const pinchTranslateX = useSharedValue(0);
    const pinchTranslateY = useSharedValue(0);

    // Total offset of the content including previous translations from panning and pinching gestures
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    useAnimatedReaction(
        () => isSwipingDownToClose.get(),
        (current) => {
            if (!isUsedInCarousel) {
                return;
            }

            isPagerScrollEnabled.set(!current);
        },
    );

    /**
     * Stops any currently running decay animation from panning
     */
    const stopAnimation = useCallback(() => {
        'worklet';

        cancelAnimation(offsetX);
        cancelAnimation(offsetY);
    }, [offsetX, offsetY]);

    /**
     * Resets the canvas to the initial state and animates back smoothly
     */
    const reset = useCallback(
        (animated: boolean, callback?: () => void) => {
            'worklet';

            stopAnimation();

            offsetX.set(0);
            offsetY.set(0);
            pinchScale.set(1);

            if (animated) {
                panTranslateX.set(withSpring(0, SPRING_CONFIG));
                panTranslateY.set(withSpring(0, SPRING_CONFIG));
                pinchTranslateX.set(withSpring(0, SPRING_CONFIG));
                pinchTranslateY.set(withSpring(0, SPRING_CONFIG));
                zoomScale.set(withSpring(1, SPRING_CONFIG, callback));

                return;
            }

            panTranslateX.set(0);
            panTranslateY.set(0);
            pinchTranslateX.set(0);
            pinchTranslateY.set(0);
            zoomScale.set(1);

            if (callback === undefined) {
                return;
            }

            callback();
        },
        [offsetX, offsetY, panTranslateX, panTranslateY, pinchScale, pinchTranslateX, pinchTranslateY, stopAnimation, zoomScale],
    );

    // Gestures from outside of the canvas that the pan gesture has to work simultaneously with
    const panGestureExternalGestures = [pagerGesture, externalGestureHandler].filter((gesture) => gesture !== undefined);

    const panGesture = usePanGesture({
        canvasSize,
        contentSize,
        zoomScale,
        totalScale,
        offsetX,
        offsetY,
        panTranslateX,
        panTranslateY,
        stopAnimation,
        shouldDisableTransformationGestures,
        isSwipingDownToClose,
        shouldDisableSwipeDownToClose,
        onSwipeDown,
        simultaneousWith: panGestureExternalGestures,
    });

    // The tap gestures are created after the pan gesture, because the single tap waits for it to fail.
    // They also declare that they can run simultaneously with the pan gesture, which is symmetric.
    const {singleTapGesture, doubleTapGesture} = useTapGestures({
        canvasSize,
        contentSize,
        zoomRange,
        minContentScale,
        maxContentScale,
        offsetX,
        offsetY,
        pinchScale,
        zoomScale,
        reset,
        stopAnimation,
        onScaleChanged,
        isTransformGestureActive,
        onTap,
        shouldDisableTransformationGestures,
        panGesture,
    });

    const pinchSimultaneousGestures = [panGesture, singleTapGesture, doubleTapGesture];

    const pinchGesture = usePinchGesture({
        canvasSize,
        zoomScale,
        zoomRange,
        offsetX,
        offsetY,
        pinchTranslateX,
        pinchTranslateY,
        pinchScale,
        stopAnimation,
        onScaleChanged,
        isTransformGestureActive,
        shouldDisableTransformationGestures,
        simultaneousWith: pinchSimultaneousGestures,
    });

    const tapsAndPanGesture = useCompetingGestures(singleTapGesture, doubleTapGesture, panGesture);
    const canvasGesture = useSimultaneousGestures(pinchGesture, tapsAndPanGesture);

    // Trigger a reset when the canvas gets inactive, but only if it was already mounted before
    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        if (!isActive) {
            scheduleOnUI(reset, false);
        }
    }, [isActive, mounted, reset]);

    // Animate the x and y position of the content within the canvas based on all of the gestures
    const animatedStyles = useAnimatedStyle(() => {
        const x = pinchTranslateX.get() + panTranslateX.get() + offsetX.get();
        const y = pinchTranslateY.get() + panTranslateY.get() + offsetY.get();

        return {
            transform: [
                {
                    translateX: x,
                },
                {
                    translateY: y,
                },
                {scale: totalScale.get()},
            ],
            // Hide the image if the size is not ready yet
            opacity: contentSizeProp?.width ? 1 : 0,
        };
    });

    const containerStyles = useMemo(() => [styles.flex1, StyleUtils.getMultiGestureCanvasContainerStyle(canvasSize.width)], [StyleUtils, canvasSize.width, styles.flex1]);

    return (
        <View
            collapsable={false}
            style={containerStyles}
        >
            <GestureDetector gesture={canvasGesture}>
                <View
                    collapsable={false}
                    onTouchEnd={(e) => {
                        if (!shouldPreventTouchEndDefault) {
                            return;
                        }

                        e.preventDefault();
                    }}
                    style={StyleUtils.getFullscreenCenteredContentStyles()}
                >
                    <Animated.View
                        collapsable={false}
                        style={[animatedStyles, styles.canvasContainer]}
                    >
                        {children}
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
}

export default MultiGestureCanvas;
export {DEFAULT_ZOOM_RANGE};
