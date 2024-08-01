/* eslint-disable no-param-reassign */
import {useEffect, useState} from 'react';
import type {PinchGesture} from 'react-native-gesture-handler';
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS, useAnimatedReaction, useSharedValue, useWorkletCallback, withSpring} from 'react-native-reanimated';
import {SPRING_CONFIG, ZOOM_RANGE_BOUNCE_FACTORS} from './constants';
import type {MultiGestureCanvasVariables} from './types';

type UsePinchGestureProps = Pick<
    MultiGestureCanvasVariables,
    | 'canvasSize'
    | 'zoomScale'
    | 'zoomRange'
    | 'offsetX'
    | 'offsetY'
    | 'pinchTranslateX'
    | 'pinchTranslateY'
    | 'pinchScale'
    | 'shouldDisableTransformationGestures'
    | 'stopAnimation'
    | 'onScaleChanged'
>;

const usePinchGesture = ({
    canvasSize,
    zoomScale,
    zoomRange,
    offsetX,
    offsetY,
    pinchTranslateX: totalPinchTranslateX,
    pinchTranslateY: totalPinchTranslateY,
    pinchScale,
    shouldDisableTransformationGestures,
    stopAnimation,
    onScaleChanged,
}: UsePinchGestureProps): PinchGesture => {
    // The current pinch gesture event scale
    const currentPinchScale = useSharedValue(1);

    // Origin of the pinch gesture
    const pinchOrigin = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    // How much the content is translated during the pinch gesture
    // While the pinch gesture is running, the pan gesture is disabled
    // Therefore we need to add the translation separately
    const pinchTranslateX = useSharedValue(0);
    const pinchTranslateY = useSharedValue(0);

    // In order to keep track of the "bounce" effect when "overzooming"/"underzooming",
    // we need to have extra "bounce" translation variables
    const pinchBounceTranslateX = useSharedValue(0);
    const pinchBounceTranslateY = useSharedValue(0);

    const triggerScaleChangedEvent = () => {
        'worklet';

        if (onScaleChanged === undefined) {
            return;
        }

        runOnJS(onScaleChanged)(zoomScale.value);
    };

    // Update the total (pinch) translation based on the regular pinch + bounce
    useAnimatedReaction(
        () => [pinchTranslateX.value, pinchTranslateY.value, pinchBounceTranslateX.value, pinchBounceTranslateY.value],
        ([translateX, translateY, bounceX, bounceY]) => {
            // eslint-disable-next-line react-compiler/react-compiler
            totalPinchTranslateX.value = translateX + bounceX;
            totalPinchTranslateY.value = translateY + bounceY;
        },
    );

    /**
     * Calculates the adjusted focal point of the pinch gesture,
     * based on the canvas size and the current offset
     */
    const getAdjustedFocal = useWorkletCallback(
        (focalX: number, focalY: number) => ({
            x: focalX - (canvasSize.width / 2 + offsetX.value),
            y: focalY - (canvasSize.height / 2 + offsetY.value),
        }),
        [canvasSize.width, canvasSize.height],
    );

    // The pinch gesture is disabled when we release one of the fingers
    // On the next render, we need to re-enable the pinch gesture
    const [pinchEnabled, setPinchEnabled] = useState(true);
    useEffect(() => {
        if (pinchEnabled) {
            return;
        }
        setPinchEnabled(true);
    }, [pinchEnabled]);

    const pinchGesture = Gesture.Pinch()
        .enabled(pinchEnabled)
        // The first argument is not used, but must be defined
        .onTouchesDown((_evt, state) => {
            // We don't want to activate pinch gesture when we are swiping in the pager
            if (!shouldDisableTransformationGestures.value) {
                return;
            }

            state.fail();
        })
        .onStart((evt) => {
            stopAnimation();

            // Set the origin focal point of the pinch gesture at the start of the gesture
            const adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);
            pinchOrigin.x.value = adjustedFocal.x;
            pinchOrigin.y.value = adjustedFocal.y;
        })
        .onChange((evt) => {
            // Disable the pinch gesture if one finger is released,
            // to prevent the content from shaking/jumping
            if (evt.numberOfPointers !== 2) {
                runOnJS(setPinchEnabled)(false);
                return;
            }

            const newZoomScale = pinchScale.value * evt.scale;

            // Limit the zoom scale to zoom range including bounce range
            if (zoomScale.value >= zoomRange.min * ZOOM_RANGE_BOUNCE_FACTORS.min && zoomScale.value <= zoomRange.max * ZOOM_RANGE_BOUNCE_FACTORS.max) {
                zoomScale.value = newZoomScale;
                currentPinchScale.value = evt.scale;

                triggerScaleChangedEvent();
            }

            // Calculate new pinch translation
            const adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);
            const newPinchTranslateX = adjustedFocal.x + currentPinchScale.value * pinchOrigin.x.value * -1;
            const newPinchTranslateY = adjustedFocal.y + currentPinchScale.value * pinchOrigin.y.value * -1;

            // If the zoom scale is within the zoom range, we perform the regular pinch translation
            // Otherwise it means that we are "overzoomed" or "underzoomed", so we need to bounce back
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
            // Add pinch translation to total offset and reset gesture variables
            offsetX.value += pinchTranslateX.value;
            offsetY.value += pinchTranslateY.value;
            pinchTranslateX.value = 0;
            pinchTranslateY.value = 0;
            currentPinchScale.value = 1;

            // If the content was "overzoomed" or "underzoomed", we need to bounce back with an animation
            if (pinchBounceTranslateX.value !== 0 || pinchBounceTranslateY.value !== 0) {
                pinchBounceTranslateX.value = withSpring(0, SPRING_CONFIG);
                pinchBounceTranslateY.value = withSpring(0, SPRING_CONFIG);
            }

            if (zoomScale.value < zoomRange.min) {
                // If the zoom scale is less than the minimum zoom scale, we need to set the zoom scale to the minimum
                pinchScale.value = zoomRange.min;
                zoomScale.value = withSpring(zoomRange.min, SPRING_CONFIG, triggerScaleChangedEvent);
            } else if (zoomScale.value > zoomRange.max) {
                // If the zoom scale is higher than the maximum zoom scale, we need to set the zoom scale to the maximum
                pinchScale.value = zoomRange.max;
                zoomScale.value = withSpring(zoomRange.max, SPRING_CONFIG, triggerScaleChangedEvent);
            } else {
                // Otherwise, we just update the pinch scale offset
                pinchScale.value = zoomScale.value;
                triggerScaleChangedEvent();
            }
        });

    return pinchGesture;
};

export default usePinchGesture;
