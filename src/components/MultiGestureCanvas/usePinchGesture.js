/* eslint-disable no-param-reassign */
import {useEffect, useState} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS, useAnimatedReaction, useSharedValue, withSpring} from 'react-native-reanimated';
import * as MultiGestureCanvasUtils from './utils';

const usePinchGesture = ({
    canvasSize,
    singleTapGesture,
    doubleTapGesture,
    panGesture,
    zoomScale,
    zoomRange,
    offsetX,
    offsetY,
    pinchTranslateX: totalPinchTranslateX,
    pinchTranslateY: totalPinchTranslateY,
    pinchScale,
    isSwipingInPager,
    stopAnimation,
    onScaleChanged,
    onPinchGestureChange,
}) => {
    const isPinchGestureRunning = useSharedValue(false);

    // Used to store event scale value when we limit scale
    const currentPinchScale = useSharedValue(1);

    // Origin of the pinch gesture
    const pinchOrigin = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    const pinchTranslateX = useSharedValue(0);
    const pinchTranslateY = useSharedValue(0);
    // In order to keep track of the "bounce" effect when pinching over/under the min/max zoom scale
    // we need to have extra "bounce" translation variables
    const pinchBounceTranslateX = useSharedValue(0);
    const pinchBounceTranslateY = useSharedValue(0);

    useAnimatedReaction(
        () => [pinchTranslateX.value, pinchTranslateY.value, pinchBounceTranslateX.value, pinchBounceTranslateY.value],
        ([translateX, translateY, bounceX, bounceY]) => {
            totalPinchTranslateX.value = translateX + bounceX;
            totalPinchTranslateY.value = translateY + bounceY;
        },
    );

    const getAdjustedFocal = MultiGestureCanvasUtils.useWorkletCallback(
        (focalX, focalY) => ({
            x: focalX - (canvasSize.width / 2 + offsetX.value),
            y: focalY - (canvasSize.height / 2 + offsetY.value),
        }),
        [canvasSize.width, canvasSize.height],
    );
    const pinchGesture = Gesture.Pinch()
        .onTouchesDown((evt, state) => {
            // We don't want to activate pinch gesture when we are scrolling pager
            if (!isSwipingInPager.value) {
                return;
            }

            state.fail();
        })
        .simultaneousWithExternalGesture(panGesture, singleTapGesture, doubleTapGesture)
        .onStart((evt) => {
            isPinchGestureRunning.value = true;

            stopAnimation();

            const adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);

            pinchOrigin.x.value = adjustedFocal.x;
            pinchOrigin.y.value = adjustedFocal.y;
        })
        .onChange((evt) => {
            const newZoomScale = pinchScale.value * evt.scale;

            // Limit zoom scale to zoom range including bounce range
            if (
                zoomScale.value >= zoomRange.min * MultiGestureCanvasUtils.zoomScaleBounceFactors.min &&
                zoomScale.value <= zoomRange.max * MultiGestureCanvasUtils.zoomScaleBounceFactors.max
            ) {
                zoomScale.value = newZoomScale;
                currentPinchScale.value = evt.scale;
            }

            // Calculate new pinch translation
            const adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);
            const newPinchTranslateX = adjustedFocal.x + currentPinchScale.value * pinchOrigin.x.value * -1;
            const newPinchTranslateY = adjustedFocal.y + currentPinchScale.value * pinchOrigin.y.value * -1;

            if (zoomScale.value >= zoomRange.min && zoomScale.value <= zoomRange.max) {
                pinchTranslateX.value = newPinchTranslateX;
                pinchTranslateY.value = newPinchTranslateY;
            } else {
                // Store x and y translation that is produced while bouncing
                // so we can revert the bounce once pinch gesture is released
                pinchBounceTranslateX.value = newPinchTranslateX - pinchTranslateX.value;
                pinchBounceTranslateY.value = newPinchTranslateY - pinchTranslateY.value;
            }
        })
        .onEnd(() => {
            // Add pinch translation to total offset
            offsetX.value += totalPinchTranslateX.value;
            offsetY.value += totalPinchTranslateX.value;

            // Reset pinch gesture variables
            pinchTranslateX.value = 0;
            pinchTranslateY.value = 0;
            currentPinchScale.value = 1;
            isPinchGestureRunning.value = false;

            // If the content was "overzoomed" or "underzoomed", we need to bounce back with an animation
            if (pinchBounceTranslateX.value !== 0 || pinchBounceTranslateY.value !== 0) {
                pinchBounceTranslateX.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
                pinchBounceTranslateY.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            }

            if (zoomScale.value < zoomRange.min) {
                // If the zoom scale is less than the minimum zoom scale, we need to set the zoom scale to the minimum
                pinchScale.value = zoomRange.min;
                zoomScale.value = withSpring(zoomRange.min, MultiGestureCanvasUtils.SPRING_CONFIG);
            } else if (zoomScale.value > zoomRange.max) {
                // If the zoom scale is higher than the maximum zoom scale, we need to set the zoom scale to the maximum
                pinchScale.value = zoomRange.max;
                zoomScale.value = withSpring(zoomRange.max, MultiGestureCanvasUtils.SPRING_CONFIG);
            } else {
                // Otherwise, we just update the pinch scale offset
                pinchScale.value = zoomScale.value;
            }

            if (onScaleChanged != null) {
                runOnJS(onScaleChanged)(pinchScale.value);
            }
        });

    // The "useAnimatedReaction" triggers a state update to run the "onPinchGestureChange" only once per re-render
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
