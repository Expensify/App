import AttachmentOfflineIndicator from '@components/AttachmentOfflineIndicator';
import Image from '@components/Image';
import RESIZE_MODES from '@components/Image/resizeModes';
import type {ImageOnLoadEvent} from '@components/Image/types';
import Lightbox from '@components/Lightbox';
import LoadingIndicator from '@components/LoadingIndicator';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useClickZoomPan from '@hooks/useClickZoomPan';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import {isLocalFile} from '@libs/fileDownload/FileUtils';

import CONST from '@src/CONST';
import type {Dimensions} from '@src/types/utils/Layout';

import type {LayoutChangeEvent} from 'react-native';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import type ImageViewProps from './types';

function calculateZoomScale(containerSize: Dimensions, imageSize: Dimensions) {
    if (!containerSize.width || !containerSize.height || !imageSize.width || !imageSize.height) {
        return 0;
    }

    return Math.min(containerSize.width / imageSize.width, containerSize.height / imageSize.height);
}

function ImageView({isAuthTokenRequired = false, url, fileName, onError}: ImageViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const scrollableRef = useRef<View & HTMLDivElement>(null);
    const canUseTouchScreen = canUseTouchScreenUtil();

    const [isLoading, setIsLoading] = useState(true);
    const [containerSize, setContainerSize] = useState<Dimensions>({width: 0, height: 0});
    const [imageSize, setImageSize] = useState<Dimensions>({width: 0, height: 0});

    const zoomScale = calculateZoomScale(containerSize, imageSize);

    // The image is displayed at `zoomScale` of its natural size, so a displayed point maps into
    // the zoomed (natural-size) render by the inverse of that scale.
    const {isZoomed, isDragging, onContainerPressIn, onContainerPress, resetZoom} = useClickZoomPan({
        scrollableRef,
        containerSize,
        zoomFactor: zoomScale > 0 ? 1 / zoomScale : 0,
    });

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
        resetZoom();
    };

    const imageLoad = ({nativeEvent: size}: ImageOnLoadEvent) => {
        setImageSize(size);
    };

    const imageLoadingEnd = () => {
        setIsLoading(false);
    };

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
                key={url}
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
                {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop. */}
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
                        resetZoom();
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
