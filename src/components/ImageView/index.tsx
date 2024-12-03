import type {SyntheticEvent} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import AttachmentOfflineIndicator from '@components/AttachmentOfflineIndicator';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Image from '@components/Image';
import RESIZE_MODES from '@components/Image/resizeModes';
import type {ImageOnLoadEvent} from '@components/Image/types';
import Lightbox from '@components/Lightbox';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import viewRef from '@src/types/utils/viewRef';
import type ImageViewProps from './types';

type ZoomDelta = {offsetX: number; offsetY: number};

function ImageView({isAuthTokenRequired = false, url, fileName, onError}: ImageViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
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
    const [zoomDelta, setZoomDelta] = useState<ZoomDelta>();
    const {isOffline} = useNetwork();

    const scrollableRef = useRef<HTMLDivElement>(null);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const setScale = (newContainerWidth: number, newContainerHeight: number, newImageWidth: number, newImageHeight: number) => {
        if (!newContainerWidth || !newImageWidth || !newContainerHeight || !newImageHeight) {
            return;
        }
        const newZoomScale = Math.min(newContainerWidth / newImageWidth, newContainerHeight / newImageHeight);
        setZoomScale(newZoomScale);
    };

    const onContainerLayoutChanged = (e: LayoutChangeEvent) => {
        const {width, height} = e.nativeEvent.layout;
        setScale(width, height, imgWidth, imgHeight);

        setContainerHeight(height);
        setContainerWidth(width);
    };

    /**
     * When open image, set image width, height.
     */
    const setImageRegion = (imageWidth: number, imageHeight: number) => {
        if (imageHeight <= 0) {
            return;
        }
        setScale(containerWidth, containerHeight, imageWidth, imageHeight);
        setImgWidth(imageWidth);
        setImgHeight(imageHeight);
    };

    const imageLoadingStart = () => {
        if (!isLoading) {
            return;
        }
        setIsLoading(true);
        setZoomScale(0);
        setIsZoomed(false);
    };

    const imageLoad = ({nativeEvent}: ImageOnLoadEvent) => {
        setImageRegion(nativeEvent.width, nativeEvent.height);
        setIsLoading(false);
    };

    const onContainerPressIn = (e: GestureResponderEvent) => {
        const {pageX, pageY} = e.nativeEvent;
        setIsMouseDown(true);
        setInitialX(pageX);
        setInitialY(pageY);
        setInitialScrollLeft(scrollableRef.current?.scrollLeft ?? 0);
        setInitialScrollTop(scrollableRef.current?.scrollTop ?? 0);
    };

    /**
     * Convert touch point to zoomed point
     * @param x point when click zoom
     * @param y point when click zoom
     * @returns converted touch point
     */
    const getScrollOffset = (x: number, y: number) => {
        let offsetX = 0;
        let offsetY = 0;

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

    const onContainerPress = (e?: GestureResponderEvent | KeyboardEvent | SyntheticEvent<Element, PointerEvent>) => {
        if (!isZoomed && !isDragging) {
            if (e && 'nativeEvent' in e && e.nativeEvent instanceof PointerEvent) {
                const {offsetX, offsetY} = e.nativeEvent;

                // Dividing clicked positions by the zoom scale to get coordinates
                // so that once we zoom we will scroll to the clicked location.
                const delta = getScrollOffset(offsetX / zoomScale, offsetY / zoomScale);
                setZoomDelta(delta);
            } else {
                setZoomDelta({offsetX: 0, offsetY: 0});
            }
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

    const trackPointerPosition = useCallback(
        (event: MouseEvent) => {
            // Whether the pointer is released inside the ImageView
            const isInsideImageView = scrollableRef.current?.contains(event.target as Node);

            if (!isInsideImageView && isZoomed && isDragging && isMouseDown) {
                setIsDragging(false);
                setIsMouseDown(false);
            }
        },
        [isDragging, isMouseDown, isZoomed],
    );

    const trackMovement = useCallback(
        (event: MouseEvent) => {
            if (!isZoomed) {
                return;
            }

            if (isDragging && isMouseDown && scrollableRef.current) {
                const x = event.x;
                const y = event.y;
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

    const isLocalFile = FileUtils.isLocalFile(url);

    if (canUseTouchScreen) {
        return (
            <Lightbox
                uri={url}
                isAuthTokenRequired={isAuthTokenRequired}
                onError={onError}
            />
        );
    }
    return (
        <View
            ref={viewRef(scrollableRef)}
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
                role={CONST.ROLE.IMG}
                accessibilityLabel={fileName}
            >
                <Image
                    source={{uri: url}}
                    isAuthTokenRequired={isAuthTokenRequired}
                    style={[styles.h100, styles.w100]}
                    resizeMode={RESIZE_MODES.contain}
                    onLoadStart={imageLoadingStart}
                    onLoad={imageLoad}
                    onError={onError}
                />
            </PressableWithoutFeedback>

            {isLoading && (!isOffline || isLocalFile) && <FullscreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
            {isLoading && !isLocalFile && <AttachmentOfflineIndicator />}
        </View>
    );
}

ImageView.displayName = 'ImageView';

export default ImageView;
