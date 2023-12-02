/* eslint-disable es/no-optional-chaining */
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as AttachmentsPropTypes from './Attachments/propTypes';
import Image from './Image';
import MultiGestureCanvas, {getCanvasFitScale} from './MultiGestureCanvas';
import {zoomRangeDefaultProps, zoomRangePropTypes} from './MultiGestureCanvas/propTypes';

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

function Lightbox({isAuthTokenRequired, source, onScaleChanged, onPress, onError, style, isActive: isActiveProp, hasSiblingCarouselItems, zoomRange}) {
    const styles = useThemeStyles();
    const [isActive, setIsActive] = useState(isActiveProp);
    const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
    const imageDimensions = cachedDimensions.get(source);
    const setImageDimensions = (newDimensions) => cachedDimensions.set(source, newDimensions);

    const [isImageLoaded, setImageLoaded] = useState(false);
    const isCanvasLoading = canvasSize.width === 0 || canvasSize.height === 0;
    const isLoading = isActive && (isCanvasLoading || !isImageLoaded);
    const isInactiveCarouselItem = hasSiblingCarouselItems && !isActive;
    const [isFallbackVisible, setFallbackVisible] = useState(isInactiveCarouselItem);

    const updateCanvasSize = useCallback(
        ({nativeEvent}) => setCanvasSize({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)}),
        [],
    );

    // We delay setting a page to active state by a (few) millisecond(s),
    // to prevent the image transformer from flashing while still rendering
    // Instead, we show the fallback image while the image transformer is loading the image
    useEffect(() => {
        if (isActiveProp) {
            setTimeout(() => setIsActive(true), 1);
        } else {
            setIsActive(false);
        }
    }, [isActiveProp]);

    useEffect(() => {
        if (!hasSiblingCarouselItems) {
            return;
        }

        if (isActive) {
            if (isImageLoaded && isFallbackVisible) {
                // We delay hiding the fallback image while image transformer is still rendering
                setTimeout(() => {
                    setFallbackVisible(false);
                }, 100);
            }
        } else {
            // Show fallback when the image goes out of focus or when the image is loading
            setFallbackVisible(true);
        }
    }, [hasSiblingCarouselItems, isActive, isImageLoaded, isFallbackVisible]);

    const fallbackSize = useMemo(() => {
        if (!hasSiblingCarouselItems || (imageDimensions?.contentSize == null && imageDimensions?.fallbackSize == null) || canvasSize.width === 0 || canvasSize.height === 0) {
            return;
        }

        const imageSize = imageDimensions.contentSize || imageDimensions.fallbackSize;

        const {minScale} = getCanvasFitScale({canvasSize, contentSize: imageSize});

        return {
            width: PixelRatio.roundToNearestPixel(imageSize.width * minScale),
            height: PixelRatio.roundToNearestPixel(imageSize.height * minScale),
        };
    }, [canvasSize, hasSiblingCarouselItems, imageDimensions]);

    return (
        <View
            onPress={onPress}
            style={[StyleSheet.absoluteFill, style]}
            onLayout={updateCanvasSize}
        >
            {!isCanvasLoading && (
                <>
                    {isActive && (
                        <View style={[StyleSheet.absoluteFill, {opacity: hasSiblingCarouselItems && isFallbackVisible ? 0 : 1}]}>
                            <MultiGestureCanvas
                                isActive
                                onScaleChanged={onScaleChanged}
                                canvasSize={canvasSize}
                                contentSize={imageDimensions?.contentSize}
                                zoomRange={zoomRange}
                            >
                                <Image
                                    source={{uri: source}}
                                    style={imageDimensions?.contentSize == null ? undefined : imageDimensions.contentSize}
                                    isAuthTokenRequired={isAuthTokenRequired}
                                    onError={onError}
                                    onLoadEnd={() => setImageLoaded(true)}
                                    onLoad={(e) => {
                                        const width = (e.nativeEvent?.width || 0) / PixelRatio.get();
                                        const height = (e.nativeEvent?.height || 0) / PixelRatio.get();
                                        setImageDimensions({...imageDimensions, contentSize: {width, height}});
                                    }}
                                />
                            </MultiGestureCanvas>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback if the carousel item is not active and while the lightbox is loading the image */}
                    {isFallbackVisible && (
                        <View
                            collapsable={false}
                            style={StyleUtils.getFullscreenCenteredContentStyles(styles)}
                        >
                            <Image
                                source={{uri: source}}
                                resizeMode="contain"
                                style={fallbackSize}
                                isAuthTokenRequired={isAuthTokenRequired}
                                onLoad={(e) => {
                                    const width = e.nativeEvent?.width || 0;
                                    const height = e.nativeEvent?.height || 0;

                                    if (imageDimensions?.contentSize != null) {
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
