import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {PanResponder, View} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import _ from 'underscore';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Image from '@components/Image';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized image */
    url: PropTypes.string.isRequired,

    /** Handles scale changed event in image zoom component. Used on native only */
    onScaleChanged: PropTypes.func.isRequired,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    isAuthTokenRequired: false,
    onPress: () => {},
    style: {},
};

// Use the default double click interval from the ImageZoom library
// https://github.com/ascoders/react-native-image-zoom/blob/master/src/image-zoom/image-zoom.type.ts#L79
const DOUBLE_CLICK_INTERVAL = 175;

function ImageView({isAuthTokenRequired, url, onScaleChanged, onPress, style}) {
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();

    const [isLoading, setIsLoading] = useState(true);
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
    });
    const [containerHeight, setContainerHeight] = useState(null);

    const imageZoomScale = useRef(1);
    const lastClickTime = useRef(0);
    const numberOfTouches = useRef(0);
    const zoom = useRef(null);

    /**
     * Updates the amount of active touches on the PanResponder on our ImageZoom overlay View
     *
     * @param {Event} e
     * @param {GestureState} gestureState
     * @returns {Boolean}
     */
    const updatePanResponderTouches = (e, gestureState) => {
        if (_.isNumber(gestureState.numberActiveTouches)) {
            numberOfTouches.current = gestureState.numberActiveTouches;
        }

        // We don't need to set the panResponder since all we care about is checking the gestureState, so return false
        return false;
    };

    // PanResponder used to capture how many touches are active on the attachment image
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: updatePanResponderTouches,
        }),
    ).current;

    /**
     * When the url changes and the image must load again,
     * this resets the zoom to ensure the next image loads with the correct dimensions.
     */
    const resetImageZoom = () => {
        if (imageZoomScale.current !== 1) {
            imageZoomScale.current = 1;
        }

        if (zoom.current) {
            zoom.current.centerOn({
                x: 0,
                y: 0,
                scale: 1,
                duration: 0,
            });
        }
    };

    const imageLoadingStart = () => {
        if (isLoading) {
            return;
        }

        resetImageZoom();
        setImageDimensions({
            width: 0,
            height: 0,
        });
        setIsLoading(true);
    };

    useEffect(() => {
        imageLoadingStart();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this effect only needs to run when the url changes
    }, [url]);

    /**
     * The `ImageZoom` component requires image dimensions which
     * are calculated here from the natural image dimensions produced by
     * the `onLoad` event
     *
     * @param {Object} nativeEvent
     */
    const configureImageZoom = ({nativeEvent}) => {
        let imageZoomWidth = nativeEvent.width;
        let imageZoomHeight = nativeEvent.height;
        const roundedContainerWidth = Math.round(windowWidth);
        const roundedContainerHeight = Math.round(containerHeight || windowHeight);

        const aspectRatio = Math.min(roundedContainerHeight / imageZoomHeight, roundedContainerWidth / imageZoomWidth);

        imageZoomHeight *= aspectRatio;
        imageZoomWidth *= aspectRatio;

        // Resize the image to max dimensions possible on the Native platforms to prevent crashes on Android. To keep the same behavior, apply to IOS as well.
        const maxDimensionsScale = 11;
        imageZoomWidth = Math.min(imageZoomWidth, roundedContainerWidth * maxDimensionsScale);
        imageZoomHeight = Math.min(imageZoomHeight, roundedContainerHeight * maxDimensionsScale);

        setImageDimensions({
            height: imageZoomHeight,
            width: imageZoomWidth,
        });
        setIsLoading(false);
    };

    const configurePanResponder = () => {
        const currentTimestamp = new Date().getTime();
        const isDoubleClick = currentTimestamp - lastClickTime.current <= DOUBLE_CLICK_INTERVAL;
        lastClickTime.current = currentTimestamp;

        // Let ImageZoom handle the event if the tap is more than one touchPoint or if we are zoomed in
        if (numberOfTouches.current === 2 || imageZoomScale.current !== 1) {
            return true;
        }

        // When we have a double click and the zoom scale is 1 then programmatically zoom the image
        // but let the tap fall through to the parent so we can register a swipe down to dismiss
        if (isDoubleClick) {
            zoom.current.centerOn({
                x: 0,
                y: 0,
                scale: 2,
                duration: 100,
            });

            // onMove will be called after the zoom animation.
            // So it's possible to zoom and swipe and stuck in between the images.
            // Sending scale just when we actually trigger the animation makes this nearly impossible.
            // you should be really fast to catch in between state updates.
            // And this lucky case will be fixed by migration to UI thread only code
            // with gesture handler and reanimated.
            onScaleChanged(2);
        }

        // We must be either swiping down or double tapping since we are at zoom scale 1
        return false;
    };

    // Default windowHeight accounts for the modal header height
    const calculatedWindowHeight = windowHeight - variables.contentHeaderHeight;
    const hasImageDimensions = imageDimensions.width !== 0 && imageDimensions.height !== 0;
    const shouldShowLoadingIndicator = isLoading || !hasImageDimensions;

    // Zoom view should be loaded only after measuring actual image dimensions, otherwise it causes blurred images on Android
    return (
        <View
            style={[styles.w100, styles.h100, styles.alignItemsCenter, styles.justifyContentCenter, styles.overflowHidden]}
            onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                setContainerHeight(layout.height);
            }}
        >
            {Boolean(containerHeight) && (
                <ImageZoom
                    ref={zoom}
                    onClick={onPress}
                    cropWidth={windowWidth}
                    cropHeight={calculatedWindowHeight}
                    imageWidth={imageDimensions.width}
                    imageHeight={imageDimensions.height}
                    onStartShouldSetPanResponder={configurePanResponder}
                    onMove={({scale}) => {
                        onScaleChanged(scale);
                        imageZoomScale.current = scale;
                    }}
                >
                    <Image
                        style={[
                            styles.w100,
                            styles.h100,
                            style,

                            // Hide image while loading so ImageZoom can get the image
                            // size before presenting - preventing visual glitches or shift
                            // due to ImageZoom
                            shouldShowLoadingIndicator ? styles.opacity0 : styles.opacity1,
                        ]}
                        source={{uri: url}}
                        isAuthTokenRequired={isAuthTokenRequired}
                        resizeMode={Image.resizeMode.contain}
                        onLoadStart={imageLoadingStart}
                        onLoad={configureImageZoom}
                    />

                    {/**
            Create an invisible view on top of the image so we can capture and set the amount of touches before
           the ImageZoom's PanResponder does. Children will be triggered first, so this needs to be inside the
           ImageZoom to work
           */}
                    <View
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        {...panResponder.panHandlers}
                        style={[styles.w100, styles.h100, styles.invisible]}
                    />
                </ImageZoom>
            )}
            {shouldShowLoadingIndicator && <FullscreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
        </View>
    );
}

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
