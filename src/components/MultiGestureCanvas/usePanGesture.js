/* eslint-disable no-param-reassign */
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS, useDerivedValue, useSharedValue, useWorkletCallback, withDecay, withSpring} from 'react-native-reanimated';
import * as MultiGestureCanvasUtils from './utils';

const PAN_DECAY_DECELARATION = 0.9915;

const clamp = MultiGestureCanvasUtils.clamp;
const SPRING_CONFIG = MultiGestureCanvasUtils.SPRING_CONFIG;

const usePanGesture = ({
    canvasSize,
    contentSize,
    panGestureRef,
    pagerRef,
    singleTap,
    doubleTap,
    zoomScale,
    zoomRange,
    totalScale,
    offsetX,
    offsetY,
    panTranslateX,
    panTranslateY,
    isSwiping,
    isScrolling,
    onSwipeSuccess,
    stopAnimation,
}) => {
    const zoomScaledContentWidth = useDerivedValue(() => contentSize.width * totalScale.value, [contentSize.width]);
    const zoomScaledContentHeight = useDerivedValue(() => contentSize.height * totalScale.value, [contentSize.height]);

    // pan velocity to calculate the decay
    const panVelocityX = useSharedValue(0);
    const panVelocityY = useSharedValue(0);
    // disable pan vertically when content is smaller than screen
    const canPanVertically = useDerivedValue(() => canvasSize.height < zoomScaledContentHeight.value, [canvasSize.height]);

    const previousTouch = useSharedValue(null);

    // calculates bounds of the scaled content
    // can we pan left/right/up/down
    // can be used to limit gesture or implementing tension effect
    const getBounds = useWorkletCallback(() => {
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
            x: clamp(offsetX.value, minVector.x, maxVector.x),
            y: clamp(offsetY.value, minVector.y, maxVector.y),
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

    const returnToBoundaries = useWorkletCallback(() => {
        const {target, isInBoundaryX, isInBoundaryY, minVector, maxVector} = getBounds();

        if (zoomScale.value === zoomRange.min && offsetX.value === 0 && offsetY.value === 0 && panTranslateX.value === 0 && panTranslateY.value === 0) {
            // we don't need to run any animations
            return;
        }

        if (zoomScale.value <= zoomRange.min) {
            // just center it
            offsetX.value = withSpring(0, SPRING_CONFIG);
            offsetY.value = withSpring(0, SPRING_CONFIG);
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
            offsetX.value = withSpring(target.x, SPRING_CONFIG);
        }

        if (!canPanVertically.value) {
            offsetY.value = withSpring(target.y, SPRING_CONFIG);
        } else if (isInBoundaryY) {
            if (
                Math.abs(panVelocityY.value) > 0 &&
                zoomScale.value <= zoomRange.max &&
                // limit vertical pan only when content is smaller than screen
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
            offsetY.value = withSpring(target.y, SPRING_CONFIG, () => {
                isSwiping.value = false;
            });
        }
    });

    const panGesture = Gesture.Pan()
        .manualActivation(true)
        .averageTouches(true)
        .onTouchesMove((evt, state) => {
            if (zoomScale.value > 1) {
                state.activate();
            }

            // TODO: Swipe down to close carousel gesture
            // this needs fine tuning to work properly
            // if (!isScrolling.value && scale.value === 1 && previousTouch.value != null) {
            //     const velocityX = Math.abs(evt.allTouches[0].x - previousTouch.value.x);
            //     const velocityY = evt.allTouches[0].y - previousTouch.value.y;

            //     // TODO: this needs tuning
            //     if (Math.abs(velocityY) > velocityX && velocityY > 20) {
            //         state.activate();

            //         isSwiping.value = true;
            //         previousTouch.value = null;

            //         runOnJS(onSwipeDown)();
            //         return;
            //     }
            // }

            if (previousTouch.value == null) {
                previousTouch.value = {
                    x: evt.allTouches[0].x,
                    y: evt.allTouches[0].y,
                };
            }
        })
        .simultaneousWithExternalGesture(pagerRef, singleTap, doubleTap)
        .onBegin(() => {
            stopAnimation();
        })
        .onChange((evt) => {
            // since we're running both pinch and pan gesture handlers simultaneously
            // we need to make sure that we don't pan when we pinch and move fingers
            // since we track it as pinch focal gesture
            if (evt.numberOfPointers > 1 || isScrolling.value) {
                return;
            }

            panVelocityX.value = evt.velocityX;

            panVelocityY.value = evt.velocityY;

            if (!isSwiping.value) {
                panTranslateX.value += evt.changeX;
            }

            if (canPanVertically.value || isSwiping.value) {
                panTranslateY.value += evt.changeY;
            }
        })
        .onEnd((evt) => {
            previousTouch.value = null;

            if (isScrolling.value) {
                return;
            }

            offsetX.value += panTranslateX.value;
            offsetY.value += panTranslateY.value;
            panTranslateX.value = 0;
            panTranslateY.value = 0;

            if (isSwiping.value) {
                const enoughVelocity = Math.abs(evt.velocityY) > 300 && Math.abs(evt.velocityX) < Math.abs(evt.velocityY);
                const rightDirection = (evt.translationY > 0 && evt.velocityY > 0) || (evt.translationY < 0 && evt.velocityY < 0);

                if (enoughVelocity && rightDirection) {
                    const maybeInvert = (v) => {
                        const invert = evt.velocityY < 0;
                        return invert ? -v : v;
                    };

                    offsetY.value = withSpring(
                        maybeInvert(contentSize.height * 2),
                        {
                            stiffness: 50,
                            damping: 30,
                            mass: 1,
                            overshootClamping: true,
                            restDisplacementThreshold: 300,
                            restSpeedThreshold: 300,
                            velocity: Math.abs(evt.velocityY) < 1200 ? maybeInvert(1200) : evt.velocityY,
                        },
                        () => {
                            runOnJS(onSwipeSuccess)();
                        },
                    );
                    return;
                }
            }

            returnToBoundaries();

            panVelocityX.value = 0;
            panVelocityY.value = 0;
        })
        .withRef(panGestureRef);

    return panGesture;
};

export default usePanGesture;
