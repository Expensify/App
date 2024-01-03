/* eslint-disable no-param-reassign */
import {useEffect, useState} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS, useAnimatedReaction, useSharedValue, withSpring} from 'react-native-reanimated';
import * as MultiGestureCanvasUtils from './utils';

const SPRING_CONFIG = MultiGestureCanvasUtils.SPRING_CONFIG;
const zoomScaleBounceFactors = MultiGestureCanvasUtils.zoomScaleBounceFactors;
const useWorkletCallback = MultiGestureCanvasUtils.useWorkletCallback;

const usePinchGesture = ({
    canvasSize,
    singleTap,
    doubleTap,
    panGesture,
    zoomScale,
    zoomRange,
    totalOffsetX,
    totalOffsetY,
    pinchTranslateX,
    pinchTranslateY,
    pinchBounceTranslateX,
    pinchBounceTranslateY,
    pinchScaleOffset,
    isSwipingInPager,
    stopAnimation,
    onScaleChanged,
    onPinchGestureChange,
}) => {
    const isPinchGestureRunning = useSharedValue(false);
    // used to store event scale value when we limit scale
    const pinchGestureScale = useSharedValue(1);
    // origin of the pinch gesture
    const pinchOrigin = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    const getAdjustedFocal = useWorkletCallback(
        (focalX, focalY) => ({
            x: focalX - (canvasSize.width / 2 + totalOffsetX.value),
            y: focalY - (canvasSize.height / 2 + totalOffsetY.value),
        }),
        [canvasSize.width, canvasSize.height],
    );
    const pinchGesture = Gesture.Pinch()
        .onTouchesDown((evt, state) => {
            // we don't want to activate pinch gesture when we are scrolling pager
            if (!isSwipingInPager.value) {
                return;
            }

            state.fail();
        })
        .simultaneousWithExternalGesture(panGesture, singleTap, doubleTap)
        .onStart((evt) => {
            isPinchGestureRunning.value = true;

            stopAnimation();

            const adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);

            pinchOrigin.x.value = adjustedFocal.x;
            pinchOrigin.y.value = adjustedFocal.y;
        })
        .onChange((evt) => {
            const newZoomScale = pinchScaleOffset.value * evt.scale;

            // limit zoom scale to zoom range and bounce if we go out of range
            if (zoomScale.value >= zoomRange.min * zoomScaleBounceFactors.min && zoomScale.value <= zoomRange.max * zoomScaleBounceFactors.max) {
                zoomScale.value = newZoomScale;
                pinchGestureScale.value = evt.scale;
            }

            // calculate new pinch translation
            const adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);
            const newPinchTranslateX = adjustedFocal.x + pinchGestureScale.value * pinchOrigin.x.value * -1;
            const newPinchTranslateY = adjustedFocal.y + pinchGestureScale.value * pinchOrigin.y.value * -1;

            if (zoomScale.value >= zoomRange.min && zoomScale.value <= zoomRange.max) {
                pinchTranslateX.value = newPinchTranslateX;
                pinchTranslateY.value = newPinchTranslateY;
            } else {
                // Store x and y translation that is produced while bouncing to separate variables
                // so that we can revert the bounce once pinch gesture is released
                pinchBounceTranslateX.value = newPinchTranslateX - pinchTranslateX.value;
                pinchBounceTranslateY.value = newPinchTranslateY - pinchTranslateY.value;
            }
        })
        .onEnd(() => {
            // Add pinch translation to total offset
            totalOffsetX.value += pinchTranslateX.value;
            totalOffsetY.value += pinchTranslateY.value;
            // Reset pinch gesture variables
            pinchTranslateX.value = 0;
            pinchTranslateY.value = 0;
            pinchGestureScale.value = 1;
            isPinchGestureRunning.value = false;

            if (zoomScale.value < zoomRange.min) {
                pinchScaleOffset.value = zoomRange.min;
                zoomScale.value = withSpring(zoomRange.min, SPRING_CONFIG);
            } else if (zoomScale.value > zoomRange.max) {
                pinchScaleOffset.value = zoomRange.max;
                zoomScale.value = withSpring(zoomRange.max, SPRING_CONFIG);
            } else {
                pinchScaleOffset.value = zoomScale.value;
            }

            if (pinchBounceTranslateX.value !== 0 || pinchBounceTranslateY.value !== 0) {
                pinchBounceTranslateX.value = withSpring(0, SPRING_CONFIG);
                pinchBounceTranslateY.value = withSpring(0, SPRING_CONFIG);
            }

            if (onScaleChanged != null) {
                runOnJS(onScaleChanged)(pinchScaleOffset.value);
            }
        });

    // Triggers "onPinchGestureChange" callback when pinch scale changes
    const [isPinchGestureInUse, setIsPinchGestureInUse] = useState(false);
    useAnimatedReaction(
        () => [zoomScale.value, isPinchGestureRunning.value],
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
