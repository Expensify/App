import type {ForwardedRef} from 'react';
import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {GestureType} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import type {GestureRef} from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gesture';
import type PagerView from 'react-native-pager-view';
import type {SharedValue} from 'react-native-reanimated';
import Animated, {cancelAnimation, runOnUI, useAnimatedStyle, useDerivedValue, useSharedValue, useWorkletCallback, withSpring} from 'react-native-reanimated';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {DEFAULT_ZOOM_RANGE, SPRING_CONFIG, ZOOM_RANGE_BOUNCE_FACTORS} from './constants';
import type {CanvasSize, ContentSize, OnScaleChangedCallback, OnSwipeDownCallback, OnTapCallback, ZoomRange} from './types';
import usePanGesture from './usePanGesture';
import usePinchGesture from './usePinchGesture';
import useTapGestures from './useTapGestures';
import * as MultiGestureCanvasUtils from './utils';

type MultiGestureCanvasProps = ChildrenProps & {
    /**
     * Wheter the canvas is currently active (in the screen) or not.
     * Disables certain gestures and functionality
     */
    isActive?: boolean;

    /** The width and height of the canvas.
     *  This is needed in order to properly scale the content in the canvas
     */
    canvasSize: CanvasSize;

    /** The width and height of the content.
     *  This is needed in order to properly scale the content in the canvas
     */
    contentSize?: ContentSize;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange?: Partial<ZoomRange>;

    /** A shared value of type boolean, that indicates disabled the transformation gestures (pinch, pan, double tap) */
    shouldDisableTransformationGestures?: SharedValue<boolean>;

    /** If there is a pager wrapping the canvas, we need to disable the pan gesture in case the pager is swiping */
    pagerRef?: ForwardedRef<PagerView | GestureType>; // TODO: For TS migration: Exclude<GestureRef, number>

    /** Handles scale changed event */
    onScaleChanged?: OnScaleChangedCallback;

    /** Handles scale changed event */
    onTap?: OnTapCallback;

    /** Handles swipe down event */
    onSwipeDown?: OnSwipeDownCallback;
};

const defaultContentSize = {width: 1, height: 1};

function MultiGestureCanvas({
    canvasSize,
    contentSize: contentSizeProp,
    zoomRange: zoomRangeProp,
    isActive = true,
    children,
    pagerRef,
    shouldDisableTransformationGestures: shouldDisableTransformationGesturesProp,
    onTap,
    onScaleChanged,
    onSwipeDown,
}: MultiGestureCanvasProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const contentSize = contentSizeProp ?? defaultContentSize;
    const shouldDisableTransformationGesturesFallback = useSharedValue(false);
    const shouldDisableTransformationGestures = shouldDisableTransformationGesturesProp ?? shouldDisableTransformationGesturesFallback;

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
    const totalScale = useDerivedValue(() => zoomScale.value * minContentScale, [minContentScale]);

    const panTranslateX = useSharedValue(0);
    const panTranslateY = useSharedValue(0);
    const isSwipingDownToClose = useSharedValue(false);
    const panGestureRef = useRef(Gesture.Pan());

    const pinchScale = useSharedValue(1);
    const pinchTranslateX = useSharedValue(0);
    const pinchTranslateY = useSharedValue(0);

    // Total offset of the content including previous translations from panning and pinching gestures
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    /**
     * Stops any currently running decay animation from panning
     */
    const stopAnimation = useWorkletCallback(() => {
        cancelAnimation(offsetX);
        cancelAnimation(offsetY);
    });

    /**
     * Resets the canvas to the initial state and animates back smoothly
     */
    const reset = useWorkletCallback((animated: boolean, callback?: () => void) => {
        stopAnimation();

        // eslint-disable-next-line react-compiler/react-compiler
        offsetX.value = 0;
        offsetY.value = 0;
        pinchScale.value = 1;

        if (animated) {
            panTranslateX.value = withSpring(0, SPRING_CONFIG);
            panTranslateY.value = withSpring(0, SPRING_CONFIG);
            pinchTranslateX.value = withSpring(0, SPRING_CONFIG);
            pinchTranslateY.value = withSpring(0, SPRING_CONFIG);
            zoomScale.value = withSpring(1, SPRING_CONFIG, callback);

            return;
        }

        panTranslateX.value = 0;
        panTranslateY.value = 0;
        pinchTranslateX.value = 0;
        pinchTranslateY.value = 0;
        zoomScale.value = 1;

        if (callback === undefined) {
            return;
        }

        callback();
    });

    const {singleTapGesture: baseSingleTapGesture, doubleTapGesture} = useTapGestures({
        canvasSize,
        contentSize,
        minContentScale,
        maxContentScale,
        offsetX,
        offsetY,
        pinchScale,
        zoomScale,
        reset,
        stopAnimation,
        onScaleChanged,
        onTap,
        shouldDisableTransformationGestures,
    });
    const singleTapGesture = baseSingleTapGesture.requireExternalGestureToFail(doubleTapGesture, panGestureRef);

    const panGestureSimultaneousList = useMemo(
        () => (pagerRef === undefined ? [singleTapGesture, doubleTapGesture] : [pagerRef as unknown as Exclude<GestureRef, number>, singleTapGesture, doubleTapGesture]),
        [doubleTapGesture, pagerRef, singleTapGesture],
    );

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
        onSwipeDown,
    })
        .simultaneousWithExternalGesture(...panGestureSimultaneousList)
        .withRef(panGestureRef);

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
        shouldDisableTransformationGestures,
    }).simultaneousWithExternalGesture(panGesture, singleTapGesture, doubleTapGesture);

    // Trigger a reset when the canvas gets inactive, but only if it was already mounted before
    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        if (!isActive) {
            runOnUI(reset)(false);
        }
    }, [isActive, mounted, reset]);

    // Animate the x and y position of the content within the canvas based on all of the gestures
    const animatedStyles = useAnimatedStyle(() => {
        const x = pinchTranslateX.value + panTranslateX.value + offsetX.value;
        const y = pinchTranslateY.value + panTranslateY.value + offsetY.value;

        return {
            transform: [
                {
                    translateX: x,
                },
                {
                    translateY: y,
                },
                {scale: totalScale.value},
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
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, Gesture.Race(singleTapGesture, doubleTapGesture, panGesture))}>
                <View
                    collapsable={false}
                    onTouchEnd={(e) => e.preventDefault()}
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
MultiGestureCanvas.displayName = 'MultiGestureCanvas';

export default MultiGestureCanvas;
export {DEFAULT_ZOOM_RANGE, ZOOM_RANGE_BOUNCE_FACTORS};
export type {MultiGestureCanvasProps};
