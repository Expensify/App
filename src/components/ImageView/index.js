import React, {useState, useEffect, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Image from '../Image';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import FullscreenLoadingIndicator from '../FullscreenLoadingIndicator';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import CONST from '../../CONST';

const propTypes = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** Handles scale changed event in image zoom component. Used on native only */
    // eslint-disable-next-line react/no-unused-prop-types
    onScaleChanged: PropTypes.func.isRequired,

    /** URL to full-sized image */
    url: PropTypes.string.isRequired,

    /** image file name */
    fileName: PropTypes.string.isRequired,
};

const defaultProps = {
    isAuthTokenRequired: false,
};

function ImageView({isAuthTokenRequired, url, fileName}) {
    const [isLoading, setIsLoading] = useState(true);
    const [containerHeight, setContainerHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [initialScrollLeft, setInitialScrollLeft] = useState(0);
    const [initialScrollTop, setInitialScrollTop] = useState(0);
    const [initialX, setInitialX] = useState(0);
    const [initialY, setInitialY] = useState(0);
    const [imgWidth, setImgWidth] = useState(0);
    const [imgHeight, setImgHeight] = useState(0);
    const [zoomScale, setZoomScale] = useState(0);
    const [zoomDelta, setZoomDelta] = useState({offsetX: 0, offsetY: 0});

    const scrollableRef = useRef(null);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    /**
     * @param {Number} newContainerWidth
     * @param {Number} newContainerHeight
     * @param {Number} newImageWidth
     * @param {Number} newImageHeight
     */
    const setScale = (newContainerWidth, newContainerHeight, newImageWidth, newImageHeight) => {
        if (!newContainerWidth || !newImageWidth || !newContainerHeight || !newImageHeight) {
            return;
        }
        const newZoomScale = Math.min(newContainerWidth / newImageWidth, newContainerHeight / newImageHeight);
        setZoomScale(newZoomScale);
    };

    /**
     * @param {SyntheticEvent} e
     */
    const onContainerLayoutChanged = (e) => {
        const {width, height} = e.nativeEvent.layout;
        setScale(width, height, imgWidth, imgHeight);

        setContainerHeight(height);
        setContainerWidth(width);
    };

    /**
     * When open image, set image width, height.
     * @param {Number} imageWidth
     * @param {Number} imageHeight
     */
    const setImageRegion = (imageWidth, imageHeight) => {
        if (imageHeight <= 0) {
            return;
        }
        setScale(containerWidth, containerHeight, imageWidth, imageHeight);
        setImgWidth(imageWidth);
        setImgHeight(imageHeight);
    };

    const imageLoadingStart = () => {
        if (!isLoading) return;
        setIsLoading(true);
        setZoomScale(0);
        setIsZoomed(false);
    };

    const imageLoad = ({nativeEvent}) => {
        setImageRegion(nativeEvent.width, nativeEvent.height);
        setIsLoading(false);
    };

    /**
     * @param {SyntheticEvent} e
     */
    const onContainerPressIn = (e) => {
        const {pageX, pageY} = e.nativeEvent;
        setIsMouseDown(true);
        setInitialX(pageX);
        setInitialY(pageY);
        setInitialScrollLeft(scrollableRef.current.scrollLeft);
        setInitialScrollTop(scrollableRef.current.scrollTop);
    };

    /**
     * Convert touch point to zoomed point
     * @param {Boolean} x x point when click zoom
     * @param {Boolean} y y point when click zoom
     * @returns {Object} converted touch point
     */
    const getScrollOffset = (x, y) => {
        let offsetX;
        let offsetY;

        // Container size bigger than clicked position offset
        if (x <= containerWidth / 2) {
            offsetX = 0;
        } else if (x > containerWidth / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetX = x - containerWidth / 2;
        }
        if (y <= containerHeight / 2) {
            offsetY = 0;
        } else if (y > containerHeight / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetY = y - containerHeight / 2;
        }
        return {offsetX, offsetY};
    };

    /**
     * @param {SyntheticEvent} e
     */
    const onContainerPress = (e) => {
        if (!isZoomed && !isDragging) {
            const {offsetX, offsetY} = e.nativeEvent;
            // Dividing clicked positions by the zoom scale to get coordinates
            // so that once we zoom we will scroll to the clicked location.
            const delta = getScrollOffset(offsetX / zoomScale, offsetY / zoomScale);
            setZoomDelta(delta);
        }

        if (isZoomed && isDragging && isMouseDown) {
            setIsDragging(false);
            setIsMouseDown(false);
        } else {
            // We first zoom and once its done then we scroll to the location the user clicked.
            setIsZoomed(!isZoomed);
            setIsMouseDown(false);
        }
    };

    /**
     * @param {SyntheticEvent} e
     */
    const trackPointerPosition = useCallback(
        (e) => {
            // Whether the pointer is released inside the ImageView
            const isInsideImageView = scrollableRef.current.contains(e.nativeEvent.target);

            if (!isInsideImageView && isZoomed && isDragging && isMouseDown) {
                setIsDragging(false);
                setIsMouseDown(false);
            }
        },
        [isDragging, isMouseDown, isZoomed],
    );

    const trackMovement = useCallback(
        (e) => {
            if (!isZoomed) {
                return;
            }

            if (isDragging && isMouseDown) {
                const x = e.nativeEvent.x;
                const y = e.nativeEvent.y;
                const moveX = initialX - x;
                const moveY = initialY - y;
                scrollableRef.current.scrollLeft = initialScrollLeft + moveX;
                scrollableRef.current.scrollTop = initialScrollTop + moveY;
            }

            setIsDragging(isMouseDown);
        },
        [initialScrollLeft, initialScrollTop, initialX, initialY, isDragging, isMouseDown, isZoomed],
    );

    useEffect(() => {
        if (!isZoomed || !zoomDelta || !scrollableRef.current) {
            return;
        }
        scrollableRef.current.scrollLeft = zoomDelta.offsetX;
        scrollableRef.current.scrollTop = zoomDelta.offsetY;
    }, [zoomDelta, isZoomed]);

    useEffect(() => {
        if (canUseTouchScreen) {
            return;
        }
        document.addEventListener('mousemove', trackMovement);
        document.addEventListener('mouseup', trackPointerPosition);

        return () => {
            document.removeEventListener('mousemove', trackMovement);
            document.removeEventListener('mouseup', trackPointerPosition);
        };
    }, [canUseTouchScreen, trackMovement, trackPointerPosition]);

    if (canUseTouchScreen) {
        return (
            <View
                style={[styles.imageViewContainer, styles.overflowHidden]}
                onLayout={onContainerLayoutChanged}
            >
                <Image
                    source={{uri: url}}
                    isAuthTokenRequired={isAuthTokenRequired}
                    // Hide image until finished loading to prevent showing preview with wrong dimensions.
                    style={isLoading ? undefined : [styles.w100, styles.h100]}
                    // When Image dimensions are lower than the container boundary(zoomscale <= 1), use `contain` to render the image with natural dimensions.
                    // Both `center` and `contain` keeps the image centered on both x and y axis.
                    resizeMode={zoomScale > 1 ? Image.resizeMode.center : Image.resizeMode.contain}
                    onLoadStart={imageLoadingStart}
                    onLoad={imageLoad}
                />
                {isLoading && <FullscreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
            </View>
        );
    }
    return (
        <View
            ref={scrollableRef}
            onLayout={onContainerLayoutChanged}
            style={[styles.imageViewContainer, styles.overflowAuto, styles.pRelative]}
        >
            <PressableWithoutFeedback
                style={{
                    ...StyleUtils.getZoomSizingStyle(isZoomed, imgWidth, imgHeight, zoomScale, containerHeight, containerWidth, isLoading),
                    ...StyleUtils.getZoomCursorStyle(isZoomed, isDragging),
                    ...(isZoomed && zoomScale >= 1 ? styles.pRelative : styles.pAbsolute),
                    ...styles.flex1,
                }}
                onPressIn={onContainerPressIn}
                onPress={onContainerPress}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGE}
                accessibilityLabel={fileName}
            >
                <Image
                    source={{uri: url}}
                    isAuthTokenRequired={isAuthTokenRequired}
                    style={[styles.h100, styles.w100]}
                    resizeMode={Image.resizeMode.contain}
                    onLoadStart={imageLoadingStart}
                    onLoad={imageLoad}
                />
            </PressableWithoutFeedback>

            {isLoading && <FullscreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
        </View>
    );
}

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
