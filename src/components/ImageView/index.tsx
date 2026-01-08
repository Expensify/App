import type {SyntheticEvent} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import AttachmentOfflineIndicator from '@components/AttachmentOfflineIndicator';
import Image from '@components/Image';
import RESIZE_MODES from '@components/Image/resizeModes';
import type {ImageOnLoadEvent} from '@components/Image/types';
import Lightbox from '@components/Lightbox';
import LoadingIndicator from '@components/LoadingIndicator';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type {Dimensions} from '@src/types/utils/Layout';
import type ImageViewProps from './types';

function calculateZoomScale(containerSize: Dimensions, imageSize: Dimensions) {
    if (!containerSize.width || !containerSize.height || !imageSize.width || !imageSize.height) {
        return 0;
    }

    return Math.min(containerSize.width / imageSize.width, containerSize.height / imageSize.height);
}

type ZoomDelta = {offsetX: number; offsetY: number};

function ImageView({isAuthTokenRequired = false, url, fileName, onError}: ImageViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const scrollableRef = useRef<View & HTMLDivElement>(null);
    const canUseTouchScreen = canUseTouchScreenUtil();

    const [isLoading, setIsLoading] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [initialScrollLeft, setInitialScrollLeft] = useState(0);
    const [initialScrollTop, setInitialScrollTop] = useState(0);
    const [initialX, setInitialX] = useState(0);
    const [initialY, setInitialY] = useState(0);

    const [containerSize, setContainerSize] = useState<Dimensions>({width: 0, height: 0});
    const [imageSize, setImageSize] = useState<Dimensions>({width: 0, height: 0});

    const [zoomDelta, setZoomDelta] = useState<ZoomDelta>();
    const zoomScale = calculateZoomScale(containerSize, imageSize);

    const onContainerLayoutChanged = (e: LayoutChangeEvent) => {
        setContainerSize(e.nativeEvent.layout);
    };

    const isImageLoaded = imageSize.width > 0 && imageSize.height > 0;
    const imageLoadingStart = () => {
        if (isImageLoaded) {
            return;
        }

        setImageSize({width: 0, height: 0});
        setIsLoading(true);
        setIsZoomed(false);
    };

    const imageLoad = ({nativeEvent: size}: ImageOnLoadEvent) => {
        setImageSize(size);
    };

    const imageLoadingEnd = () => {
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
        if (x <= containerSize.width / 2) {
            offsetX = 0;
        } else if (x > containerSize.width / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetX = x - containerSize.width / 2;
        }
        if (y <= containerSize.height / 2) {
            offsetY = 0;
        } else if (y > containerSize.height / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetY = y - containerSize.height / 2;
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

    // isLocalToUserDeviceFile means the file is located on the user device,
    // not loaded on the server yet (the user is offline when loading this file in fact)
    let isLocalToUserDeviceFile = isLocalFile(url);
    if (isLocalToUserDeviceFile && typeof url === 'string' && url.startsWith('/chat-attachments')) {
        isLocalToUserDeviceFile = false;
    }

    const shouldShowOfflineIndicator = isOffline && !isLoading && !isLocalToUserDeviceFile;
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
            ref={scrollableRef}
            onLayout={onContainerLayoutChanged}
            style={[styles.imageViewContainer, styles.overflowAuto, styles.pRelative]}
        >
            <PressableWithoutFeedback
                style={{
                    ...StyleUtils.getZoomSizingStyle({imageSize, containerSize, isZoomed, zoomScale, isLoading: !isImageLoaded}),
                    ...StyleUtils.getZoomCursorStyle(isZoomed, isDragging),
                    ...(isZoomed && zoomScale >= 1 ? styles.pRelative : styles.pAbsolute),
                    ...styles.flex1,
                }}
                onPressIn={onContainerPressIn}
                onPress={onContainerPress}
                role={CONST.ROLE.IMG}
                accessibilityLabel={fileName}
                sentryLabel={CONST.SENTRY_LABEL.ATTACHMENT_MODAL.IMAGE_ZOOM}
            >
                <Image
                    source={{uri: url}}
                    isAuthTokenRequired={isAuthTokenRequired}
                    style={[styles.h100, styles.w100]}
                    resizeMode={RESIZE_MODES.contain}
                    onLoadStart={imageLoadingStart}
                    onLoad={imageLoad}
                    onLoadEnd={imageLoadingEnd}
                    waitForSession={() => {
                        setImageSize({width: 0, height: 0});
                        setIsLoading(true);
                        setIsZoomed(false);
                    }}
                    onError={onError}
                />
            </PressableWithoutFeedback>

            {!isImageLoaded && !shouldShowOfflineIndicator && <LoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
            {!isImageLoaded && shouldShowOfflineIndicator && <AttachmentOfflineIndicator />}
        </View>
    );
}

export default ImageView;
