/* eslint-disable es/no-optional-chaining */
import React, {useContext, useEffect, useState, useMemo} from 'react';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import Image from '../../../Image';
import AttachmentCarouselPagerContext from './AttachmentCarouselPagerContext';
import ImageTransformer from './ImageTransformer';
import ImageWrapper from './ImageWrapper';
import * as AttachmentsPropTypes from '../../propTypes';

function getCanvasFitScale({canvasWidth, canvasHeight, imageWidth, imageHeight}) {
    const scaleFactorX = canvasWidth / imageWidth;
    const scaleFactorY = canvasHeight / imageHeight;

    return scaleFactorY > scaleFactorX ? scaleFactorX : scaleFactorY;
}

const cachedDimensions = new Map();

const pagePropTypes = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized attachment or SVG function */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    isActive: PropTypes.bool.isRequired,
};

const defaultProps = {
    isAuthTokenRequired: false,
};

function AttachmentCarouselPage({source, isAuthTokenRequired, isActive: isActiveProp}) {
    const {canvasWidth, canvasHeight} = useContext(AttachmentCarouselPagerContext);

    const dimensions = cachedDimensions.get(source);

    const areImageDimensionsSet = dimensions?.imageWidth !== 0 && dimensions?.imageHeight !== 0;

    const [isImageLoading, setIsImageLoading] = useState(!areImageDimensionsSet);

    const [isActive, setIsActive] = useState(isActiveProp);
    // We delay setting a page to active state by a (few) millisecond(s),
    // to prevent the image transformer from flashing while still rendering
    // Instead, we show the fallback image while the image transformer is loading the image
    useEffect(() => {
        if (isActiveProp) setTimeout(() => setIsActive(true), 1);
        else setIsActive(false);
    }, [isActiveProp]);

    useMemo(() => {
        if (!isActiveProp) return;
        setIsImageLoading(true);
    }, [isActiveProp]);

    const [showFallback, setShowFallback] = useState(isImageLoading);
    // We delay hiding the fallback image while image transformer is still rendering
    useEffect(() => {
        if (isImageLoading) setShowFallback(true);
        else setTimeout(() => setShowFallback(false), 100);
    }, [isImageLoading]);

    return (
        <>
            {isActive && (
                <View style={StyleSheet.absoluteFill}>
                    <ImageTransformer
                        isActive
                        imageWidth={dimensions?.imageWidth}
                        imageHeight={dimensions?.imageHeight}
                        scaledImageWidth={dimensions?.scaledImageWidth}
                        scaledImageHeight={dimensions?.scaledImageHeight}
                        imageScale={dimensions?.imageScale}
                    >
                        <Image
                            source={{uri: source}}
                            style={dimensions == null ? {} : {width: dimensions.imageWidth, height: dimensions.imageHeight}}
                            isAuthTokenRequired={isAuthTokenRequired}
                            onLoad={(evt) => {
                                const imageWidth = (evt.nativeEvent?.width || 0) / PixelRatio.get();
                                const imageHeight = (evt.nativeEvent?.height || 0) / PixelRatio.get();

                                const imageScale = getCanvasFitScale({canvasWidth, canvasHeight, imageWidth, imageHeight});

                                // Don't update the dimensions if they are already set
                                if (dimensions?.imageWidth !== imageWidth || dimensions?.imageHeight !== imageHeight || dimensions?.imageScale !== imageScale) {
                                    cachedDimensions.set(source, {
                                        ...dimensions,
                                        imageWidth,
                                        imageHeight,
                                        imageScale,
                                    });
                                }

                                if (imageWidth === 0 || imageHeight === 0) return;
                                setIsImageLoading(false);
                            }}
                        />
                    </ImageTransformer>
                </View>
            )}

            {/* Keep rendering the image without gestures as fallback while ImageTransformer is loading the image */}
            {(!isActive || showFallback) && (
                <ImageWrapper>
                    <Image
                        source={{uri: source}}
                        isAuthTokenRequired={isAuthTokenRequired}
                        onLoad={(evt) => {
                            const imageWidth = evt.nativeEvent.width;
                            const imageHeight = evt.nativeEvent.height;

                            const scale = getCanvasFitScale({canvasWidth, canvasHeight, imageWidth, imageHeight});

                            const scaledImageWidth = imageWidth * scale;
                            const scaledImageHeight = imageHeight * scale;

                            // Don't update the dimensions if they are already set
                            if (dimensions?.scaledImageWidth === scaledImageWidth && dimensions?.scaledImageHeight === scaledImageHeight) return;

                            cachedDimensions.set(source, {
                                ...dimensions,
                                scaledImageWidth,
                                scaledImageHeight,
                            });
                        }}
                        style={dimensions == null ? undefined : {width: dimensions.scaledImageWidth, height: dimensions.scaledImageHeight}}
                    />
                </ImageWrapper>
            )}

            {/* Show activity indicator while ImageTransfomer is still loading the image. */}
            {isActive && isImageLoading && (
                <ActivityIndicator
                    size="large"
                    style={StyleSheet.absoluteFill}
                />
            )}
        </>
    );
}
AttachmentCarouselPage.propTypes = pagePropTypes;
AttachmentCarouselPage.defaultProps = defaultProps;

export default AttachmentCarouselPage;
