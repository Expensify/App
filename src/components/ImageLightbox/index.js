/* eslint-disable es/no-optional-chaining */
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import * as AttachmentsPropTypes from '@components/Attachments/propTypes';
import Image from '@components/Image';
import ImageLightboxUtils from './ImageLightboxUtils';
import ImageTransformer from './ImageTransformer';
import ImageWrapper from './ImageWrapper';

const cachedDimensions = new Map();

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    /** Function for handle on press */
    onPress: PropTypes.func,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    isActive: PropTypes.bool,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    isAuthTokenRequired: false,
    isActive: true,
    // imageDimensions: undefined,
    onPress: () => {},
    style: {},
};

function ImageLightbox({isAuthTokenRequired, source, onScaleChanged, onPress, style, isActive: initialIsActive}) {
    const [isActive, setIsActive] = useState(initialIsActive);

    const imageDimensions = cachedDimensions.get(source);
    const setImageDimensions = (newDimensions) => cachedDimensions.set(source, newDimensions);

    // We delay setting a page to active state by a (few) millisecond(s),
    // to prevent the image transformer from flashing while still rendering
    // Instead, we show the fallback image while the image transformer is loading the image
    useEffect(() => {
        if (initialIsActive) {
            setTimeout(() => setIsActive(true), 1);
        } else {
            setIsActive(false);
        }
    }, [initialIsActive]);

    const [initialActivePageLoad, setInitialActivePageLoad] = useState(isActive);
    const isImageLoaded = useRef(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isFallbackLoading, setIsFallbackLoading] = useState(false);
    const [showFallback, setShowFallback] = useState(true);

    // We delay hiding the fallback image while image transformer is still rendering
    useEffect(() => {
        if (isImageLoading || showFallback) {
            setShowFallback(true);
        } else {
            setTimeout(() => setShowFallback(false), 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isImageLoading]);

    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
    const canvasWidth = containerDimensions.width;
    const canvasHeight = containerDimensions.height;
    const isLoadingLayout = canvasWidth === 0 || canvasHeight === 0;

    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={({nativeEvent}) =>
                setContainerDimensions({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)})
            }
        >
            {isActive && (
                <View style={StyleSheet.absoluteFill}>
                    <ImageTransformer
                        isActive
                        canvasWidth={canvasWidth}
                        canvasHeight={canvasHeight}
                        imageWidth={imageDimensions?.width}
                        imageHeight={imageDimensions?.height}
                        scaledImageWidth={imageDimensions?.scaledWidth}
                        scaledImageHeight={imageDimensions?.scaledHeight}
                        imageScaleX={imageDimensions?.scaleX}
                        imageScaleY={imageDimensions?.scaleY}
                    >
                        <Image
                            source={{uri: source}}
                            style={imageDimensions == null ? undefined : {width: imageDimensions.width, height: imageDimensions.height}}
                            isAuthTokenRequired={isAuthTokenRequired}
                            onLoadStart={() => {
                                setIsImageLoading(true);
                            }}
                            onLoadEnd={() => {
                                setShowFallback(false);
                                setIsImageLoading(false);
                                isImageLoaded.current = true;
                            }}
                            onLoad={(evt) => {
                                const imageWidth = (evt.nativeEvent?.width || 0) / PixelRatio.get();
                                const imageHeight = (evt.nativeEvent?.height || 0) / PixelRatio.get();

                                const {scaleX, scaleY} = ImageLightboxUtils.getCanvasFitScale({canvasWidth, canvasHeight, imageWidth, imageHeight});

                                // Don't update the dimensions if they are already set
                                if (
                                    imageDimensions?.width !== imageWidth ||
                                    imageDimensions?.height !== imageHeight ||
                                    imageDimensions?.scaleX !== scaleX ||
                                    imageDimensions?.scaleY !== scaleY
                                ) {
                                    setImageDimensions({
                                        ...imageDimensions,
                                        width: imageWidth,
                                        height: imageHeight,
                                        scaleX,
                                        scaleY,
                                    });
                                }

                                // On the initial render of the active page, the onLoadEnd event is never fired.
                                // That's why we instead set isImageLoading to false in the onLoad event.
                                if (initialActivePageLoad) {
                                    setInitialActivePageLoad(false);
                                    setIsImageLoading(false);
                                    setTimeout(() => setShowFallback(false), 100);
                                    isImageLoaded.current = true;
                                }
                            }}
                        />
                    </ImageTransformer>
                </View>
            )}

            {/* Keep rendering the image without gestures as fallback while ImageLightbox is loading the image */}
            {(showFallback || !isActive) && (
                <ImageWrapper>
                    <Image
                        source={{uri: source}}
                        isAuthTokenRequired={isAuthTokenRequired}
                        onLoadStart={() => {
                            setIsFallbackLoading(true);
                        }}
                        onLoadEnd={() => {
                            setIsFallbackLoading(false);
                        }}
                        onLoad={(evt) => {
                            const imageWidth = evt.nativeEvent.width;
                            const imageHeight = evt.nativeEvent.height;

                            const {scaleX, scaleY} = ImageLightboxUtils.getCanvasFitScale({canvasWidth, canvasHeight, imageWidth, imageHeight});
                            const minImageScale = Math.min(scaleX, scaleY);

                            const scaledWidth = imageWidth * minImageScale;
                            const scaledHeight = imageHeight * minImageScale;

                            // Don't update the dimensions if they are already set
                            if (imageDimensions?.scaledWidth === scaledWidth && imageDimensions?.scaledHeight === scaledHeight) {
                                return;
                            }

                            setImageDimensions({
                                ...imageDimensions,
                                scaledWidth,
                                scaledHeight,
                            });
                        }}
                        style={imageDimensions == null ? undefined : {width: imageDimensions.scaledWidth, height: imageDimensions.scaledHeight}}
                    />
                </ImageWrapper>
            )}

            {/* Show activity indicator while ImageLightbox is still loading the image. */}
            {isActive && isFallbackLoading && !isImageLoaded.current && (
                <ActivityIndicator
                    size="large"
                    style={StyleSheet.absoluteFill}
                />
            )}
        </View>
    );
}

ImageLightbox.propTypes = propTypes;
ImageLightbox.defaultProps = defaultProps;
ImageLightbox.displayName = 'AttachmentCarouselPage';

export default ImageLightbox;
