/* eslint-disable no-param-reassign */
import {Dimensions} from 'react-native';
import type {PanGesture} from 'react-native-gesture-handler';
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS, useDerivedValue, useSharedValue, useWorkletCallback, withDecay, withSpring} from 'react-native-reanimated';
import * as Browser from '@libs/Browser';
import {SPRING_CONFIG} from './constants';
import type {MultiGestureCanvasVariables} from './types';
import * as MultiGestureCanvasUtils from './utils';

// This value determines how fast the pan animation should phase out
// We're using a "withDecay" animation to smoothly phase out the pan animation
// https://docs.swmansion.com/react-native-reanimated/docs/animations/withDecay/
const PAN_DECAY_DECELARATION = 0.9915;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
const SNAP_POINT = SCREEN_HEIGHT / 4;
const SNAP_POINT_HIDDEN = SCREEN_HEIGHT / 1.2;

type UsePanGestureProps = Pick<
    MultiGestureCanvasVariables,
    | 'canvasSize'
    | 'contentSize'
    | 'zoomScale'
    | 'totalScale'
    | 'offsetX'
    | 'offsetY'
    | 'panTranslateX'
    | 'panTranslateY'
    | 'shouldDisableTransformationGestures'
    | 'stopAnimation'
    | 'onSwipeDown'
    | 'isSwipingDownToClose'
>;

