import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View, useWindowDimensions} from 'react-native';
import {Gesture, GestureDetector, createNativeWrapper} from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    runOnUI,
    useAnimatedProps,
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useEvent,
    useHandler,
    useSharedValue,
    useWorkletCallback,
    withDecay,
    withSpring,
} from 'react-native-reanimated';
import PagerView from 'react-native-pager-view';
import Image from '../Image';

const Context = createContext(null);

function clamp(value, lowerBound, upperBound) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

const DOUBLE_TAP_SCALE = 3;
const MAX_SCALE = 20;
const MIN_SCALE = 0.7;

const config = {
    mass: 3,
    stiffness: 1000,
    damping: 500,
};

function getScaledDimensions({canvasWidth, canvasHeight, imageWidth, imageHeight}) {
    console.log({
        canvasWidth,
        canvasHeight,
        imageWidth,
        imageHeight,
    });

    const scaleFactor = imageWidth / canvasWidth;

    const width = canvasWidth;
    const height = imageHeight / scaleFactor;

    console.log({
        canvasWidth,
        canvasHeight,
        imageWidth,
        imageHeight,
        width,
        height,
        scaleFactor,
    });

    return {width, height};
}

const defaultDimensions = {
    width: 1,
    height: 1,
};

function ImageTransformer({canvasWidth, canvasHeight, imageWidth, imageHeight, isActive, onSwipe, onSwipeSuccess, renderImage, renderFallback, onTap}) {
    const {pagerRef, shouldPagerScroll, isScrolling} = useContext(Context);

    const [showFallback, setShowFallback] = useState(typeof imageHeight === 'undefined' || typeof imageWidth === 'undefined');

    const [imageDimensions, setImageDimensions] = useState(
        showFallback
            ? defaultDimensions
            : getScaledDimensions({
                  canvasWidth,
                  canvasHeight,
                  imageWidth,
                  imageHeight,
              }),
    );

    const canvasX = useSharedValue(canvasWidth);
    const canvasY = useSharedValue(canvasHeight);

    useEffect(() => {
        runOnUI(() => {
            'worklet';

            canvasX.value = canvasWidth;
            canvasY.value = canvasHeight;
        })();
    }, [canvasX, canvasY, canvasWidth, canvasHeight]);

    const targetHeight = useSharedValue(0);

    const onLoad = (resolvedDimensions) => {
        const {width, height} = getScaledDimensions({
            canvasWidth,
            canvasHeight,
            imageWidth: resolvedDimensions.width,
            imageHeight: resolvedDimensions.height,
        });

        targetHeight.value = height;

        setImageDimensions({
            width,
            height,
        });

        setShowFallback(false);
    };

    // used for pan gesture

    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const isSwiping = useSharedValue(false);

    // used for moving fingers when pinching
    const scaleTranslateX = useSharedValue(0);
    const scaleTranslateY = useSharedValue(0);

    // storage for the the origin of the gesture
    const origin = {
        x: useSharedValue(0),
        y: useSharedValue(0),
    };

    // storage for the pan velocity to calculate the decay
    const panVelocityX = useSharedValue(0);
    const panVelocityY = useSharedValue(0);

    const scale = useSharedValue(1);
    // store scale in between gestures
    const scaleOffset = useSharedValue(1);

    // disable pan vertically when image is smaller than screen
    const canPanVertically = useDerivedValue(() => canvasY.value < targetHeight.value * scale.value);

    // calculates bounds of the scaled image
    // can we pan left/right/up/down
    // can be used to limit gesture or implementing tension effect
    const getBounds = useWorkletCallback(() => {
        const target = {
            x: 0,
            y: 0,
        };

        const fixedScale = clamp(MIN_SCALE, scale.value, MAX_SCALE);
        const scaledImage = targetHeight.value * fixedScale;

        const rightBoundary = (canvasX.value / 2) * (fixedScale - 1);

        let topBoundary = 0;

        if (canvasY.value < scaledImage) {
            topBoundary = Math.abs(scaledImage - canvasY.value) / 2;
        }

        const maxVector = {x: rightBoundary, y: topBoundary};
        const minVector = {x: -rightBoundary, y: -topBoundary};

        target.x = clamp(offsetX.value, minVector.x, maxVector.x);
        target.y = clamp(offsetY.value, minVector.y, maxVector.y);

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
    });

    const afterGesture = useWorkletCallback(() => {
        const {target, isInBoundaryX, isInBoundaryY, minVector, maxVector} = getBounds();

        if (!canPanVertically.value) {
            offsetY.value = withSpring(target.y, config);
        }

        if (
            scale.value === 1 &&
            offsetX.value === 0 &&
            offsetY.value === 0 &&
            translateX.value === 0 &&
            translateY.value === 0 &&
            scaleTranslateX.value === 0 &&
            scaleTranslateY.value === 0
        ) {
            // we don't need to run any animations
            return;
        }

        if (scale.value <= 1) {
            // just center it
            // reset(true);
            offsetX.value = withSpring(0, config);
            offsetY.value = withSpring(0, config);
            return;
        }

        const deceleration = 0.9915;

        if (isInBoundaryX) {
            if (Math.abs(panVelocityX.value) > 0 && scale.value <= MAX_SCALE) {
                offsetX.value = withDecay({
                    velocity: panVelocityX.value,
                    clamp: [minVector.x, maxVector.x],
                    deceleration,
                    rubberBandEffect: false,
                });
            }
        } else {
            offsetX.value = withSpring(target.x, config);
        }

        if (isInBoundaryY) {
            if (
                Math.abs(panVelocityY.value) > 0 &&
                scale.value <= MAX_SCALE &&
                // limit vertical pan only when image is smaller than screen
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
            offsetY.value = withSpring(target.y, config, () => {
                isSwiping.value = false;
            });
        }
    });

    const stopAnimation = useWorkletCallback(() => {
        cancelAnimation(offsetX);
        cancelAnimation(offsetY);
    });

    const zoomToCoordinates = useWorkletCallback((x, y) => {
        'worklet';

        stopAnimation();

        const usableImage = {
            x: canvasWidth,
            y: targetHeight.value,
        };

        const targetImageSize = {
            x: usableImage.x * DOUBLE_TAP_SCALE,
            y: usableImage.y * DOUBLE_TAP_SCALE,
        };

        const CENTER = {
            x: canvasX.value / 2,
            y: canvasY.value / 2,
        };

        const imageCenter = {
            x: usableImage.x / 2,
            y: usableImage.y / 2,
        };

        const focal = {x, y};

        const currentOrigin = {
            x: (targetImageSize.x / 2 - CENTER.x) * -1,
            y: (targetImageSize.y / 2 - CENTER.y) * -1,
        };

        const koef = {
            x: (1 / imageCenter.x) * focal.x - 1,
            y: (1 / imageCenter.y) * focal.y - 1,
        };

        const target = {
            x: currentOrigin.x * koef.x,
            y: currentOrigin.y * koef.y,
        };

        if (targetImageSize.y < canvasY.value) {
            target.y = 0;
        }

        offsetX.value = withSpring(target.x, config);
        offsetY.value = withSpring(target.y, config);
        scale.value = withSpring(DOUBLE_TAP_SCALE, config);
        scaleOffset.value = DOUBLE_TAP_SCALE;
    });

    const reset = useWorkletCallback((animated) => {
        scaleOffset.value = 1;

        stopAnimation();

        if (animated) {
            offsetX.value = withSpring(0, config);
            offsetY.value = withSpring(0, config);
            scale.value = withSpring(1, config);
        } else {
            scale.value = 1;
            translateX.value = 0;
            translateY.value = 0;
            offsetX.value = 0;
            offsetY.value = 0;
            scaleTranslateX.value = 0;
            scaleTranslateY.value = 0;
        }
    });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDelay(150)
        .maxDistance(20)
        .onEnd((evt) => {
            if (scale.value > 1) {
                reset(true);
            } else {
                zoomToCoordinates(evt.x, evt.y);
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
            if (success && onTap) {
                runOnJS(onTap)();
            }
        });

    const previousTouch = useSharedValue(null);

    const panGesture = Gesture.Pan()
        .manualActivation(true)
        .averageTouches(true)
        .onTouchesMove((evt, state) => {
            if (scale.value > 1) {
                state.activate();
            }

            // this is for swipe down to close
            // needs fine tuning to work properly
            // if (!isScrolling.value && scale.value === 1 && previousTouch.value != null) {
            //     const velocityX = evt.allTouches[0].x - previousTouch.value.x;
            //     const velocityY = evt.allTouches[0].y - previousTouch.value.y;

            //     // this needs tuning
            //     if (Math.abs(velocityY) > Math.abs(velocityX) && Math.abs(velocityY) > 50) {
            //         state.activate();

            //         isSwiping.value = true;
            //         previousTouch.value = null;
            //     }
            // }

            // if (previousTouch.value == null) {
            //     previousTouch.value = {
            //         x: evt.allTouches[0].x,
            //         y: evt.allTouches[0].y,
            //     };
            // }
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
                        maybeInvert(targetHeight.value * 2),
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
                            console.log('success');
                            runOnJS(onSwipeSuccess)();
                        },
                    );
                    return;
                }
            }

            afterGesture();

            panVelocityX.value = 0;
            panVelocityY.value = 0;
        })
        .withRef(panGestureRef);

    const getAdjustedFocal = useWorkletCallback((focalX, focalY) => ({
        x: focalX - (canvasX.value / 2 + offsetX.value),
        y: focalY - (canvasY.value / 2 + offsetY.value),
    }));

    // used to store event scale value when we limit scale
    const gestureScale = useSharedValue(1);

    const pinchGesture = Gesture.Pinch()
        .onTouchesDown((evt, state) => {
            // we don't want to activate pinch gesture when we are scrolling pager
            if (isScrolling.value) {
                state.fail();
            }
        })
        .simultaneousWithExternalGesture(panGesture, doubleTap)
        .onStart((evt) => {
            stopAnimation();

            const adjustFocal = getAdjustedFocal(evt.focalX, evt.focalY);

            origin.x.value = adjustFocal.x;
            origin.y.value = adjustFocal.y;
        })
        .onChange((evt) => {
            scale.value = clamp(scaleOffset.value * evt.scale, MIN_SCALE, MAX_SCALE);

            if (scale.value > MIN_SCALE && scale.value < MAX_SCALE) {
                gestureScale.value = evt.scale;
            }

            const adjustFocal = getAdjustedFocal(evt.focalX, evt.focalY);

            scaleTranslateX.value = adjustFocal.x + gestureScale.value * origin.x.value * -1;
            scaleTranslateY.value = adjustFocal.y + gestureScale.value * origin.y.value * -1;
        })
        .onEnd(() => {
            offsetX.value += scaleTranslateX.value;
            offsetY.value += scaleTranslateY.value;
            scaleTranslateX.value = 0;
            scaleTranslateY.value = 0;
            scaleOffset.value = scale.value;
            gestureScale.value = 1;

            if (scaleOffset.value < 1) {
                // make sure we don't add stuff below the 1
                scaleOffset.value = 1;

                // this runs the timing animation
                scale.value = withSpring(1, config);
            } else if (scaleOffset.value > MAX_SCALE) {
                scaleOffset.value = MAX_SCALE;
                scale.value = withSpring(MAX_SCALE, config);
            }

            afterGesture();
        });

    const animatedStyles = useAnimatedStyle(() => {
        const x = scaleTranslateX.value + translateX.value + offsetX.value;
        const y = scaleTranslateY.value + translateY.value + offsetY.value;

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
                {scale: scale.value},
            ],
        };
    }, []);

    // reacts to scale change and enables/disables pager scroll
    useAnimatedReaction(
        () => scale.value,
        () => {
            shouldPagerScroll.value = scale.value === 1;
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
            style={{
                flex: 1,
                width: canvasWidth,
            }}
        >
            <GestureDetector gesture={pinchGesture}>
                <Animated.View
                    collapsable
                    style={StyleSheet.absoluteFill}
                >
                    <GestureDetector gesture={Gesture.Race(pinchGesture, singleTap, panGesture)}>
                        <Animated.View
                            collapsable
                            style={[StyleSheet.absoluteFill]}
                        >
                            <ImageWrapper>
                                <GestureDetector gesture={doubleTap}>
                                    <Animated.View
                                        collapsable={false}
                                        style={[animatedStyles]}
                                    >
                                        {showFallback && renderFallback()}

                                        {renderImage({
                                            onResolveImageDimensions: onLoad,
                                            ...imageDimensions,
                                            style: showFallback ? {opacity: 0, position: 'absolute'} : {},
                                        })}
                                    </Animated.View>
                                </GestureDetector>
                            </ImageWrapper>
                        </Animated.View>
                    </GestureDetector>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

function ImageWrapper({children}) {
    return (
        <Animated.View
            collapsable={false}
            style={[
                {
                    ...StyleSheet.absoluteFillObject,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            ]}
        >
            {children}
        </Animated.View>
    );
}

const cachedDimensions = new Map();

function Page({isActive, item, onSwipe, onSwipeSuccess, canvasWidth, canvasHeight, onTap}) {
    const dimensions = cachedDimensions.get(item.url);

    if (!isActive) {
        return (
            <ImageWrapper>
                <Image
                    source={{uri: item.url}}
                    onLoad={(evt) => {
                        cachedDimensions.set(item.url, {
                            width: evt.nativeEvent?.width,
                            height: evt.nativeEvent?.height,
                        });
                    }}
                    style={
                        dimensions
                            ? getScaledDimensions({
                                  imageHeight: dimensions?.height,
                                  imageWidth: dimensions?.width,
                                  canvasHeight,
                                  canvasWidth,
                              })
                            : {}
                    }
                />
            </ImageWrapper>
        );
    }

    return (
        <ImageTransformer
            onSwipe={onSwipe}
            onSwipeSuccess={onSwipeSuccess}
            isActive
            onTap={onTap}
            imageHeight={dimensions?.height}
            imageWidth={dimensions?.width}
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
            renderFallback={() => <ActivityIndicator />}
            renderImage={({onResolveImageDimensions, width, height, style}) => (
                <Image
                    source={{uri: item.url, width: 100, height: 100}}
                    style={[style, {width, height}]}
                    onLoad={(evt) => {
                        cachedDimensions.set(item.url, {
                            width: evt.nativeEvent.width,
                            height: evt.nativeEvent.height,
                        });

                        onResolveImageDimensions({
                            width: evt.nativeEvent.width / PixelRatio.get(),
                            height: evt.nativeEvent.height / PixelRatio.get(),
                        });
                    }}
                />
            )}
        />
    );
}

const AnimatedPagerView = Animated.createAnimatedComponent(createNativeWrapper(PagerView));

function usePageScrollHandler(handlers, dependencies) {
    const {context, doDependenciesDiffer} = useHandler(handlers, dependencies);
    const subscribeForEvents = ['onPageScroll'];

    return useEvent(
        (event) => {
            'worklet';

            const {onPageScroll} = handlers;
            if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
                onPageScroll(event, context);
            }
        },
        subscribeForEvents,
        doDependenciesDiffer,
    );
}

const noopWorklet = () => {
    'worklet';

    // noop
};

export default function Pager({items, initialIndex = 0, onTap, itemExtractor, onSwipe = noopWorklet, onSwipeSuccess = () => {}}) {
    const windowDimensions = useWindowDimensions();

    const shouldPagerScroll = useSharedValue(true);
    const pagerRef = useRef(null);

    const isScrolling = useSharedValue(false);
    const activeIndex = useSharedValue(initialIndex);

    const pageScrollHandler = usePageScrollHandler(
        {
            onPageScroll: (e) => {
                'worklet';

                activeIndex.value = e.position;
                isScrolling.value = e.offset !== 0;
            },
        },
        [],
    );

    const [activePage, setActivePage] = useState(initialIndex);

    // we use reanimated for this since onPageSelected is called
    // in the middle of the pager animation
    useAnimatedReaction(
        () => isScrolling.value,
        (stillScrolling) => {
            if (stillScrolling) {
                return;
            }

            runOnJS(setActivePage)(activeIndex.value);
        },
    );

    const animatedProps = useAnimatedProps(() => ({
        scrollEnabled: shouldPagerScroll.value,
    }));

    const processedItems = items.map((item, index) => itemExtractor({item, index}));

    return (
        <View style={{flex: 1}}>
            <View style={{flex: 1}}>
                <Context.Provider
                    value={{
                        isScrolling,
                        pagerRef,
                        shouldPagerScroll,
                    }}
                >
                    <AnimatedPagerView
                        pageMargin={40}
                        onPageScroll={pageScrollHandler}
                        animatedProps={animatedProps}
                        ref={pagerRef}
                        style={{flex: 1}}
                        initialPage={initialIndex}
                    >
                        {processedItems.map((item, index) => (
                            <View
                                key={item.key}
                                style={{flex: 1}}
                            >
                                <Page
                                    onTap={onTap}
                                    onSwipe={onSwipe}
                                    onSwipeSuccess={onSwipeSuccess}
                                    isActive={index === activePage}
                                    item={item}
                                    canvasHeight={windowDimensions.height}
                                    canvasWidth={windowDimensions.width}
                                />
                            </View>
                        ))}
                    </AnimatedPagerView>
                </Context.Provider>
            </View>
        </View>
    );
}
