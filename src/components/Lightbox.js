/* eslint-disable es/no-optional-chaining */
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import * as AttachmentsPropTypes from './Attachments/propTypes';
import Image from './Image';
import MultiGestureCanvas from './MultiGestureCanvas';
import MultiGestureCanvasContentWrapper from './MultiGestureCanvas/MultiGestureCanvasContentWrapper';
import {zoomRangeDefaultProps, zoomRangePropTypes} from './MultiGestureCanvas/propTypes';

const cachedDimensions = new Map();

function getCanvasFitScale({canvasSize, contentSize}) {
    const scaleX = canvasSize.width / contentSize.width;
    const scaleY = canvasSize.height / contentSize.height;

    return {scaleX, scaleY};
}

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    ...zoomRangePropTypes,

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
    ...zoomRangeDefaultProps,

    isAuthTokenRequired: false,
    isActive: true,
    onPress: () => {},
    style: {},
};

function Lightbox({isAuthTokenRequired, source, onScaleChanged, onPress, style, isActive: initialIsActive, zoomRange}) {
    const [isActive, setIsActive] = useState(initialIsActive);

    const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});

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
    const isCanvasLoading = canvasSize.width === 0 || canvasSize.height === 0;
    const isLoading = isCanvasLoading || (isActive && isFallbackVisible && isFallbackLoading) || isImageLoading;

    // We delay hiding the fallback image while image transformer is still rendering
    useEffect(() => {
        if (isImageLoading || showFallback) {
            setShowFallback(true);
        } else {
            setTimeout(() => setShowFallback(false), 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isImageLoading]);

    return (
        <View
            onPress={onPress}
            style={[StyleSheet.absoluteFill, style]}
            onLayout={({nativeEvent}) => setCanvasSize({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)})}
        >
            {!isCanvasLoading && (
                <>
                    {isActive && (
                        <View style={[StyleSheet.absoluteFill, {opacity: isFallbackVisible ? 0 : 1}]}>
                            <MultiGestureCanvas
                                isActive
                                onScaleChanged={onScaleChanged}
                                canvasSize={canvasSize}
                                contentSize={imageDimensions?.contentSize}
                                contentScaling={imageDimensions?.contentScaling}
                                zoomRange={zoomRange}
                            >
                                <Image
                                    source={{uri: source}}
                                    style={imageDimensions?.contentSize == null ? undefined : imageDimensions.contentSize}
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
                                        const width = (evt.nativeEvent?.width || 0) / PixelRatio.get();
                                        const height = (evt.nativeEvent?.height || 0) / PixelRatio.get();
                                        const contentSize = {width, height};

                                        const {scaleX, scaleY} = getCanvasFitScale({canvasSize, contentSize});

                                        if (
                                            imageDimensions?.contentSize?.width !== width ||
                                            imageDimensions?.contentSize?.height !== height ||
                                            imageDimensions?.contentScaling?.scaleX !== scaleX ||
                                            imageDimensions?.contentScaling?.scaleY !== scaleY
                                        ) {
                                            setImageDimensions({
                                                ...imageDimensions,
                                                contentSize,
                                                contentScaling: {
                                                    ...imageDimensions?.contentScaling,
                                                    scaleX,
                                                    scaleY,
                                                },
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
                            </MultiGestureCanvas>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback while ImageLightbox is loading the image */}
                    {isFallbackVisible && (
                        <MultiGestureCanvasContentWrapper>
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
                                    const width = evt.nativeEvent.width;
                                    const height = evt.nativeEvent.height;

                                    const {scaleX, scaleY} = getCanvasFitScale({canvasSize, contentSize: {width, height}});
                                    const minImageScale = Math.min(scaleX, scaleY);

                                    const scaledWidth = width * minImageScale;
                                    const scaledHeight = height * minImageScale;

                                    if (imageDimensions?.contentScaling?.scaledWidth !== scaledWidth || imageDimensions?.contentScaling?.scaledHeight !== scaledHeight) {
                                        setImageDimensions({
                                            ...imageDimensions,
                                            contentScaling: {
                                                ...imageDimensions?.contentScaling,
                                                scaledWidth,
                                                scaledHeight,
                                            },
                                        });
                                    }
                                }}
                                style={
                                    imageDimensions?.contentScaling == null
                                        ? undefined
                                        : {width: imageDimensions.contentScaling.scaledWidth, height: imageDimensions.contentScaling.scaledHeight}
                                }
                            />
                        </MultiGestureCanvasContentWrapper>
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

Lightbox.propTypes = propTypes;
Lightbox.defaultProps = defaultProps;
Lightbox.displayName = 'Lightbox';

export default Lightbox;
