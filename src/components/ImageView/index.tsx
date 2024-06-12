import type {SyntheticEvent} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withSpring} from 'react-native-reanimated';
import AttachmentOfflineIndicator from '@components/AttachmentOfflineIndicator';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Image from '@components/Image';
import RESIZE_MODES from '@components/Image/resizeModes';
import type {ImageOnLoadEvent} from '@components/Image/types';
import {SPRING_CONFIG} from '@components/MultiGestureCanvas/constants';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import viewRef from '@src/types/utils/viewRef';
import type ImageViewProps from './types';

type ZoomDelta = {offsetX: number; offsetY: number};

function ImageView({isAuthTokenRequired = false, url, fileName, onError, onSwipeDown}: ImageViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isLoading, setIsLoading] = useState(true);
    const [containerHeight, setContainerHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [initialScrollLeft, setInitialScrollLeft] = useState(0);
    const [initialScrollTop, setInitialScrollTop] = useState(0);
    const [initialX, setInitialX] = useState(0);
    const [initialY, setInitialY] = useState(0);
    const [imgWidth, setImgWidth] = useState(0);
    const [imgContainerHeight, setImgContainerHeight] = useState(0);
    const [imgContainerWidth, setImgContainerWidth] = useState(0);
    const [imgHeight, setImgHeight] = useState(0);
    const [zoomScale, setZoomScale] = useState(0);
    const [zoomDelta, setZoomDelta] = useState<ZoomDelta>();
    const {isOffline} = useNetwork();

    const scrollableRef = useRef<HTMLDivElement>(null);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const setScale = (newContainerWidth: number, newContainerHeight: number, newImageWidth: number, newImageHeight: number) => {
        if (!newContainerWidth || !newImageWidth || !newContainerHeight || !newImageHeight) {
            return;
        }
        const newZoomScale = Math.min(newContainerWidth / newImageWidth, newContainerHeight / newImageHeight);
        setZoomScale(newZoomScale);
    };
    const scale = useSharedValue(1);
    const deltaScale = useSharedValue(1);
    const minScale = 1.0;
    const maxScale = 20;
    const translationX = useSharedValue(1);
    const translationY = useSharedValue(1);
    const prevTranslationX = useSharedValue(0);
    const prevTranslationY = useSharedValue(0);
    const zoomedContentWidth = useDerivedValue(() => imgContainerWidth * scale.value, [imgContainerWidth, scale.value]);
    const zoomedContentHeight = useDerivedValue(() => imgContainerHeight * scale.value, [imgContainerHeight, scale.value]);
    const maxTranslateX = useMemo(() => imgContainerWidth / 2, [imgContainerWidth]);
    const maxTranslateY = useMemo(() => containerHeight / 2, [containerHeight]);
    const horizontalBoundaries = useMemo(() => {
        let horizontalBoundary = 0;
        if (containerWidth < zoomedContentWidth.value) {
            horizontalBoundary = Math.abs(containerWidth - zoomedContentWidth.value) / 2;
        }
        return {min: -horizontalBoundary, max: horizontalBoundary};
    }, [containerWidth, zoomedContentWidth.value]);
    const verticalBoundaries = useMemo(() => {
        let verticalBoundary = 0;
        if (containerHeight < zoomedContentHeight.value) {
            verticalBoundary = Math.abs(zoomedContentHeight.value - containerHeight) / 2;
        }
        return {min: -verticalBoundary, max: verticalBoundary};
    }, [containerHeight, zoomedContentHeight.value]);
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            deltaScale.value = scale.value;
        })
        .onUpdate((e) => {
            if (scale.value < minScale / 2) {
                return;
            }
            scale.value = deltaScale.value * e.scale;
        })
        .onEnd(() => {
            if (scale.value < minScale) {
                scale.value = withSpring(minScale, SPRING_CONFIG);
                translationX.value = 0;
                translationY.value = 0;
            }
            if (scale.value > maxScale) {
                scale.value = withSpring(maxScale, SPRING_CONFIG);
            }
            deltaScale.value = scale.value;
        })
        .runOnJS(true);
    const clamp = (val: number, min: number, max: number) => {
        'worklet';

        return Math.min(Math.max(val, min), max);
    };
    const panGesture = Gesture.Pan()
        .onStart(() => {
            'worklet';

            prevTranslationX.value = translationX.value;
            prevTranslationY.value = translationY.value;
        })
        .onUpdate((e) => {
            'worklet';

            if (scale.value === minScale) {
                if (e.translationX === 0 && e.translationY > 0) {
                    translationY.value = clamp(prevTranslationY.value + e.translationY, -maxTranslateY, maxTranslateY);
                } else {
                    return;
                }
            }
            translationX.value = clamp(prevTranslationX.value + e.translationX, -maxTranslateX, maxTranslateX);
            if (zoomedContentHeight.value < containerHeight) {
                return;
            }
            translationY.value = clamp(prevTranslationY.value + e.translationY, -maxTranslateY, maxTranslateY);
        })
        .onEnd(() => {
            'worklet';

            const swipeDownPadding = 150;
            const dy = translationY.value + swipeDownPadding;
            if (dy >= maxTranslateY && scale.value === minScale) {
                if (onSwipeDown) {
                    onSwipeDown();
                }
            } else if (scale.value === minScale) {
                translationY.value = withSpring(0, SPRING_CONFIG);
                translationX.value = withSpring(0, SPRING_CONFIG);
                return;
            }
            const tsx = translationX.value * scale.value;
            const tsy = translationY.value * scale.value;
            const inHorizontalBoundaries = tsx >= horizontalBoundaries.min && tsx <= horizontalBoundaries.max;
            const inVerticalBoundaries = tsy >= verticalBoundaries.min && tsy <= verticalBoundaries.max;
            if (!inHorizontalBoundaries) {
                const halfx = zoomedContentWidth.value / 2;
                const diffx = halfx - translationX.value * scale.value;
                const valx = maxTranslateX - diffx;
                if (valx > 0) {
                    const p = (translationX.value * scale.value - valx) / scale.value;
                    translationX.value = withSpring(p, SPRING_CONFIG);
                }
                if (valx < 0) {
                    const p = (translationX.value * scale.value - valx) / scale.value;
                    translationX.value = withSpring(-p, SPRING_CONFIG);
                }
            }
            if (!inVerticalBoundaries) {
                if (zoomedContentHeight?.value < containerHeight) {
                    return;
                }
                const halfy = zoomedContentHeight.value / 2;
                const diffy = halfy - translationY.value * scale.value;
                const valy = maxTranslateY - diffy;
                if (valy > 0) {
                    const p = (translationY.value * scale.value - valy) / scale.value;
                    translationY.value = withSpring(p, SPRING_CONFIG);
                }
                if (valy < 0) {
                    const p = (translationY.value * scale.value - valy) / scale.value;
                    translationY.value = withSpring(-p, SPRING_CONFIG);
                }
            }
        })
        .runOnJS(true);

    const onContainerLayoutChanged = (e: LayoutChangeEvent) => {
        const {width, height} = e.nativeEvent.layout;
        setScale(width, height, imgWidth, imgHeight);

        setContainerHeight(height);
        setContainerWidth(width);
    };

    /**
     * When open image, set image width, height.
     */
    const setImageRegion = (imageWidth: number, imageHeight: number) => {
        if (imageHeight <= 0) {
            return;
        }
        setScale(containerWidth, containerHeight, imageWidth, imageHeight);
        setImgWidth(imageWidth);
        setImgHeight(imageHeight);
    };

    const imageLoadingStart = () => {
        if (!isLoading) {
            return;
        }
        setIsLoading(true);
        setZoomScale(0);
        setIsZoomed(false);
    };

    const imageLoad = ({nativeEvent}: ImageOnLoadEvent) => {
        setImageRegion(nativeEvent.width, nativeEvent.height);
        setIsLoading(false);
    };

    const onContainerPressIn = (e: GestureResponderEvent) => {
        const {pageX, pageY} = e.nativeEvent;
        setIsMouseDown(true);
        setInitialX(pageX);
        setInitialY(pageY);
        setInitialScrollLeft(scrollableRef.current?.scrollLeft ?? 0);
        setInitialScrollTop(scrollableRef.current?.scrollTop ?? 0);
    };

    /**
     * Convert touch point to zoomed point
     * @param x point when click zoom
     * @param y point when click zoom
     * @returns converted touch point
     */
    const getScrollOffset = (x: number, y: number) => {
        let offsetX = 0;
        let offsetY = 0;

        // Container size bigger than clicked position offset
        if (x <= containerWidth / 2) {
            offsetX = 0;
        } else if (x > containerWidth / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetX = x - containerWidth / 2;
        }
        if (y <= containerHeight / 2) {
            offsetY = 0;
        } else if (y > containerHeight / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetY = y - containerHeight / 2;
        }
        return {offsetX, offsetY};
    };

    const onContainerPress = (e?: GestureResponderEvent | KeyboardEvent | SyntheticEvent<Element, PointerEvent>) => {
        if (!isZoomed && !isDragging) {
            if (e && 'nativeEvent' in e && e.nativeEvent instanceof PointerEvent) {
                const {offsetX, offsetY} = e.nativeEvent;

                // Dividing clicked positions by the zoom scale to get coordinates
                // so that once we zoom we will scroll to the clicked location.
                const delta = getScrollOffset(offsetX / zoomScale, offsetY / zoomScale);
                setZoomDelta(delta);
            } else {
                setZoomDelta({offsetX: 0, offsetY: 0});
            }
        }

        if (isZoomed && isDragging && isMouseDown) {
            setIsDragging(false);
            setIsMouseDown(false);
        } else {
            // We first zoom and once its done then we scroll to the location the user clicked.
            setIsZoomed(!isZoomed);
            setIsMouseDown(false);
        }
    };

    const trackPointerPosition = useCallback(
        (event: MouseEvent) => {
            // Whether the pointer is released inside the ImageView
            const isInsideImageView = scrollableRef.current?.contains(event.target as Node);

            if (!isInsideImageView && isZoomed && isDragging && isMouseDown) {
                setIsDragging(false);
                setIsMouseDown(false);
            }
        },
        [isDragging, isMouseDown, isZoomed],
    );

    const trackMovement = useCallback(
        (event: MouseEvent) => {
            if (!isZoomed) {
                return;
            }

            if (isDragging && isMouseDown && scrollableRef.current) {
                const x = event.x;
                const y = event.y;
                const moveX = initialX - x;
                const moveY = initialY - y;
                scrollableRef.current.scrollLeft = initialScrollLeft + moveX;
                scrollableRef.current.scrollTop = initialScrollTop + moveY;
            }

            setIsDragging(isMouseDown);
        },
        [initialScrollLeft, initialScrollTop, initialX, initialY, isDragging, isMouseDown, isZoomed],
    );

    useEffect(() => {
        if (!isZoomed || !zoomDelta || !scrollableRef.current) {
            return;
        }
        scrollableRef.current.scrollLeft = zoomDelta.offsetX;
        scrollableRef.current.scrollTop = zoomDelta.offsetY;
    }, [zoomDelta, isZoomed]);

    useEffect(() => {
        if (canUseTouchScreen) {
            return;
        }
        document.addEventListener('mousemove', trackMovement);
        document.addEventListener('mouseup', trackPointerPosition);

        return () => {
            document.removeEventListener('mousemove', trackMovement);
            document.removeEventListener('mouseup', trackPointerPosition);
        };
    }, [canUseTouchScreen, trackMovement, trackPointerPosition]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{scale: scale.value}, {translateX: translationX.value}, {translateY: translationY.value}],
    }));

    const imgContainerStyle = useMemo(() => {
        const aspectRatio = (imgHeight && imgWidth / imgHeight) || 1;
        if (imgWidth >= imgHeight || imgHeight < containerHeight) {
            const imgStyle: ViewStyle[] = [{width: '100%', aspectRatio}];
            return imgStyle;
        }
        if (imgHeight > imgWidth) {
            const imgStyle: ViewStyle[] = [{height: '100%', aspectRatio}];
            return imgStyle;
        }
    }, [imgWidth, imgHeight, containerHeight]);

    if (canUseTouchScreen) {
        return (
            <View
                style={[styles.imageViewContainer, styles.overflowHidden, StyleUtils.getFullscreenCenteredContentStyles()]}
                onLayout={onContainerLayoutChanged}
            >
                <GestureDetector gesture={Gesture.Race(pinchGesture, panGesture)}>
                    <Animated.View
                        style={[animatedStyle, imgContainerStyle]}
                        onLayout={(e) => {
                            const {width, height} = e.nativeEvent.layout;
                            setImgContainerHeight(height);
                            setImgContainerWidth(width);
                        }}
                    >
                        <Animated.Image
                            source={{uri: isAuthTokenRequired ? addEncryptedAuthTokenToURL(url) : url}}
                            // Hide image until finished loading to prevent showing preview with wrong dimensions.
                            // style={isLoading || zoomScale === 0 ? undefined : [styles.w100, styles.h100]}
                            style={[styles.w100, styles.h100]}
                            // When Image dimensions are lower than the container boundary(zoomscale <= 1), use `contain` to render the image with natural dimensions.
                            // Both `center` and `contain` keeps the image centered on both x and y axis.
                            resizeMode={RESIZE_MODES.contain}
                            onLoadStart={imageLoadingStart}
                            onLoad={(e) => {
                                const {width, height} = e.nativeEvent.source;
                                const params = {
                                    nativeEvent: {
                                        width,
                                        height,
                                    },
                                };
                                imageLoad(params);
                            }}
                            onError={onError}
                        />
                    </Animated.View>
                </GestureDetector>
                {isLoading && !isOffline && <FullscreenLoadingIndicator />}
                {isLoading && <AttachmentOfflineIndicator />}
            </View>
        );
    }
    return (
        <View
            ref={viewRef(scrollableRef)}
            onLayout={onContainerLayoutChanged}
            style={[styles.imageViewContainer, styles.overflowAuto, styles.pRelative]}
        >
            <PressableWithoutFeedback
                style={{
                    ...StyleUtils.getZoomSizingStyle(isZoomed, imgWidth, imgHeight, zoomScale, containerHeight, containerWidth, isLoading),
                    ...StyleUtils.getZoomCursorStyle(isZoomed, isDragging),
                    ...(isZoomed && zoomScale >= 1 ? styles.pRelative : styles.pAbsolute),
                    ...styles.flex1,
                }}
                onPressIn={onContainerPressIn}
                onPress={onContainerPress}
                role={CONST.ROLE.IMG}
                accessibilityLabel={fileName}
            >
                <Image
                    source={{uri: url}}
                    isAuthTokenRequired={isAuthTokenRequired}
                    style={[styles.h100, styles.w100]}
                    resizeMode={RESIZE_MODES.contain}
                    onLoadStart={imageLoadingStart}
                    onLoad={imageLoad}
                    onError={onError}
                />
            </PressableWithoutFeedback>

            {isLoading && !isOffline && <FullscreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
            {isLoading && <AttachmentOfflineIndicator />}
        </View>
    );
}

ImageView.displayName = 'ImageView';

export default ImageView;
