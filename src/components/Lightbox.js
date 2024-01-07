/* eslint-disable es/no-optional-chaining */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import AttachmentCarouselPagerContext from './Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
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

    /** Triggers whenever the zoom scale changes */
    onScaleChanged: PropTypes.func,

    /** Handles errors while displaying the image */
    onError: PropTypes.func,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    ...zoomRangeDefaultProps,

    isAuthTokenRequired: false,
    onScaleChanged: () => {},
    onError: () => {},
    style: {},
};

const DEFAULT_IMAGE_SIZE = 200;

function Lightbox({isAuthTokenRequired, source, onScaleChanged, onError, style, zoomRange}) {
    const StyleUtils = useStyleUtils();

    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const {isUsedInCarousel, isSingleCarouselItem, page, activePage, onTap, isPagerSwiping} = useMemo(() => {
        if (attachmentCarouselPagerContext == null) {
            return {
                isUsedInCarousel: false,
                isSingleCarouselItem: true,
                page: 0,
                activePage: 0,
                onTap: () => {},
                isPagerSwiping: false,
            };
        }

        const foundPageIndex = _.findIndex(attachmentCarouselPagerContext.itemsMeta, (item) => item.source === source);
        return {
            ...attachmentCarouselPagerContext,
            isUsedInCarousel: true,
            isSingleCarouselItem: attachmentCarouselPagerContext.itemsMeta.length === 1,
            page: foundPageIndex,
        };
    }, [attachmentCarouselPagerContext, source]);
    const hasSiblingCarouselItems = isUsedInCarousel && !isSingleCarouselItem;

    const [containerSize, setContainerSize] = useState({width: 0, height: 0});
    const isContainerLoaded = containerSize.width !== 0 && containerSize.height !== 0;

    const [imageDimensions, _setImageDimensions] = useState(() => cachedDimensions.get(source));
    const setImageDimensions = (newDimensions) => {
        _setImageDimensions(newDimensions);
        cachedDimensions.set(source, newDimensions);
    };

    const isActivePage = page === activePage;
    const [isActive, setActive] = useState(isActivePage);
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
        const indexOutOfRange = page > activePage + indexCanvasOffset || page < activePage - indexCanvasOffset;
        return !indexOutOfRange;
    }, [activePage, page]);
    const isLightboxVisible = isLightboxInRange && (isActive || isLightboxLoaded || isFallbackLoaded);

    // If the fallback image is currently visible, we want to hide the Lightbox until the fallback gets hidden,
    // so that we don't see two overlapping images at the same time.
    // If there the Lightbox is not used within a carousel, we don't need to hide the Lightbox,
    // because it's only going to be rendered after the fallback image is hidden.
    const shouldHideLightbox = hasSiblingCarouselItems && isFallbackVisible;

    const isLoading = isActive && (!isContainerLoaded || !isImageLoaded);

    const updateCanvasSize = useCallback(
        ({nativeEvent}) => setContainerSize({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)}),
        [],
    );

    // We delay setting a page to active state by a (few) millisecond(s),
    // to prevent the image transformer from flashing while still rendering
    // Instead, we show the fallback image while the image transformer is loading the image
    useEffect(() => {
        if (isActivePage) {
            setTimeout(() => setActive(true), 1);
        } else {
            setActive(false);
        }
    }, [isActivePage]);

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
            style={[StyleSheet.absoluteFill, style]}
            onLayout={updateCanvasSize}
        >
            {isContainerLoaded && (
                <>
                    {isLightboxVisible && (
                        <View style={[...StyleUtils.getFullscreenCenteredContentStyles(), StyleUtils.getLightboxVisibilityStyle(shouldHideLightbox)]}>
                            <MultiGestureCanvas
                                isActive={isActive}
                                areTransformationsEnabled={isPagerSwiping}
                                onTap={onTap}
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
                        <View style={StyleUtils.getFullscreenCenteredContentStyles()}>
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
