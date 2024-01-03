/* eslint-disable no-param-reassign */
import {useMemo} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS, withSpring} from 'react-native-reanimated';
import * as MultiGestureCanvasUtils from './utils';

const DOUBLE_TAP_SCALE = 3;

const clamp = MultiGestureCanvasUtils.clamp;
const SPRING_CONFIG = MultiGestureCanvasUtils.SPRING_CONFIG;
const useWorkletCallback = MultiGestureCanvasUtils.useWorkletCallback;

const useTapGestures = ({
    canvasSize,
    contentSize,
    minContentScale,
    maxContentScale,
    panGestureRef,
    totalOffsetX,
    totalOffsetY,
    pinchScaleOffset,
    zoomScale,
    reset,
    stopAnimation,
    onScaleChanged,
    onTap,
}) => {
    const scaledWidth = useMemo(() => contentSize.width * minContentScale, [contentSize.width, minContentScale]);
    const scaledHeight = useMemo(() => contentSize.height * minContentScale, [contentSize.height, minContentScale]);

    // On double tap zoom to fill, but at least 3x zoom
    const doubleTapScale = useMemo(() => Math.max(DOUBLE_TAP_SCALE, maxContentScale / minContentScale), [maxContentScale, minContentScale]);

    const zoomToCoordinates = useWorkletCallback(
        (canvasFocalX, canvasFocalY) => {
            'worklet';

            stopAnimation();

            const canvasOffsetX = Math.max(0, (canvasSize.width - scaledWidth) / 2);
            const canvasOffsetY = Math.max(0, (canvasSize.height - scaledHeight) / 2);

            const contentFocal = {
                x: clamp(canvasFocalX - canvasOffsetX, 0, scaledWidth),
                y: clamp(canvasFocalY - canvasOffsetY, 0, scaledHeight),
            };

            const canvasCenter = {
                x: canvasSize.width / 2,
                y: canvasSize.height / 2,
            };

            const originContentCenter = {
                x: scaledWidth / 2,
                y: scaledHeight / 2,
            };

            const targetContentSize = {
                width: scaledWidth * doubleTapScale,
                height: scaledHeight * doubleTapScale,
            };

            const targetContentCenter = {
                x: targetContentSize.width / 2,
                y: targetContentSize.height / 2,
            };

            const currentOrigin = {
                x: (targetContentCenter.x - canvasCenter.x) * -1,
                y: (targetContentCenter.y - canvasCenter.y) * -1,
            };

            const koef = {
                x: (1 / originContentCenter.x) * contentFocal.x - 1,
                y: (1 / originContentCenter.y) * contentFocal.y - 1,
            };

            const target = {
                x: currentOrigin.x * koef.x,
                y: currentOrigin.y * koef.y,
            };

            if (targetContentSize.height < canvasSize.height) {
                target.y = 0;
            }

            totalOffsetX.value = withSpring(target.x, SPRING_CONFIG);
            totalOffsetY.value = withSpring(target.y, SPRING_CONFIG);
            zoomScale.value = withSpring(doubleTapScale, SPRING_CONFIG);
            pinchScaleOffset.value = doubleTapScale;
        },
        [scaledWidth, scaledHeight, canvasSize, doubleTapScale],
    );

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDelay(150)
        .maxDistance(20)
        .onEnd((evt) => {
            if (zoomScale.value > 1) {
                reset(true);
            } else {
                zoomToCoordinates(evt.x, evt.y);
            }

            if (onScaleChanged != null) {
                runOnJS(onScaleChanged)(zoomScale.value);
            }
        });

    const singleTap = Gesture.Tap()
        .numberOfTaps(1)
        .maxDuration(50)
        .requireExternalGestureToFail(doubleTap, panGestureRef)
        .onBegin(() => {
            stopAnimation();
        })
        .onFinalize((_evt, success) => {
            if (!success || !onTap) {
                return;
            }

            runOnJS(onTap)();
        });

    return {singleTap, doubleTap};
};

export default useTapGestures;
