/* eslint-disable es/no-optional-chaining */
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import stylePropTypes from '@styles/stylePropTypes';
import * as AttachmentsPropTypes from './Attachments/propTypes';
import Image from './Image';
import MultiGestureCanvas from './MultiGestureCanvas';
import getCanvasFitScale from './MultiGestureCanvas/getCanvasFitScale';
import {zoomRangeDefaultProps, zoomRangePropTypes} from './MultiGestureCanvas/propTypes';

// Increase/decrease this number to change the number of concurrent lightboxes
// The more concurrent lighboxes, the worse performance gets (especially on low-end devices)
// -1 means unlimited
const NUMBER_OF_CONCURRENT_LIGHTBOXES = 3;

const cachedDimensions = new Map();

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    ...zoomRangePropTypes,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Handles errors while displaying the image */
    onError: PropTypes.func,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** Whether the Lightbox is used within a carousel component and there are other sibling elements */
    hasSiblingCarouselItems: PropTypes.bool,

    /** The index of the carousel item */
    index: PropTypes.number,

    /** The index of the currently active carousel item */
    activeIndex: PropTypes.number,

    /** Additional styles to add to the component */
    style: stylePropTypes,
};

const defaultProps = {
    ...zoomRangeDefaultProps,

    isAuthTokenRequired: false,
    index: 0,
    activeIndex: 0,
    hasSiblingCarouselItems: false,
    onPress: () => {},
    onError: () => {},
    style: {},
};

const DEFAULT_IMAGE_SIZE = 200;

function Lightbox({isAuthTokenRequired, source, onScaleChanged, onPress, onError, style, index, activeIndex, hasSiblingCarouselItems, zoomRange}) {
    const StyleUtils = useStyleUtils();

    const [containerSize, setContainerSize] = useState({width: 0, height: 0});
    const isContainerLoaded = containerSize.width !== 0 && containerSize.height !== 0;

    const [imageDimensions, _setImageDimensions] = useState(() => cachedDimensions.get(source));
    const setImageDimensions = (newDimensions) => {
        _setImageDimensions(newDimensions);
        cachedDimensions.set(source, newDimensions);
    };

    const isItemActive = index === activeIndex;
    const [isActive, setActive] = useState(isItemActive);
    const [isImageLoaded, setImageLoaded] = useState(false);

    const isInactiveCarouselItem = hasSiblingCarouselItems && !isActive;
    const [isFallbackVisible, setFallbackVisible] = useState(isInactiveCarouselItem);
    const [isFallbackLoaded, setFallbackLoaded] = useState(false);

    const isLightboxLoaded = imageDimensions?.lightboxSize != null;
    const isLightboxInRange = useMemo(() => {
        if (NUMBER_OF_CONCURRENT_LIGHTBOXES === -1) {
            return true;
        }

        const indexCanvasOffset = Math.floor((NUMBER_OF_CONCURRENT_LIGHTBOXES - 1) / 2) || 0;
        const indexOutOfRange = index > activeIndex + indexCanvasOffset || index < activeIndex - indexCanvasOffset;
        return !indexOutOfRange;
    }, [activeIndex, index]);
    const isLightboxVisible = isLightboxInRange && (isActive || isLightboxLoaded || isFallbackLoaded);

    const isLoading = isActive && (!isContainerLoaded || !isImageLoaded);

    const updateCanvasSize = useCallback(
        ({nativeEvent}) => setContainerSize({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)}),
        [],
    );

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
        setImageLoaded(false);
    }, [isLightboxVisible]);

    useEffect(() => {
        if (!hasSiblingCarouselItems) {
            return;
        }

        if (isActive) {
            if (isImageLoaded && isFallbackVisible) {
                // We delay hiding the fallback image while image transformer is still rendering
                setTimeout(() => {
                    setFallbackVisible(false);
                    setFallbackLoaded(false);
                }, 100);
            }
        } else {
            if (isLightboxVisible && isLightboxLoaded) {
                return;
            }

            // Show fallback when the image goes out of focus or when the image is loading
            setFallbackVisible(true);
        }
    }, [hasSiblingCarouselItems, isActive, isImageLoaded, isFallbackVisible, isLightboxLoaded, isLightboxVisible]);

    const fallbackSize = useMemo(() => {
        if (!hasSiblingCarouselItems || (imageDimensions?.lightboxSize == null && imageDimensions?.fallbackSize == null) || containerSize.width === 0 || containerSize.height === 0) {
            return {
                width: DEFAULT_IMAGE_SIZE,
                height: DEFAULT_IMAGE_SIZE,
            };
        }

        const imageSize = imageDimensions.lightboxSize || imageDimensions.fallbackSize;

        const {minScale} = getCanvasFitScale({canvasSize: containerSize, contentSize: imageSize});

        return {
            width: PixelRatio.roundToNearestPixel(imageSize.width * minScale),
            height: PixelRatio.roundToNearestPixel(imageSize.height * minScale),
        };
    }, [containerSize, hasSiblingCarouselItems, imageDimensions]);

    return (
        <View
            onPress={onPress}
            style={[StyleSheet.absoluteFill, style]}
            onLayout={updateCanvasSize}
        >
            {isContainerLoaded && (
                <>
                    {isLightboxVisible && (
                        <View style={[StyleSheet.absoluteFill, {opacity: hasSiblingCarouselItems && isFallbackVisible ? 0 : 1}]}>
                            <MultiGestureCanvas
                                isActive={isActive}
                                onScaleChanged={onScaleChanged}
                                canvasSize={containerSize}
                                contentSize={imageDimensions?.lightboxSize}
                                zoomRange={zoomRange}
                            >
                                <Image
                                    source={{uri: source}}
                                    style={imageDimensions?.lightboxSize || {width: DEFAULT_IMAGE_SIZE, height: DEFAULT_IMAGE_SIZE}}
                                    isAuthTokenRequired={isAuthTokenRequired}
                                    onError={onError}
                                    onLoadEnd={() => setImageLoaded(true)}
                                    onLoad={(e) => {
                                        const width = (e.nativeEvent?.width || 0) * PixelRatio.get();
                                        const height = (e.nativeEvent?.height || 0) * PixelRatio.get();
                                        setImageDimensions({...imageDimensions, lightboxSize: {width, height}});
                                    }}
                                />
                            </MultiGestureCanvas>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback if the carousel item is not active and while the lightbox is loading the image */}
                    {isFallbackVisible && (
                        <View
                            collapsable={false}
                            style={StyleUtils.getFullscreenCenteredContentStyles()}
                        >
                            <Image
                                source={{uri: source}}
                                resizeMode="contain"
                                style={fallbackSize}
                                isAuthTokenRequired={isAuthTokenRequired}
                                onLoadEnd={() => setFallbackLoaded(true)}
                                onLoad={(e) => {
                                    const width = (e.nativeEvent?.width || 0) * PixelRatio.get();
                                    const height = (e.nativeEvent?.height || 0) * PixelRatio.get();

                                    if (imageDimensions?.lightboxSize != null) {
                                        return;
                                    }

                                    setImageDimensions({...imageDimensions, fallbackSize: {width, height}});
                                }}
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

Lightbox.propTypes = propTypes;
Lightbox.defaultProps = defaultProps;
Lightbox.displayName = 'Lightbox';

export default Lightbox;
