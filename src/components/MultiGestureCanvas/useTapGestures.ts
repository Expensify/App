import type {PanGesture, TapGesture} from 'react-native-gesture-handler';

import {useCallback, useMemo} from 'react';
import {GestureStateManager, useTapGesture} from 'react-native-gesture-handler';
import {withSpring} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type {MultiGestureCanvasVariables} from './types';

import {DOUBLE_TAP_SCALE, SPRING_CONFIG} from './constants';
import * as MultiGestureCanvasUtils from './utils';

type UseTapGesturesProps = Pick<
    MultiGestureCanvasVariables,
    | 'canvasSize'
    | 'contentSize'
    | 'zoomRange'
    | 'minContentScale'
    | 'maxContentScale'
    | 'offsetX'
    | 'offsetY'
    | 'pinchScale'
    | 'zoomScale'
    | 'shouldDisableTransformationGestures'
    | 'isTransformGestureActive'
    | 'reset'
    | 'stopAnimation'
    | 'onScaleChanged'
    | 'onTap'
> & {
    /** The pan gesture of the canvas. A single tap waits for it to fail, and both taps can run simultaneously with it */
    panGesture: PanGesture;
};

const useTapGestures = ({
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
    shouldDisableTransformationGestures,
    isTransformGestureActive,
    onScaleChanged,
    onTap,
    panGesture,
}: UseTapGesturesProps): {singleTapGesture: TapGesture; doubleTapGesture: TapGesture} => {
    // The content size after scaling it with minimum scale to fit the content into the canvas
    const scaledContentWidth = useMemo(() => contentSize.width * minContentScale, [contentSize.width, minContentScale]);
    const scaledContentHeight = useMemo(() => contentSize.height * minContentScale, [contentSize.height, minContentScale]);

    // On double tap the content should be zoomed to fill, but at least zoomed by DOUBLE_TAP_SCALE — never past the allowed zoom range
    const doubleTapScale = useMemo(() => Math.min(zoomRange.max, Math.max(DOUBLE_TAP_SCALE, maxContentScale / minContentScale)), [maxContentScale, minContentScale, zoomRange.max]);

    const zoomToCoordinates = useCallback(
        (focalX: number, focalY: number, callback: () => void) => {
            'worklet';

            stopAnimation();
            isTransformGestureActive.set(true);

            // By how much the canvas is bigger than the content horizontally and vertically per side
            const horizontalCanvasOffset = Math.max(0, (canvasSize.width - scaledContentWidth) / 2);
            const verticalCanvasOffset = Math.max(0, (canvasSize.height - scaledContentHeight) / 2);

            // We need to adjust the focal point to take into account the canvas offset
            // The focal point cannot be outside of the content's bounds
            const adjustedFocalPoint = {
                x: MultiGestureCanvasUtils.clamp(focalX - horizontalCanvasOffset, 0, scaledContentWidth),
                y: MultiGestureCanvasUtils.clamp(focalY - verticalCanvasOffset, 0, scaledContentHeight),
            };

            // The center of the canvas
            const canvasCenter = {
                x: canvasSize.width / 2,
                y: canvasSize.height / 2,
            };

            // The center of the content before zooming
            const originalContentCenter = {
                x: scaledContentWidth / 2,
                y: scaledContentHeight / 2,
            };

            // The size of the content after zooming
            const zoomedContentSize = {
                width: scaledContentWidth * doubleTapScale,
                height: scaledContentHeight * doubleTapScale,
            };

            // The center of the zoomed content
            const zoomedContentCenter = {
                x: zoomedContentSize.width / 2,
                y: zoomedContentSize.height / 2,
            };

            // By how much the zoomed content is bigger/smaller than the canvas.
            const zoomedContentOffset = {
                x: zoomedContentCenter.x - canvasCenter.x,
                y: zoomedContentCenter.y - canvasCenter.y,
            };

            // How much the content needs to be shifted based on the focal point
            const shiftingFactor = {
                x: adjustedFocalPoint.x / originalContentCenter.x - 1,
                y: adjustedFocalPoint.y / originalContentCenter.y - 1,
            };

            // The offset after applying the focal point adjusted shift.
            // We need to invert the shift, because the content is moving in the opposite direction (* -1)
            const offsetAfterZooming = {
                x: zoomedContentOffset.x * (shiftingFactor.x * -1),
                y: zoomedContentOffset.y * (shiftingFactor.y * -1),
            };

            // If the zoomed content is less tall than the canvas, we need to reset the vertical offset
            if (zoomedContentSize.height < canvasSize.height) {
                offsetAfterZooming.y = 0;
            }

            offsetX.set(withSpring(offsetAfterZooming.x, SPRING_CONFIG));
            offsetY.set(withSpring(offsetAfterZooming.y, SPRING_CONFIG));
            zoomScale.set(
                withSpring(doubleTapScale, SPRING_CONFIG, () => {
                    callback();
                    isTransformGestureActive.set(false);
                }),
            );
            pinchScale.set(doubleTapScale);
        },
        [stopAnimation, isTransformGestureActive, canvasSize.width, canvasSize.height, scaledContentWidth, scaledContentHeight, doubleTapScale, offsetX, offsetY, zoomScale, pinchScale],
    );

    const doubleTapGesture = useTapGesture({
        numberOfTaps: 2,
        maxDelay: 150,
        maxDistance: 20,
        simultaneousWith: panGesture,
        onTouchesDown: (evt) => {
            'worklet';

            if (!shouldDisableTransformationGestures.get()) {
                return;
            }

            GestureStateManager.fail(evt.handlerTag);
        },
        onDeactivate: (evt) => {
            'worklet';

            const triggerScaleChangedEvent = () => {
                'worklet';

                if (onScaleChanged != null) {
                    scheduleOnRN(onScaleChanged, zoomScale.get());
                }
            };

            // If the content is already zoomed, we want to reset the zoom,
            // otherwise we want to zoom in
            if (zoomScale.get() > 1) {
                isTransformGestureActive.set(true);
                reset(true, () => {
                    triggerScaleChangedEvent();
                    isTransformGestureActive.set(false);
                });
            } else {
                zoomToCoordinates(evt.x, evt.y, triggerScaleChangedEvent);
            }
        },
    });

    const singleTapGesture = useTapGesture({
        numberOfTaps: 1,
        maxDuration: 125,
        requireToFail: [doubleTapGesture, panGesture],
        simultaneousWith: panGesture,
        onBegin: () => {
            'worklet';

            stopAnimation();
        },
        onFinalize: (evt) => {
            'worklet';

            if (evt.canceled || onTap === undefined) {
                return;
            }

            scheduleOnRN(onTap);
        },
    });

    return {singleTapGesture, doubleTapGesture};
};

export default useTapGestures;
