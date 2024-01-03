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
    // The content size after scaling it with the current (total) zoom value
    const zoomScaledContentWidth = useDerivedValue(() => contentSize.width * totalScale.value, [contentSize.width]);
    const zoomScaledContentHeight = useDerivedValue(() => contentSize.height * totalScale.value, [contentSize.height]);

    // Used to track previous touch position for the "swipe down to close" gesture
    const previousTouch = useSharedValue(null);

    // Pan velocity to calculate the decay
    const panVelocityX = useSharedValue(0);
    const panVelocityY = useSharedValue(0);

    // Calculates bounds of the scaled content
    // Can we pan left/right/up/down
    // Can be used to limit gesture or implementing tension effect
    const getBounds = MultiGestureCanvasUtils.useWorkletCallback(() => {
        let rightBoundary = 0;
        let topBoundary = 0;

        if (canvasSize.width < zoomScaledContentWidth.value) {
            rightBoundary = Math.abs(canvasSize.width - zoomScaledContentWidth.value) / 2;
        }

        if (canvasSize.height < zoomScaledContentHeight.value) {
            topBoundary = Math.abs(zoomScaledContentHeight.value - canvasSize.height) / 2;
        }

        const maxVector = {x: rightBoundary, y: topBoundary};
        const minVector = {x: -rightBoundary, y: -topBoundary};

        const target = {
            x: MultiGestureCanvasUtils.clamp(offsetX.value, minVector.x, maxVector.x),
            y: MultiGestureCanvasUtils.clamp(offsetY.value, minVector.y, maxVector.y),
        };

        const isInBoundaryX = target.x === offsetX.value;
        const isInBoundaryY = target.y === offsetY.value;

        return {
            target,
            isInBoundaryX,
            isInBoundaryY,
            minVector,
            maxVector,
            canPanLeft: target.x < maxVector.x,
            canPanRight: target.x > minVector.x,
        };
    }, [canvasSize.width, canvasSize.height]);

    const returnToBoundaries = MultiGestureCanvasUtils.useWorkletCallback(() => {
        const {target, isInBoundaryX, isInBoundaryY, minVector, maxVector} = getBounds();

        if (zoomScale.value === zoomRange.min && offsetX.value === 0 && offsetY.value === 0 && panTranslateX.value === 0 && panTranslateY.value === 0) {
            // We don't need to run any animations
            return;
        }

        // If we are zoomed out, we want to center the content
        if (zoomScale.value <= zoomRange.min) {
            offsetX.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            offsetY.value = withSpring(0, MultiGestureCanvasUtils.SPRING_CONFIG);
            return;
        }

        if (isInBoundaryX) {
            if (Math.abs(panVelocityX.value) > 0 && zoomScale.value <= zoomRange.max) {
                offsetX.value = withDecay({
                    velocity: panVelocityX.value,
                    clamp: [minVector.x, maxVector.x],
                    deceleration: PAN_DECAY_DECELARATION,
                    rubberBandEffect: false,
                });
            }
        } else {
            offsetX.value = withSpring(target.x, MultiGestureCanvasUtils.SPRING_CONFIG);
        }

        if (isInBoundaryY) {
            if (
                Math.abs(panVelocityY.value) > 0 &&
                zoomScale.value <= zoomRange.max &&
                // Limit vertical panning when content is smaller than screen
                offsetY.value !== minVector.y &&
                offsetY.value !== maxVector.y
            ) {
                offsetY.value = withDecay({
                    velocity: panVelocityY.value,
                    clamp: [minVector.y, maxVector.y],
                    deceleration: PAN_DECAY_DECELARATION,
                });
            }
        } else {
            offsetY.value = withSpring(target.y, MultiGestureCanvasUtils.SPRING_CONFIG);
        }
    });

    const panGesture = Gesture.Pan()
        .manualActivation(true)
        .averageTouches(true)
        .onTouchesMove((evt, state) => {
            if (zoomScale.value > 1) {
                state.activate();
            }

            if (previousTouch.value == null) {
                previousTouch.value = {
                    x: evt.allTouches[0].x,
                    y: evt.allTouches[0].y,
                };
            }
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
            previousTouch.value = null;

            // If we are swiping (in the pager), we don't want to return to boundaries
            if (isSwipingInPager.value) {
                return;
            }

            returnToBoundaries();

            // Reset pan gesture variables
            panVelocityX.value = 0;
            panVelocityY.value = 0;
        })
        .withRef(panGestureRef);

    return panGesture;
};

export default usePanGesture;
