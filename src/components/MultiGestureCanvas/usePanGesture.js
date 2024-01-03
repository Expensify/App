/* eslint-disable no-param-reassign */
import {Gesture} from 'react-native-gesture-handler';
import {useDerivedValue, useSharedValue, withDecay, withSpring} from 'react-native-reanimated';
import * as MultiGestureCanvasUtils from './utils';

const PAN_DECAY_DECELARATION = 0.9915;

const usePanGesture = ({
    canvasSize,
    contentSize,
    singleTapGesture,
    doubleTapGesture,
    panGestureRef,
    pagerRef,
    zoomScale,
    zoomRange,
    totalScale,
    offsetX,
    offsetY,
    panTranslateX,
    panTranslateY,
    isSwipingInPager,
    stopAnimation,
}) => {
    // The content size after fitting it to the canvas and zooming
    const zoomedContentWidth = useDerivedValue(() => contentSize.width * totalScale.value, [contentSize.width]);
    const zoomedContentHeight = useDerivedValue(() => contentSize.height * totalScale.value, [contentSize.height]);

    // Pan velocity to calculate the decay
    const panVelocityX = useSharedValue(0);
    const panVelocityY = useSharedValue(0);

    // Calculates bounds of the scaled content
    // Can we pan left/right/up/down
    // Can be used to limit gesture or implementing tension effect
    const getBounds = MultiGestureCanvasUtils.useWorkletCallback(() => {
        let rightBoundary = 0;
        let topBoundary = 0;

        if (canvasSize.width < zoomedContentWidth.value) {
            rightBoundary = Math.abs(canvasSize.width - zoomedContentWidth.value) / 2;
        }

        if (canvasSize.height < zoomedContentHeight.value) {
            topBoundary = Math.abs(zoomedContentHeight.value - canvasSize.height) / 2;
        }

        const minBoundaries = {x: -rightBoundary, y: -topBoundary};
        const maxBoundaries = {x: rightBoundary, y: topBoundary};

        const clampedOffset = {
            x: MultiGestureCanvasUtils.clamp(offsetX.value, minBoundaries.x, maxBoundaries.x),
            y: MultiGestureCanvasUtils.clamp(offsetY.value, minBoundaries.y, maxBoundaries.y),
        };

        // If the horizontal/vertical offset is the same after clamping to the min/max boundaries, the content is within the boundaries
        const isInBoundaryX = clampedOffset.x === offsetX.value;
        const isInBoundaryY = clampedOffset.y === offsetY.value;

        return {
            minBoundaries,
            maxBoundaries,
            clampedOffset,
            isInBoundaryX,
            isInBoundaryY,
        };
    }, [canvasSize.width, canvasSize.height]);

    // We want to smoothly gesture by phasing out the pan animation
    // In case the content is outside of the boundaries of the canvas,
    // we need to return to the view to the boundaries
    const finishPanGesture = MultiGestureCanvasUtils.useWorkletCallback(() => {
        // If the content is centered within the canvas, we don't need to run any animations
        if (offsetX.value === 0 && offsetY.value === 0 && panTranslateX.value === 0 && panTranslateY.value === 0) {
            return;
        }

        const {clampedOffset, isInBoundaryX, isInBoundaryY, minBoundaries, maxBoundaries} = getBounds();

        if (isInBoundaryX) {
            if (Math.abs(panVelocityX.value) > 0 && zoomScale.value <= zoomRange.max) {
                offsetX.value = withDecay({
                    velocity: panVelocityX.value,
                    clamp: [minBoundaries.x, maxBoundaries.x],
                    deceleration: PAN_DECAY_DECELARATION,
                    rubberBandEffect: false,
                });
            }
        } else {
            offsetX.value = withSpring(clampedOffset.x, MultiGestureCanvasUtils.SPRING_CONFIG);
        }

        if (isInBoundaryY) {
            if (
                Math.abs(panVelocityY.value) > 0 &&
                zoomScale.value <= zoomRange.max &&
                // Limit vertical panning when content is smaller than screen
                offsetY.value !== minBoundaries.y &&
                offsetY.value !== maxBoundaries.y
            ) {
                offsetY.value = withDecay({
                    velocity: panVelocityY.value,
                    clamp: [minBoundaries.y, maxBoundaries.y],
                    deceleration: PAN_DECAY_DECELARATION,
                });
            }
        } else {
            offsetY.value = withSpring(clampedOffset.y, MultiGestureCanvasUtils.SPRING_CONFIG);
        }
    });

    const panGesture = Gesture.Pan()
        .manualActivation(true)
        .averageTouches(true)
        .onTouchesMove((evt, state) => {
            if (zoomScale.value <= 1) {
                return;
            }

            state.activate();
        })
        .simultaneousWithExternalGesture(pagerRef, singleTapGesture, doubleTapGesture)
        .onStart(() => {
            stopAnimation();
        })
        .onChange((evt) => {
            // Since we're running both pinch and pan gesture handlers simultaneously,
            // we need to make sure that we don't pan when we pinch AND move fingers
            // since we track it as pinch focal gesture.
            // We also need to prevent panning when we are swiping horizontally (from page to page)
            if (evt.numberOfPointers > 1 || isSwipingInPager.value) {
                return;
            }

            panVelocityX.value = evt.velocityX;
            panVelocityY.value = evt.velocityY;

            panTranslateX.value += evt.changeX;
            panTranslateY.value += evt.changeY;
        })
        .onEnd(() => {
            // Add pan translation to total offset
            offsetX.value += panTranslateX.value;
            offsetY.value += panTranslateY.value;

            // Reset pan gesture variables
            panTranslateX.value = 0;
            panTranslateY.value = 0;

            // If we are swiping (in the pager), we don't want to return to boundaries
            if (isSwipingInPager.value) {
                return;
            }

            finishPanGesture();

            // Reset pan gesture variables
            panVelocityX.value = 0;
            panVelocityY.value = 0;
        })
        .withRef(panGestureRef);

    return panGesture;
};

export default usePanGesture;
