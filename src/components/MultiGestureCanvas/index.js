/* eslint-disable es/no-optional-chaining */

/* eslint-disable es/no-nullish-coalescing-operators */
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    runOnUI,
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    useWorkletCallback,
    withDecay,
    withSpring,
} from 'react-native-reanimated';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import styles from '@styles/styles';
import * as Constants from './Constants';
import MultiGestureCanvasContentWrapper from './MultiGestureCanvasContentWrapper';
import {multiGestureCanvasDefaultProps, multiGestureCanvasPropTypes} from './propTypes';

const DOUBLE_TAP_SCALE = 3;

const SPRING_CONFIG = {
    mass: 1,
    stiffness: 1000,
    damping: 500,
};

function clamp(value, lowerBound, upperBound) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

function getDeepDefaultProps({contentSize: contentSizeProp, contentScaling: contentScalingProp, zoomRange: zoomRangeProp}) {
    const contentSize = {
        width: contentSizeProp?.width ?? 0,
        height: contentSizeProp?.height ?? 0,
    };

    const contentScaling = {
        scaleX: contentScalingProp?.scaleX ?? 1,
        scaleY: contentScalingProp?.scaleY ?? 1,
        scaledWidth: contentScalingProp?.scaledWidth ?? 0,
        scaledHeight: contentScalingProp?.scaledHeight ?? 0,
    };

    const zoomRange = {
        min: zoomRangeProp?.min ?? Constants.DEFAULT_MIN_ZOOM_SCALE,
        max: zoomRangeProp?.max ?? Constants.DEFAULT_MAX_ZOOM_SCALE,
    };

    return {contentSize, contentScaling, zoomRange};
}

