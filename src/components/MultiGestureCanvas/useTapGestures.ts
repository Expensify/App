/* eslint-disable no-param-reassign */
import {useMemo} from 'react';
import type {TapGesture} from 'react-native-gesture-handler';
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS, useWorkletCallback, withSpring} from 'react-native-reanimated';
import {DOUBLE_TAP_SCALE, SPRING_CONFIG} from './constants';
import type {MultiGestureCanvasVariables} from './types';
import * as MultiGestureCanvasUtils from './utils';

type UseTapGesturesProps = Pick<
    MultiGestureCanvasVariables,
    | 'canvasSize'
    | 'contentSize'
    | 'minContentScale'
    | 'maxContentScale'
    | 'offsetX'
    | 'offsetY'
    | 'pinchScale'
    | 'zoomScale'
    | 'shouldDisableTransformationGestures'
    | 'reset'
    | 'stopAnimation'
    | 'onScaleChanged'
    | 'onTap'
>;

const useTapGestures = ({
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
    shouldDisableTransformationGestures,
    onScaleChanged,
    onTap,
}: UseTapGesturesProps): {singleTapGesture: TapGesture; doubleTapGesture: TapGesture} => {
    // The content size after scaling it with minimum scale to fit the content into the canvas
    const scaledContentWidth = useMemo(() => contentSize.width * minContentScale, [contentSize.width, minContentScale]);
    const scaledContentHeight = useMemo(() => contentSize.height * minContentScale, [contentSize.height, minContentScale]);

    // On double tap the content should be zoomed to fill, but at least zoomed by DOUBLE_TAP_SCALE
    const doubleTapScale = useMemo(() => Math.max(DOUBLE_TAP_SCALE, maxContentScale / minContentScale), [maxContentScale, minContentScale]);

    const zoomToCoordinates = useWorkletCallback(
        (focalX: number, focalY: number, callback: () => void) => {
            'worklet';

            stopAnimation();

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

            // eslint-disable-next-line react-compiler/react-compiler
            offsetX.value = withSpring(offsetAfterZooming.x, SPRING_CONFIG);
            offsetY.value = withSpring(offsetAfterZooming.y, SPRING_CONFIG);
            zoomScale.value = withSpring(doubleTapScale, SPRING_CONFIG, callback);
            pinchScale.value = doubleTapScale;
        },
        [scaledContentWidth, scaledContentHeight, canvasSize, doubleTapScale],
    );

    const doubleTapGesture = Gesture.Tap()
        // The first argument is not used, but must be defined
        .onTouchesDown((_evt, state) => {
            if (!shouldDisableTransformationGestures.value) {
                return;
            }

            state.fail();
        })
        .numberOfTaps(2)
        .maxDelay(150)
        .maxDistance(20)
        .onEnd((evt) => {
            const triggerScaleChangedEvent = () => {
                'worklet';

                if (onScaleChanged != null) {
                    runOnJS(onScaleChanged)(zoomScale.value);
                }
            };

            // If the content is already zoomed, we want to reset the zoom,
            // otherwise we want to zoom in
            if (zoomScale.value > 1) {
                reset(true, triggerScaleChangedEvent);
            } else {
                zoomToCoordinates(evt.x, evt.y, triggerScaleChangedEvent);
            }
        });

    const singleTapGesture = Gesture.Tap()
        .numberOfTaps(1)
        .maxDuration(125)
        .onBegin(() => {
            stopAnimation();
        })
        .onFinalize((_evt, success) => {
            if (!success || onTap === undefined) {
                return;
            }

            runOnJS(onTap)();
        });

    return {singleTapGesture, doubleTapGesture};
};

export default useTapGestures;