const usePanGesture = ({
    canvasSize,
    contentSize,
    zoomScale,
    totalScale,
    offsetX,
    offsetY,
    panTranslateX,
    panTranslateY,
    shouldDisableTransformationGestures,
    stopAnimation,
    isSwipingDownToClose,
    onSwipeDown,
}: UsePanGestureProps): PanGesture => {
    // The content size after fitting it to the canvas and zooming
    const zoomedContentWidth = useDerivedValue(() => contentSize.width * totalScale.value, [contentSize.width]);
    const zoomedContentHeight = useDerivedValue(() => contentSize.height * totalScale.value, [contentSize.height]);

    // Used to track previous touch position for the "swipe down to close" gesture
    const previousTouch = useSharedValue<{x: number; y: number} | null>(null);

    // Velocity of the pan gesture
    // We need to keep track of the velocity to properly phase out/decay the pan animation
    const panVelocityX = useSharedValue(0);
    const panVelocityY = useSharedValue(0);

    const isMobileBrowser = Browser.isMobile();

    // Disable "swipe down to close" gesture when content is bigger than the canvas
    const enableSwipeDownToClose = useDerivedValue(() => canvasSize.height < zoomedContentHeight.value, [canvasSize.height]);

    // Calculates bounds of the scaled content
    // Can we pan left/right/up/down
    // Can be used to limit gesture or implementing tension effect
    const getBounds = useWorkletCallback(() => {
        let horizontalBoundary = 0;
        let verticalBoundary = 0;

        if (canvasSize.width < zoomedContentWidth.value) {
            horizontalBoundary = Math.abs(canvasSize.width - zoomedContentWidth.value) / 2;
        }

        if (canvasSize.height < zoomedContentHeight.value) {
            verticalBoundary = Math.abs(zoomedContentHeight.value - canvasSize.height) / 2;
        }

        const horizontalBoundaries = {min: -horizontalBoundary, max: horizontalBoundary};
        const verticalBoundaries = {min: -verticalBoundary, max: verticalBoundary};

        const clampedOffset = {
            x: MultiGestureCanvasUtils.clamp(offsetX.value, horizontalBoundaries.min, horizontalBoundaries.max),
            y: MultiGestureCanvasUtils.clamp(offsetY.value, verticalBoundaries.min, verticalBoundaries.max),
        };

        // If the horizontal/vertical offset is the same after clamping to the min/max boundaries, the content is within the boundaries
        const isInHoriztontalBoundary = clampedOffset.x === offsetX.value;
        const isInVerticalBoundary = clampedOffset.y === offsetY.value;

        return {
            horizontalBoundaries,
            verticalBoundaries,
            clampedOffset,
            isInHoriztontalBoundary,
            isInVerticalBoundary,
        };
    }, [canvasSize.width, canvasSize.height]);

    // We want to smoothly decay/end the gesture by phasing out the pan animation
    // In case the content is outside of the boundaries of the canvas,
    // we need to move the content back into the boundaries
    const finishPanGesture = useWorkletCallback(() => {
        // If the content is centered within the canvas, we don't need to run any animations
        if (offsetX.value === 0 && offsetY.value === 0 && panTranslateX.value === 0 && panTranslateY.value === 0) {
            return;
        }

        const {clampedOffset, isInHoriztontalBoundary, isInVerticalBoundary, horizontalBoundaries, verticalBoundaries} = getBounds();

        // If the content is within the horizontal/vertical boundaries of the canvas, we can smoothly phase out the animation
        // If not, we need to snap back to the boundaries
        if (isInHoriztontalBoundary) {
            // If the (absolute) velocity is 0, we don't need to run an animation
            if (Math.abs(panVelocityX.value) !== 0) {
                // Phase out the pan animation
                // eslint-disable-next-line react-compiler/react-compiler
                offsetX.value = withDecay({
                    velocity: panVelocityX.value,
                    clamp: [horizontalBoundaries.min, horizontalBoundaries.max],
                    deceleration: PAN_DECAY_DECELARATION,
                    rubberBandEffect: false,
                });
            }
        } else {
            // Animated back to the boundary
            offsetX.value = withSpring(clampedOffset.x, SPRING_CONFIG);
        }

        if (isInVerticalBoundary) {
            // If the (absolute) velocity is 0, we don't need to run an animation
            if (Math.abs(panVelocityY.value) !== 0) {
                // Phase out the pan animation
                offsetY.value = withDecay({
                    velocity: panVelocityY.value,
                    clamp: [verticalBoundaries.min, verticalBoundaries.max],
                    deceleration: PAN_DECAY_DECELARATION,
                });
            }
        } else {
            const finalTranslateY = offsetY.value + panVelocityY.value * 0.2;

            if (finalTranslateY > SNAP_POINT && zoomScale.value <= 1) {
                offsetY.value = withSpring(SNAP_POINT_HIDDEN, SPRING_CONFIG, () => {
                    isSwipingDownToClose.value = false;

                    if (onSwipeDown) {
                        runOnJS(onSwipeDown)();
                    }
                });
            } else {
                // Animated back to the boundary
                offsetY.value = withSpring(clampedOffset.y, SPRING_CONFIG, () => {
                    isSwipingDownToClose.value = false;
                });
            }
        }

        // Reset velocity variables after we finished the pan gesture
        panVelocityX.value = 0;
        panVelocityY.value = 0;
    });

    const panGesture = Gesture.Pan()
        .manualActivation(true)
        .averageTouches(true)
        .onTouchesUp(() => {
            previousTouch.value = null;
        })
        .onTouchesMove((evt, state) => {
            // We only allow panning when the content is zoomed in
            if (zoomScale.value > 1 && !shouldDisableTransformationGestures.value) {
                state.activate();
            }

            // TODO: this needs tuning to work properly
            if (!shouldDisableTransformationGestures.value && zoomScale.value === 1 && previousTouch.value !== null) {
                const velocityX = Math.abs(evt.allTouches[0].x - previousTouch.value.x);
                const velocityY = evt.allTouches[0].y - previousTouch.value.y;

                if (Math.abs(velocityY) > velocityX && velocityY > 20) {
                    state.activate();

                    isSwipingDownToClose.value = true;
                    previousTouch.value = null;

                    return;
                }
            }

            if (previousTouch.value === null) {
                previousTouch.value = {
                    x: evt.allTouches[0].x,
                    y: evt.allTouches[0].y,
                };
            }
        })
        .onStart(() => {
            stopAnimation();
        })
        .onChange((evt) => {
            // Since we're running both pinch and pan gesture handlers simultaneously,
            // we need to make sure that we don't pan when we pinch since we track it as pinch focal gesture.
            if (evt.numberOfPointers > 1) {
                return;
            }

            panVelocityX.value = evt.velocityX;
            panVelocityY.value = evt.velocityY;

            if (!isSwipingDownToClose.value) {
                if (!isMobileBrowser || (isMobileBrowser && zoomScale.value !== 1)) {
                    panTranslateX.value += evt.changeX;
                }
            }

            if (enableSwipeDownToClose.value || isSwipingDownToClose.value) {
                panTranslateY.value += evt.changeY;
            }
        })
        .onEnd(() => {
            // Add pan translation to total offset and reset gesture variables
            offsetX.value += panTranslateX.value;
            offsetY.value += panTranslateY.value;

            // Reset pan gesture variables
            panTranslateX.value = 0;
            panTranslateY.value = 0;
            previousTouch.value = null;

            // If we are swiping (in the pager), we don't want to return to boundaries
            if (shouldDisableTransformationGestures.value) {
                return;
            }

            finishPanGesture();
        });

    return panGesture;
};

export default usePanGesture;
