/* eslint-disable es/no-optional-chaining */
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as AttachmentsPropTypes from './Attachments/propTypes';
import Image from './Image';
import MultiGestureCanvas from './MultiGestureCanvas';
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

    /** Handles errors while displaying the image */
    onError: PropTypes.func,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** Whether the Lightbox is currently active on screen/in the carousel */
    isActive: PropTypes.bool,

    /** Whether the Lightbox is used within a carousel component and there are other sibling elements */
    hasSiblingCarouselItems: PropTypes.bool,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    ...zoomRangeDefaultProps,

    isAuthTokenRequired: false,
    isActive: true,
    hasSiblingCarouselItems: false,
    onPress: () => {},
    onError: () => {},
    style: {},
};

function Lightbox({isAuthTokenRequired, source, onScaleChanged, onPress, onError, style, isActive: initialIsActive, hasSiblingCarouselItems, zoomRange}) {
    const styles = useThemeStyles();
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

    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const isCanvasLoading = canvasSize.width === 0 || canvasSize.height === 0;
    const isLoading = isCanvasLoading || !isImageLoaded;

    const isInactiveCarouselItem = hasSiblingCarouselItems && !isActive;
    const [showFallback, setShowFallback] = useState(isInactiveCarouselItem);
    const isFallbackVisible = showFallback;

    useEffect(() => {
        if (!hasSiblingCarouselItems) {
            return;
        }

        if (isActive) {
            if (isImageLoaded && showFallback) {
                // We delay hiding the fallback image while image transformer is still rendering
                setTimeout(() => {
                    setShowFallback(false);
                }, 100);
            }
        } else {
            // Show fallback when the image goes out of focus or when the image is loading
            setShowFallback(true);
        }
    }, [hasSiblingCarouselItems, isActive, isImageLoaded, showFallback]);

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
                                    onError={onError}
                                    onLoadEnd={() => setIsImageLoaded(true)}
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
                                    }}
                                />
                            </MultiGestureCanvas>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback while the lightbox is loading the image or if the carousel item is not active */}
                    {isFallbackVisible && (
                        <View
                            collapsable={false}
                            style={StyleUtils.getFullscreenCenteredContentStyles(styles)}
                        >
                            <Image
                                source={{uri: source}}
                                isAuthTokenRequired={isAuthTokenRequired}
                                onError={onError}
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
