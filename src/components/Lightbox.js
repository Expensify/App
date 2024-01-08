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
import {zoomRangeDefaultProps, zoomRangePropTypes} from './MultiGestureCanvas/propTypes';
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

const cachedImageDimensions = new Map();

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    ...zoomRangePropTypes,

    /** Handles errors while displaying the image */
    onError: PropTypes.func,

    /** URI to full-sized attachment, SVG function, or numeric static image on native platforms */
    uri: AttachmentsPropTypes.string.isRequired,

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

function Lightbox({isAuthTokenRequired, uri, onError, style, zoomRange}) {
    const StyleUtils = useStyleUtils();

    const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
    const isCanvasLoaded = canvasSize.width !== 0 && canvasSize.height !== 0;
    const updateCanvasSize = useCallback(
        ({
            nativeEvent: {
                layout: {width, height},
            },
        }) => setCanvasSize({width: PixelRatio.roundToNearestPixel(width), height: PixelRatio.roundToNearestPixel(height)}),
        [],
    );

    const [contentSize, setInternalContentSize] = useState(() => cachedImageDimensions.get(uri));
    const setContentSize = useCallback(
        (newDimensions) => {
            setInternalContentSize(newDimensions);
            cachedImageDimensions.set(uri, newDimensions);
        },
        [uri],
    );
    const updateContentSize = useCallback(({nativeEvent: {width, height}}) => setContentSize({width: width * PixelRatio.get(), height: height * PixelRatio.get()}), [setContentSize]);
    const contentLoaded = contentSize != null;

    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const {isUsedInCarousel, isSingleCarouselItem, isPagerSwiping, page, activePage, onTap, onScaleChanged, pagerRef} = useMemo(() => {
        if (attachmentCarouselPagerContext == null) {
            return {
                isUsedInCarousel: false,
                isSingleCarouselItem: true,
                isPagerSwiping: false,
                page: 0,
                activePage: 0,
                onTap: () => {},
                onScaleChanged: () => {},
            };
        }

        const foundPageIndex = _.findIndex(attachmentCarouselPagerContext.itemsMeta, (item) => item.source === uri);
        return {
            ...attachmentCarouselPagerContext,
            isUsedInCarousel: true,
            isSingleCarouselItem: attachmentCarouselPagerContext.itemsMeta.length === 1,
            page: foundPageIndex,
        };
    }, [attachmentCarouselPagerContext, uri]);
    const hasSiblingCarouselItems = isUsedInCarousel && !isSingleCarouselItem;

    const isActivePage = page === activePage;
    const [isActive, setActive] = useState(isActivePage);

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
        if (NUMBER_OF_CONCURRENT_LIGHTBOXES === -1) {
            return true;
        }

        const indexCanvasOffset = Math.floor((NUMBER_OF_CONCURRENT_LIGHTBOXES - 1) / 2) || 0;
        const indexOutOfRange = page > activePage + indexCanvasOffset || page < activePage - indexCanvasOffset;
        return !indexOutOfRange;
    }, [activePage, page]);
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
    }, [hasSiblingCarouselItems, isActive, isFallbackVisible, isLightboxVisible, contentLoaded, isLightboxImageLoaded]);

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
                                onTap={onTap}
                                onScaleChanged={onScaleChanged}
                                canvasSize={canvasSize}
                                contentSize={contentSize}
                                zoomRange={zoomRange}
                                externalGestureRef={pagerRef}
                                shouldDisableTransformationGestures={isPagerSwiping}
                            >
                                <Image
                                    source={{uri}}
                                    style={contentSize || DEFAULT_IMAGE_DIMENSIONS}
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

Lightbox.propTypes = propTypes;
Lightbox.defaultProps = defaultProps;
Lightbox.displayName = 'Lightbox';

export default Lightbox;
