/* eslint-disable es/no-optional-chaining */
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import Image from '@components/Image';
import ImageLightboxUtils from './ImageLightboxUtils';
import ImageTransformer from './ImageTransformer';
import ImageWrapper from './ImageWrapper';
import {imageLightboxDefaultProps, imageLightboxPropTypes} from './propTypes';

const cachedDimensions = new Map();

function ImageLightbox({isAuthTokenRequired, source, onScaleChanged, onPress, style, isActive: initialIsActive, minZoomScale, maxZoomScale}) {
    const [isActive, setIsActive] = useState(initialIsActive);

    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
    const canvasWidth = containerDimensions.width;
    const canvasHeight = containerDimensions.height;

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
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isFallbackLoading, setIsFallbackLoading] = useState(false);
    const [showFallback, setShowFallback] = useState(true);

    const isFallbackVisible = showFallback || !isActive;
    const isCanvasLoading = canvasWidth === 0 || canvasHeight === 0;
    const isLoading = isCanvasLoading || (isActive && isFallbackLoading && !isImageLoading);

    // We delay hiding the fallback image while image transformer is still rendering
    useEffect(() => {
        if (isImageLoading) {
            setShowFallback(true);
        } else {
            setTimeout(() => setShowFallback(false), 100);
        }
    }, [isImageLoading]);

    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={({nativeEvent}) =>
                setContainerDimensions({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)})
            }
        >
            {!isCanvasLoading && (
                <>
                    {isActive && (
                        <View style={[StyleSheet.absoluteFill, {opacity: isFallbackVisible ? 0 : 1}]}>
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
                                minZoomScale={minZoomScale}
                                maxZoomScale={maxZoomScale}
                            >
                                <Image
                                    source={{uri: source}}
                                    style={imageDimensions == null ? undefined : {width: imageDimensions.width, height: imageDimensions.height}}
                                    isAuthTokenRequired={isAuthTokenRequired}
                                    onLoadStart={() => {
                                        setIsImageLoading(true);
                                    }}
                                    onLoadEnd={() => {
                                        setInitialActivePageLoad(false);
                                        setIsImageLoading(false);
                                        setShowFallback(false);
                                    }}
                                    onLoad={(evt) => {
                                        const imageWidth = (evt.nativeEvent?.width || 0) / PixelRatio.get();
                                        const imageHeight = (evt.nativeEvent?.height || 0) / PixelRatio.get();

                                        const {scaleX, scaleY} = ImageLightboxUtils.getCanvasFitScale({canvasWidth, canvasHeight, imageWidth, imageHeight});

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
                                        }
                                    }}
                                />
                            </ImageTransformer>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback while ImageLightbox is loading the image */}
                    {isFallbackVisible && (
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

                                    if (imageDimensions?.scaledWidth !== scaledWidth || imageDimensions?.scaledHeight !== scaledHeight) {
                                        setImageDimensions({
                                            ...imageDimensions,
                                            scaledWidth,
                                            scaledHeight,
                                        });
                                    }
                                }}
                                style={imageDimensions == null ? undefined : {width: imageDimensions.scaledWidth, height: imageDimensions.scaledHeight}}
                            />
                        </ImageWrapper>
                    )}

                    {/* Show activity indicator while ImageLightbox is still loading the image. */}
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

ImageLightbox.propTypes = imageLightboxPropTypes;
ImageLightbox.defaultProps = imageLightboxDefaultProps;
ImageLightbox.displayName = 'ImageLightbox';

export default ImageLightbox;
