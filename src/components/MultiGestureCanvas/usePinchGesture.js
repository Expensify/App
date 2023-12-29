/* eslint-disable no-param-reassign */
import {useEffect, useState} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS, useAnimatedReaction, useSharedValue, useWorkletCallback, withSpring} from 'react-native-reanimated';
import * as MultiGestureCanvasUtils from './utils';

const SPRING_CONFIG = MultiGestureCanvasUtils.SPRING_CONFIG;
const zoomScaleBounceFactors = MultiGestureCanvasUtils.zoomScaleBounceFactors;

const usePinchGesture = ({
    canvasSize,
    singleTap,
    doubleTap,
    panGesture,
    zoomScale,
    zoomRange,
    offsetX,
    offsetY,
    pinchTranslateX,
    pinchTranslateY,
    pinchBounceTranslateX,
    pinchBounceTranslateY,
    pinchScaleOffset,
    isScrolling,
    stopAnimation,
    onScaleChanged,
    onPinchGestureChange,
}) => {
    // used to store event scale value when we limit scale
    const pinchGestureScale = useSharedValue(1);
    const pinchGestureRunning = useSharedValue(false);
    // origin of the pinch gesture
    const pinchOrigin = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    const getAdjustedFocal = useWorkletCallback(
        (focalX, focalY) => ({
            x: focalX - (canvasSize.width / 2 + offsetX.value),
            y: focalY - (canvasSize.height / 2 + offsetY.value),
        }),
        [canvasSize.width, canvasSize.height],
    );
    const pinchGesture = Gesture.Pinch()
        .onTouchesDown((evt, state) => {
            // we don't want to activate pinch gesture when we are scrolling pager
            if (!isScrolling.value) {
                return;
            }

            state.fail();
        })
        .simultaneousWithExternalGesture(panGesture, singleTap, doubleTap)
        .onStart((evt) => {
            pinchGestureRunning.value = true;

            stopAnimation();

            const adjustFocal = getAdjustedFocal(evt.focalX, evt.focalY);

            pinchOrigin.x.value = adjustFocal.x;
            pinchOrigin.y.value = adjustFocal.y;
        })
        .onChange((evt) => {
            const newZoomScale = pinchScaleOffset.value * evt.scale;

            if (zoomScale.value >= zoomRange.min * zoomScaleBounceFactors.min && zoomScale.value <= zoomRange.max * zoomScaleBounceFactors.max) {
                zoomScale.value = newZoomScale;
                pinchGestureScale.value = evt.scale;
            }

            const adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);
            const newPinchTranslateX = adjustedFocal.x + pinchGestureScale.value * pinchOrigin.x.value * -1;
            const newPinchTranslateY = adjustedFocal.y + pinchGestureScale.value * pinchOrigin.y.value * -1;

            if (zoomScale.value >= zoomRange.min && zoomScale.value <= zoomRange.max) {
                pinchTranslateX.value = newPinchTranslateX;
                pinchTranslateY.value = newPinchTranslateY;
            } else {
                pinchBounceTranslateX.value = newPinchTranslateX - pinchTranslateX.value;
                pinchBounceTranslateY.value = newPinchTranslateY - pinchTranslateY.value;
            }
        })
        .onEnd(() => {
            offsetX.value += pinchTranslateX.value;
            offsetY.value += pinchTranslateY.value;
            pinchTranslateX.value = 0;
            pinchTranslateY.value = 0;
            pinchScaleOffset.value = zoomScale.value;
            pinchGestureScale.value = 1;

            if (pinchScaleOffset.value < zoomRange.min) {
                pinchScaleOffset.value = zoomRange.min;
                zoomScale.value = withSpring(zoomRange.min, SPRING_CONFIG);
            } else if (pinchScaleOffset.value > zoomRange.max) {
                pinchScaleOffset.value = zoomRange.max;
                zoomScale.value = withSpring(zoomRange.max, SPRING_CONFIG);
            }

            if (pinchBounceTranslateX.value !== 0 || pinchBounceTranslateY.value !== 0) {
                pinchBounceTranslateX.value = withSpring(0, SPRING_CONFIG);
                pinchBounceTranslateY.value = withSpring(0, SPRING_CONFIG);
            }

            pinchGestureRunning.value = false;

            if (onScaleChanged != null) {
                runOnJS(onScaleChanged)(zoomScale.value);
            }
        });

    // Triggers "onPinchGestureChange" callback when pinch scale changes
    const [isPinchGestureInUse, setIsPinchGestureInUse] = useState(false);
    useAnimatedReaction(
        () => [zoomScale.value, pinchGestureRunning.value],
        ([zoom, running]) => {
            const newIsPinchGestureInUse = zoom !== 1 || running;
            if (isPinchGestureInUse !== newIsPinchGestureInUse) {
                runOnJS(setIsPinchGestureInUse)(newIsPinchGestureInUse);
            }
        },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => onPinchGestureChange(isPinchGestureInUse), [isPinchGestureInUse]);

    return pinchGesture;
};

export default usePinchGesture;