function MultiGestureCanvas({canvasSize, isActive = true, onScaleChanged, children, ...props}) {
    const {contentSize, contentScaling, zoomRange} = getDeepDefaultProps(props);

    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);

    const pagerRefFallback = useRef(null);
    const {onTap, onSwipe, onSwipeSuccess, pagerRef, shouldPagerScroll, isScrolling, onPinchGestureChange} = attachmentCarouselPagerContext || {
        onTap: () => undefined,
        onSwipe: () => undefined,
        onSwipeSuccess: () => undefined,
        onPinchGestureChange: () => undefined,
        pagerRef: pagerRefFallback,
        shouldPagerScroll: false,
        isScrolling: false,
        ...props,
    };

    const minContentScale = useMemo(() => Math.min(contentScaling.scaleX, contentScaling.scaleY), [contentScaling.scaleX, contentScaling.scaleY]);
    const maxContentScale = useMemo(() => Math.max(contentScaling.scaleX, contentScaling.scaleY), [contentScaling.scaleX, contentScaling.scaleY]);

    // On double tap zoom to fill, but at least 3x zoom
    const doubleTapScale = useMemo(() => Math.max(maxContentScale / minContentScale, DOUBLE_TAP_SCALE), [maxContentScale, minContentScale]);

    const zoomScale = useSharedValue(1);
    // Adding together the pinch zoom scale and the initial scale to fit the content into the canvas
    // Using the smaller content scale, so that the immage is not bigger than the canvas
    // and not smaller than needed to fit
    const totalScale = useDerivedValue(() => zoomScale.value * minContentScale, [minContentScale]);

    const zoomScaledContentWidth = useDerivedValue(() => contentSize.width * totalScale.value, [contentSize.width]);
    const zoomScaledContentHeight = useDerivedValue(() => contentSize.height * totalScale.value, [contentSize.height]);

    // used for pan gesture
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const isSwiping = useSharedValue(false);

    // used for moving fingers when pinching
    const pinchTranslateX = useSharedValue(0);
    const pinchTranslateY = useSharedValue(0);
    const pinchBounceTranslateX = useSharedValue(0);
    const pinchBounceTranslateY = useSharedValue(0);

    // storage for the the origin of the gesture
    const origin = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    // storage for the pan velocity to calculate the decay
    const panVelocityX = useSharedValue(0);
    const panVelocityY = useSharedValue(0);

    // store scale in between gestures
    const pinchScaleOffset = useSharedValue(1);

    // disable pan vertically when content is smaller than screen
    const canPanVertically = useDerivedValue(() => canvasSize.height < zoomScaledContentHeight.value, [canvasSize.height]);

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

    const afterPanGesture = useWorkletCallback(() => {
        const {target, isInBoundaryX, isInBoundaryY, minVector, maxVector} = getBounds();

        if (!canPanVertically.value) {
            offsetY.value = withSpring(target.y, SPRING_CONFIG);
        }

        if (zoomScale.value === 1 && offsetX.value === 0 && offsetY.value === 0 && translateX.value === 0 && translateY.value === 0) {
            // we don't need to run any animations
            return;
        }

        if (zoomScale.value <= 1) {
            // just center it
            offsetX.value = withSpring(0, SPRING_CONFIG);
            offsetY.value = withSpring(0, SPRING_CONFIG);
            return;
        }

        const deceleration = 0.9915;

        if (isInBoundaryX) {
            if (Math.abs(panVelocityX.value) > 0 && zoomScale.value <= zoomRange.max) {
                offsetX.value = withDecay({
                    velocity: panVelocityX.value,
                    clamp: [minVector.x, maxVector.x],
                    deceleration,
                    rubberBandEffect: false,
                });
            }
        } else {
            offsetX.value = withSpring(target.x, SPRING_CONFIG);
        }

        if (isInBoundaryY) {
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
                    deceleration,
                });
            }
        } else {
            offsetY.value = withSpring(target.y, SPRING_CONFIG, () => {
                isSwiping.value = false;
            });
        }
    });

    const stopAnimation = useWorkletCallback(() => {
        cancelAnimation(offsetX);
        cancelAnimation(offsetY);
    });

    const zoomToCoordinates = useWorkletCallback(
        (canvasFocalX, canvasFocalY) => {
            'worklet';

            stopAnimation();

            const canvasOffsetX = Math.max(0, (canvasSize.width - contentScaling.scaledWidth) / 2);
            const canvasOffsetY = Math.max(0, (canvasSize.height - contentScaling.scaledHeight) / 2);

            const contentFocal = {
                x: clamp(canvasFocalX - canvasOffsetX, 0, contentScaling.scaledWidth),
                y: clamp(canvasFocalY - canvasOffsetY, 0, contentScaling.scaledHeight),
            };

            const canvasCenter = {
                x: canvasSize.width / 2,
                y: canvasSize.height / 2,
            };

            const originContentCenter = {
                x: contentScaling.scaledWidth / 2,
                y: contentScaling.scaledHeight / 2,
            };

            const targetContentSize = {
                width: contentScaling.scaledWidth * doubleTapScale,
                height: contentScaling.scaledHeight * doubleTapScale,
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

            offsetX.value = withSpring(target.x, SPRING_CONFIG);
            offsetY.value = withSpring(target.y, SPRING_CONFIG);
            zoomScale.value = withSpring(doubleTapScale, SPRING_CONFIG);
            pinchScaleOffset.value = doubleTapScale;
        },
        [contentScaling.scaledWidth, contentScaling.scaledHeight, canvasSize.width, canvasSize.height],
    );

    const reset = useWorkletCallback((animated) => {
        pinchScaleOffset.value = 1;

        stopAnimation();

        if (animated) {
            offsetX.value = withSpring(0, SPRING_CONFIG);
            offsetY.value = withSpring(0, SPRING_CONFIG);
            zoomScale.value = withSpring(1, SPRING_CONFIG);
        } else {
            zoomScale.value = 1;
            translateX.value = 0;
            translateY.value = 0;
            offsetX.value = 0;
            offsetY.value = 0;
            pinchTranslateX.value = 0;
            pinchTranslateY.value = 0;
        }
    });

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

    const panGestureRef = useRef(Gesture.Pan());

    const singleTap = Gesture.Tap()
        .numberOfTaps(1)
        .maxDuration(50)
        .requireExternalGestureToFail(doubleTap, panGestureRef)
        .onBegin(() => {
            stopAnimation();
        })
        .onFinalize((evt, success) => {
            if (!success || !onTap) {
                return;
            }

            runOnJS(onTap)();
        });

    const previousTouch = useSharedValue(null);

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
        .simultaneousWithExternalGesture(pagerRef, doubleTap, singleTap)
        .onBegin(() => {
            stopAnimation();
        })
        .onChange((evt) => {
            // since we running both pinch and pan gesture handlers simultaneously
            // we need to make sure that we don't pan when we pinch and move fingers
            // since we track it as pinch focal gesture
            if (evt.numberOfPointers > 1 || isScrolling.value) {
                return;
            }

            panVelocityX.value = evt.velocityX;

            panVelocityY.value = evt.velocityY;

            if (!isSwiping.value) {
                translateX.value += evt.changeX;
            }

            if (canPanVertically.value || isSwiping.value) {
                translateY.value += evt.changeY;
            }
        })
        .onEnd((evt) => {
            previousTouch.value = null;

            if (isScrolling.value) {
                return;
            }

            offsetX.value += translateX.value;
            offsetY.value += translateY.value;
            translateX.value = 0;
            translateY.value = 0;

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

            afterPanGesture();

            panVelocityX.value = 0;
            panVelocityY.value = 0;
        })
        .withRef(panGestureRef);

    const getAdjustedFocal = useWorkletCallback(
        (focalX, focalY) => ({
            x: focalX - (canvasSize.width / 2 + offsetX.value),
            y: focalY - (canvasSize.height / 2 + offsetY.value),
        }),
        [canvasSize.width, canvasSize.height],
    );

    // used to store event scale value when we limit scale
    const pinchGestureScale = useSharedValue(1);
    const pinchGestureRunning = useSharedValue(false);
    const pinchGesture = Gesture.Pinch()
        .onTouchesDown((evt, state) => {
            // we don't want to activate pinch gesture when we are scrolling pager
            if (!isScrolling.value) {
                return;
            }

            state.fail();
        })
        .simultaneousWithExternalGesture(panGesture, doubleTap)
        .onStart((evt) => {
            pinchGestureRunning.value = true;

            stopAnimation();

            const adjustFocal = getAdjustedFocal(evt.focalX, evt.focalY);

            origin.x.value = adjustFocal.x;
            origin.y.value = adjustFocal.y;
        })
        .onChange((evt) => {
            const newZoomScale = pinchScaleOffset.value * evt.scale;

            if (zoomScale.value >= zoomRange.min * Constants.MIN_ZOOM_SCALE_BOUNCE && zoomScale.value <= zoomRange.max * Constants.MAX_ZOOM_SCALE_BOUNCE) {
                zoomScale.value = newZoomScale;
                pinchGestureScale.value = evt.scale;
            }

            const adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);
            const newPinchTranslateX = adjustedFocal.x + pinchGestureScale.value * origin.x.value * -1;
            const newPinchTranslateY = adjustedFocal.y + pinchGestureScale.value * origin.y.value * -1;

            if (zoomScale.value >= zoomRange.min && zoomScale.value <= zoomRange.max) {
                pinchTranslateX.value = newPinchTranslateX;
                pinchTranslateY.value = newPinchTranslateY;
            } else {
                pinchBounceTranslateX.value = newPinchTranslateX - pinchTranslateX.value;
                pinchBounceTranslateY.value = newPinchTranslateY - pinchTranslateY.value;
            }
        })
        .onEnd(() => {
            offsetX.value += pinchTranslateX.value;
            offsetY.value += pinchTranslateY.value;
            pinchTranslateX.value = 0;
            pinchTranslateY.value = 0;
            pinchScaleOffset.value = zoomScale.value;
            pinchGestureScale.value = 1;

            if (pinchScaleOffset.value < zoomRange.min) {
                pinchScaleOffset.value = zoomRange.min;
                zoomScale.value = withSpring(zoomRange.min, SPRING_CONFIG);
            } else if (pinchScaleOffset.value > zoomRange.max) {
                pinchScaleOffset.value = zoomRange.max;
                zoomScale.value = withSpring(zoomRange.max, SPRING_CONFIG);
            }

            if (pinchBounceTranslateX.value !== 0 || pinchBounceTranslateY.value !== 0) {
                pinchBounceTranslateX.value = withSpring(0, SPRING_CONFIG);
                pinchBounceTranslateY.value = withSpring(0, SPRING_CONFIG);
            }

            pinchGestureRunning.value = false;

            if (onScaleChanged != null) {
                runOnJS(onScaleChanged)(zoomScale.value);
            }
        });

    const [isPinchGestureInUse, setIsPinchGestureInUse] = useState(false);
    useAnimatedReaction(
        () => [zoomScale.value, pinchGestureRunning.value],
        ([zoom, running]) => {
            const newIsPinchGestureInUse = zoom !== 1 || running;
            if (isPinchGestureInUse !== newIsPinchGestureInUse) {
                runOnJS(setIsPinchGestureInUse)(newIsPinchGestureInUse);
            }
        },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => onPinchGestureChange(isPinchGestureInUse), [isPinchGestureInUse]);

    const animatedStyles = useAnimatedStyle(() => {
        const x = pinchTranslateX.value + pinchBounceTranslateX.value + translateX.value + offsetX.value;
        const y = pinchTranslateY.value + pinchBounceTranslateY.value + translateY.value + offsetY.value;

        if (isSwiping.value) {
            onSwipe(y);
        }

        return {
            transform: [
                {
                    translateX: x,
                },
                {
                    translateY: y,
                },
                {scale: totalScale.value},
            ],
        };
    });

    // reacts to scale change and enables/disables pager scroll
    useAnimatedReaction(
        () => zoomScale.value,
        () => {
            shouldPagerScroll.value = zoomScale.value === 1;
        },
    );

    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        if (!isActive) {
            runOnUI(reset)(false);
        }
    }, [isActive, mounted, reset]);

    return (
        <View
            collapsable={false}
            style={[
                styles.flex1,
                {
                    width: canvasSize.width,
                    overflow: 'hidden',
                },
            ]}
        >
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, doubleTap, Gesture.Race(pinchGesture, singleTap, panGesture))}>
                <MultiGestureCanvasContentWrapper>
                    <Animated.View
                        collapsable={false}
                        style={animatedStyles}
                    >
                        {children}
                    </Animated.View>
                </MultiGestureCanvasContentWrapper>
            </GestureDetector>
        </View>
    );
}
MultiGestureCanvas.propTypes = multiGestureCanvasPropTypes;
MultiGestureCanvas.defaultProps = multiGestureCanvasDefaultProps;
MultiGestureCanvas.displayName = 'MultiGestureCanvas';

export default MultiGestureCanvas;
