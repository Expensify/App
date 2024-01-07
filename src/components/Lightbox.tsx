import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {LayoutChangeEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import Image from './Image';
import MultiGestureCanvas, {defaultZoomRange} from './MultiGestureCanvas';
import type {ContentSize, OnScaleChangedCallback, ZoomRange} from './MultiGestureCanvas/types';
import * as MultiGestureCanvasUtils from './MultiGestureCanvas/utils';

// Increase/decrease this number to change the number of concurrent lightboxes
// The more concurrent lighboxes, the worse performance gets (especially on low-end devices)
// -1 means unlimited
const NUMBER_OF_CONCURRENT_LIGHTBOXES = 3;
const DEFAULT_IMAGE_SIZE = 200;
const DEFAULT_IMAGE_DIMENSIONS = {
    width: DEFAULT_IMAGE_SIZE,
    height: DEFAULT_IMAGE_SIZE,
};

const cachedImageDimensions = new Map<string, ContentSize | undefined>();

type ImageOnLoadEvent = NativeSyntheticEvent<ContentSize>;

type LightboxProps = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: boolean;

    /** URI to full-sized attachment, SVG function, or numeric static image on native platforms */
    uri: string;

    /** Triggers whenever the zoom scale changes */
    onScaleChanged: OnScaleChangedCallback;

    /** Handles errors while displaying the image */
    onError: () => void;

    /** Additional styles to add to the component */
    style: StyleProp<ViewStyle>;

    /** The index of the carousel item */
    index: number;

    /** The index of the currently active carousel item */
    activeIndex: number;

    /** Whether the Lightbox is used within a carousel component and there are other sibling elements */
    hasSiblingCarouselItems: boolean;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange: ZoomRange;
};

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
function Lightbox({
    isAuthTokenRequired = false,
    uri,
    onScaleChanged,
    onError,
    style,
    index = 0,
    activeIndex = 0,
    hasSiblingCarouselItems = false,
    zoomRange = defaultZoomRange,
}: LightboxProps) {
    const StyleUtils = useStyleUtils();

    const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
    const isCanvasLoaded = canvasSize.width !== 0 && canvasSize.height !== 0;
    const updateCanvasSize = useCallback(
        ({
            nativeEvent: {
                layout: {width, height},
            },
        }: LayoutChangeEvent) => setCanvasSize({width: PixelRatio.roundToNearestPixel(width), height: PixelRatio.roundToNearestPixel(height)}),
        [],
    );

    const [contentSize, setInternalContentSize] = useState(() => cachedImageDimensions.get(uri));
    const setContentSize = useCallback(
        (newContentSize: ContentSize | undefined) => {
            setInternalContentSize(newContentSize);
            cachedImageDimensions.set(uri, newContentSize);
        },
        [uri],
    );
    const updateContentSize = useCallback(
        ({nativeEvent: {width, height}}: ImageOnLoadEvent) => setContentSize({width: width * PixelRatio.get(), height: height * PixelRatio.get()}),
        [setContentSize],
    );
    const contentLoaded = contentSize != null;

    const isItemActive = index === activeIndex;
    const [isActive, setActive] = useState(isItemActive);

    const isInactiveCarouselItem = hasSiblingCarouselItems && !isActive;
    const [isFallbackVisible, setFallbackVisible] = useState(isInactiveCarouselItem);
    const [isFallbackImageLoaded, setFallbackImageLoaded] = useState(false);
    const fallbackSize = useMemo(() => {
        if (!hasSiblingCarouselItems || contentSize == null || canvasSize.width === 0 || canvasSize.height === 0) {
            return DEFAULT_IMAGE_DIMENSIONS;
        }

        const {minScale} = MultiGestureCanvasUtils.getCanvasFitScale({canvasSize, contentSize});

        return {
            width: PixelRatio.roundToNearestPixel(contentSize.width * minScale),
            height: PixelRatio.roundToNearestPixel(contentSize.height * minScale),
        };
    }, [canvasSize, hasSiblingCarouselItems, contentSize]);

    const isLightboxInRange = useMemo(() => {
        // @ts-expect-error TS will throw an error here because -1 and the constantly set number have no overlap
        // We can safely ignore this error, because we might change the value in the future
        if (NUMBER_OF_CONCURRENT_LIGHTBOXES === -1) {
            return true;
        }

        const indexCanvasOffset = Math.floor((NUMBER_OF_CONCURRENT_LIGHTBOXES - 1) / 2) || 0;
        const indexOutOfRange = index > activeIndex + indexCanvasOffset || index < activeIndex - indexCanvasOffset;
        return !indexOutOfRange;
    }, [activeIndex, index]);
    const [isLightboxImageLoaded, setLightboxImageLoaded] = useState(false);
    const isLightboxVisible = isLightboxInRange && (isActive || isLightboxImageLoaded || isFallbackImageLoaded);

    // If the fallback image is currently visible, we want to hide the Lightbox until the fallback gets hidden,
    // so that we don't see two overlapping images at the same time.
    // We cannot NOT render it, because we need to render the Lightbox to get the correct dimensions for the fallback image.
    // If there the Lightbox is not used within a carousel, we don't need to hide the Lightbox,
    // because it's only going to be rendered after the fallback image is hidden.
    const shouldHideLightbox = hasSiblingCarouselItems && isFallbackVisible;

    const isLoading = isActive && (!isCanvasLoaded || !contentLoaded);

    // We delay setting a page to active state by a (few) millisecond(s),
    // to prevent the image transformer from flashing while still rendering
    // Instead, we show the fallback image while the image transformer is loading the image
    useEffect(() => {
        if (isItemActive) {
            setTimeout(() => setActive(true), 1);
        } else {
            setActive(false);
        }
    }, [isItemActive]);

    useEffect(() => {
        if (isLightboxVisible) {
            return;
        }
        setContentSize(undefined);
    }, [isLightboxVisible, setContentSize]);

    useEffect(() => {
        if (!hasSiblingCarouselItems) {
            return;
        }

        if (isActive) {
            if (contentLoaded && isFallbackVisible) {
                // We delay hiding the fallback image while image transformer is still rendering
                setTimeout(() => {
                    setFallbackVisible(false);
                    setFallbackImageLoaded(false);
                }, 100);
            }
        } else {
            if (isLightboxVisible && isLightboxImageLoaded) {
                return;
            }

            // Show fallback when the image goes out of focus or when the image is loading
            setFallbackVisible(true);
        }
    }, [hasSiblingCarouselItems, isActive, isFallbackVisible, isLightboxImageLoaded, isLightboxVisible, contentLoaded]);

    return (
        <View
            style={[StyleSheet.absoluteFill, style]}
            onLayout={updateCanvasSize}
        >
            {isCanvasLoaded && (
                <>
                    {isLightboxVisible && (
                        <View style={[...StyleUtils.getFullscreenCenteredContentStyles(), StyleUtils.getLightboxVisibilityStyle(shouldHideLightbox)]}>
                            <MultiGestureCanvas
                                isActive={isActive}
                                onScaleChanged={onScaleChanged}
                                canvasSize={canvasSize}
                                contentSize={contentSize}
                                zoomRange={zoomRange}
                            >
                                <Image
                                    isActive={isActive}
                                    source={{uri}}
                                    style={contentSize ?? DEFAULT_IMAGE_DIMENSIONS}
                                    isAuthTokenRequired={isAuthTokenRequired}
                                    onError={onError}
                                    onLoad={updateContentSize}
                                    onLoadEnd={() => setLightboxImageLoaded(true)}
                                />
                            </MultiGestureCanvas>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback if the carousel item is not active and while the lightbox is loading the image */}
                    {isFallbackVisible && (
                        <View style={StyleUtils.getFullscreenCenteredContentStyles()}>
                            <Image
                                source={{uri}}
                                resizeMode="contain"
                                style={fallbackSize}
                                isAuthTokenRequired={isAuthTokenRequired}
                                onLoad={updateContentSize}
                                onLoadEnd={() => setFallbackImageLoaded(true)}
                            />
                        </View>
                    )}

                    {/* Show activity indicator while the lightbox is still loading the image. */}
                    {isLoading && (
                        <ActivityIndicator
                            size="large"
                            style={StyleSheet.absoluteFill}
                        />
                    )}
                </>
            )}
        </View>
    );
}

Lightbox.displayName = 'Lightbox';

export default Lightbox;
