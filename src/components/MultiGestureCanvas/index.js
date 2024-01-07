import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {cancelAnimation, runOnUI, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring} from 'react-native-reanimated';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getCanvasFitScale from './getCanvasFitScale';
import {defaultZoomRange, multiGestureCanvasDefaultProps, multiGestureCanvasPropTypes} from './propTypes';
import usePanGesture from './usePanGesture';
import usePinchGesture from './usePinchGesture';
import useTapGestures from './useTapGestures';
import * as MultiGestureCanvasUtils from './utils';

function getDeepDefaultProps({contentSize: contentSizeProp = {}, zoomRange: zoomRangeProp = {}}) {
    const contentSize = {
        width: contentSizeProp.width == null ? 1 : contentSizeProp.width,
        height: contentSizeProp.height == null ? 1 : contentSizeProp.height,
    };

    const zoomRange = {
        min: zoomRangeProp.min == null ? defaultZoomRange.min : zoomRangeProp.min,
        max: zoomRangeProp.max == null ? defaultZoomRange.max : zoomRangeProp.max,
    };

    return {contentSize, zoomRange};
}

function MultiGestureCanvas({canvasSize, isActive, areTransformationsEnabled, onScaleChanged, onTap, children, ...props}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {contentSize, zoomRange} = getDeepDefaultProps(props);

    // Based on the (original) content size and the canvas size, we calculate the horizontal and vertical scale factors
    // to fit the content inside the canvas
    // We later use the lower of the two scale factors to fit the content inside the canvas
    const {minScale: minContentScale, maxScale: maxContentScale} = useMemo(() => getCanvasFitScale({canvasSize, contentSize}), [canvasSize, contentSize]);

    const zoomScale = useSharedValue(1);

    // Adding together zoom scale and the initial scale to fit the content into the canvas
    // Using the minimum content scale, so that the image is not bigger than the canvas
    // and not smaller than needed to fit
    const totalScale = useDerivedValue(() => zoomScale.value * minContentScale, [minContentScale]);

    const panTranslateX = useSharedValue(0);
    const panTranslateY = useSharedValue(0);
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
    const stopAnimation = MultiGestureCanvasUtils.useWorkletCallback(() => {
        cancelAnimation(offsetX);
        cancelAnimation(offsetY);
    });

    /**
     * Resets the canvas to the initial state and animates back smoothly
     */
    const reset = MultiGestureCanvasUtils.useWorkletCallback((animated, callbackProp) => {
        const callback = callbackProp || (() => {});

        pinchScale.value = 1;
        stopAnimation();

        if (animated) {
            offsetX.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            offsetY.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            panTranslateX.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            panTranslateY.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            pinchTranslateX.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            pinchTranslateY.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            zoomScale.value = withSpring(1, MultiGestureCanvasUtils.SPRING_CONFIG, callback);
            return;
        }

        offsetX.value = 0;
        offsetY.value = 0;
        panTranslateX.value = 0;
        panTranslateY.value = 0;
        pinchTranslateX.value = 0;
        pinchTranslateY.value = 0;
        zoomScale.value = 1;

        callback();
    });

    const {singleTapGesture: baseSingleTapGesture, doubleTapGesture} = useTapGestures({
        areTransformationsEnabled,
        canvasSize,
        contentSize,
        minContentScale,
        maxContentScale,
        panGestureRef,
        offsetX,
        offsetY,
        pinchScale,
        zoomScale,
        reset,
        stopAnimation,
        onScaleChanged,
        onTap,
    });
    const singleTapGesture = baseSingleTapGesture.requireExternalGestureToFail(doubleTapGesture, panGestureRef);

    const panGesture = usePanGesture({
        areTransformationsEnabled,
        canvasSize,
        contentSize,
        zoomScale,
        totalScale,
        offsetX,
        offsetY,
        panTranslateX,
        panTranslateY,
        stopAnimation,
    })
        .simultaneousWithExternalGesture(singleTapGesture, doubleTapGesture)
        .withRef(panGestureRef);

    const pinchGesture = usePinchGesture({
        areTransformationsEnabled,
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
        };
    });

    return (
        <View
            collapsable={false}
            style={[
                styles.flex1,
                {
                    width: canvasSize.width,
                    overflow: 'hidden',
                },
            ]}
        >
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, Gesture.Race(singleTapGesture, doubleTapGesture, panGesture))}>
                <View
                    collapsable={false}
                    style={StyleUtils.getFullscreenCenteredContentStyles()}
                >
                    <Animated.View
                        collapsable={false}
                        style={animatedStyles}
                    >
                        {children}
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
}
MultiGestureCanvas.propTypes = multiGestureCanvasPropTypes;
MultiGestureCanvas.defaultProps = multiGestureCanvasDefaultProps;
MultiGestureCanvas.displayName = 'MultiGestureCanvas';

export default MultiGestureCanvas;
export {defaultZoomRange};
export {zoomScaleBounceFactors} from './utils';
