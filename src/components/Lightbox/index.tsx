import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import AttachmentOfflineIndicator from '@components/AttachmentOfflineIndicator';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import Image from '@components/Image';
import type {ImageOnLoadEvent} from '@components/Image/types';
import MultiGestureCanvas, {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';
import type {CanvasSize, ContentSize, OnScaleChangedCallback, ZoomRange} from '@components/MultiGestureCanvas/types';
import {getCanvasFitScale} from '@components/MultiGestureCanvas/utils';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import NUMBER_OF_CONCURRENT_LIGHTBOXES from './numberOfConcurrentLightboxes';

const cachedImageDimensions = new Map<string, ContentSize | undefined>();

type LightboxProps = {
    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** URI to full-sized attachment */
    uri: string;

    /** Triggers whenever the zoom scale changes */
    onScaleChanged?: OnScaleChangedCallback;

    /** Handles errors while displaying the image */
    onError?: () => void;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange?: Partial<ZoomRange>;
};

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
function Lightbox({isAuthTokenRequired = false, uri, onScaleChanged: onScaleChangedProp, onError, style, zoomRange = DEFAULT_ZOOM_RANGE}: LightboxProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    /**
     * React hooks must be used in the render function of the component at top-level and unconditionally.
     * Therefore, in order to provide a default value for "isPagerScrolling" if the "AttachmentCarouselPagerContext" is not available,
     * we need to create a shared value that can be used in the render function.
     */
    const isPagerScrollingFallback = useSharedValue(false);
    const {isOffline} = useNetwork();

    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const {
        isUsedInCarousel,
        isSingleCarouselItem,
        isPagerScrolling,
        page,
        activePage,
        onTap,
        onScaleChanged: onScaleChangedContext,
        onSwipeDown,
        pagerRef,
    } = useMemo(() => {
        if (attachmentCarouselPagerContext === null) {
            return {
                isUsedInCarousel: false,
                isSingleCarouselItem: true,
                isPagerScrolling: isPagerScrollingFallback,
                page: 0,
                activePage: 0,
                onTap: () => {},
                onScaleChanged: () => {},
                onSwipeDown: () => {},
                pagerRef: undefined,
            };
        }

        const foundPage = attachmentCarouselPagerContext.pagerItems.findIndex((item) => item.source === uri || item.previewSource === uri);
        return {
            ...attachmentCarouselPagerContext,
            isUsedInCarousel: !!attachmentCarouselPagerContext.pagerRef,
            isSingleCarouselItem: attachmentCarouselPagerContext.pagerItems.length === 1,
            page: foundPage,
        };
    }, [attachmentCarouselPagerContext, isPagerScrollingFallback, uri]);

    /** Whether the Lightbox is used within an attachment carousel and there are more than one page in the carousel */
    const hasSiblingCarouselItems = isUsedInCarousel && !isSingleCarouselItem;
    const isActive = page === activePage;

    const [canvasSize, setCanvasSize] = useState<CanvasSize>();
    const isCanvasLoading = canvasSize === undefined;
    const updateCanvasSize = useCallback(
        ({
            nativeEvent: {
                layout: {width, height},
            },
        }: LayoutChangeEvent) => setCanvasSize({width: PixelRatio.roundToNearestPixel(width), height: PixelRatio.roundToNearestPixel(height)}),
        [],
    );

    const [contentSize, setInternalContentSize] = useState<ContentSize | undefined>(() => cachedImageDimensions.get(uri));
    const setContentSize = useCallback(
        (newDimensions: ContentSize | undefined) => {
            setInternalContentSize(newDimensions);
            cachedImageDimensions.set(uri, newDimensions);
        },
        [uri],
    );
    const updateContentSize = useCallback(
        ({nativeEvent: {width, height}}: ImageOnLoadEvent) => {
            if (contentSize !== undefined) {
                return;
            }

            setContentSize({width, height});
        },
        [contentSize, setContentSize],
    );

    // Enables/disables the lightbox based on the number of concurrent lightboxes
    // On higher-end devices, we can show render lightboxes at the same time,
    // while on lower-end devices we want to only render the active carousel item as a lightbox
    // to avoid performance issues.
    const isLightboxVisible = useMemo(() => {
        if (!hasSiblingCarouselItems || NUMBER_OF_CONCURRENT_LIGHTBOXES === 'UNLIMITED') {
            return true;
        }

        const indexCanvasOffset = Math.floor((NUMBER_OF_CONCURRENT_LIGHTBOXES - 1) / 2) || 0;
        const indexOutOfRange = page > activePage + indexCanvasOffset || page < activePage - indexCanvasOffset;
        return !indexOutOfRange;
    }, [activePage, hasSiblingCarouselItems, page]);
    const [isLightboxImageLoaded, setLightboxImageLoaded] = useState(false);

    const [isFallbackVisible, setFallbackVisible] = useState(!isLightboxVisible);
    const [isFallbackImageLoaded, setFallbackImageLoaded] = useState(false);
    const fallbackSize = useMemo(() => {
        if (!hasSiblingCarouselItems || !contentSize || isCanvasLoading) {
            return undefined;
        }

        const {minScale} = getCanvasFitScale({canvasSize, contentSize});

        return {
            width: PixelRatio.roundToNearestPixel(contentSize.width * minScale),
            height: PixelRatio.roundToNearestPixel(contentSize.height * minScale),
        };
    }, [hasSiblingCarouselItems, contentSize, isCanvasLoading, canvasSize]);

    // If the fallback image is currently visible, we want to hide the Lightbox by setting the opacity to 0,
    // until the fallback gets hidden so that we don't see two overlapping images at the same time.
    // If there the Lightbox is not used within a carousel, we don't need to hide the Lightbox,
    // because it's only going to be rendered after the fallback image is hidden.
    const shouldShowLightbox = isLightboxImageLoaded && !isFallbackVisible;

    const isFallbackStillLoading = isFallbackVisible && !isFallbackImageLoaded;
    const isLightboxStillLoading = isLightboxVisible && !isLightboxImageLoaded;
    const isLoading = isActive && (isCanvasLoading || isFallbackStillLoading || isLightboxStillLoading);

    // Resets the lightbox when it becomes inactive
    useEffect(() => {
        if (isLightboxVisible) {
            return;
        }
        setLightboxImageLoaded(false);
        setContentSize(undefined);
    }, [isLightboxVisible, setContentSize]);

    // Enables and disables the fallback image when the carousel item is active or not
    useEffect(() => {
        // When there are no other carousel items, we don't need to show the fallback image
        if (!hasSiblingCarouselItems) {
            return;
        }

        // When the carousel item is active and the lightbox has finished loading, we want to hide the fallback image
        if (isActive && isFallbackVisible && isLightboxVisible && isLightboxImageLoaded) {
            setFallbackVisible(false);
            setFallbackImageLoaded(false);
            return;
        }

        // If the carousel item has become inactive and the lightbox is not continued to be rendered, we want to show the fallback image
        if (!isActive && !isLightboxVisible) {
            setFallbackVisible(true);
        }
    }, [hasSiblingCarouselItems, isActive, isFallbackVisible, isLightboxImageLoaded, isLightboxVisible]);

    const scaleChange = useCallback(
        (scale: number) => {
            onScaleChangedProp?.(scale);
            onScaleChangedContext?.(scale);
        },
        [onScaleChangedContext, onScaleChangedProp],
    );

    const isLocalFile = FileUtils.isLocalFile(uri);

    return (
        <View
            style={[StyleSheet.absoluteFill, style]}
            onLayout={updateCanvasSize}
        >
            {!isCanvasLoading && (
                <>
                    {isLightboxVisible && (
                        <View style={[StyleUtils.getFullscreenCenteredContentStyles(), StyleUtils.getOpacityStyle(Number(shouldShowLightbox))]}>
                            <MultiGestureCanvas
                                isActive={isActive}
                                canvasSize={canvasSize}
                                contentSize={contentSize}
                                zoomRange={zoomRange}
                                pagerRef={pagerRef}
                                shouldDisableTransformationGestures={isPagerScrolling}
                                onTap={onTap}
                                onScaleChanged={scaleChange}
                                onSwipeDown={onSwipeDown}
                            >
                                <Image
                                    source={{uri}}
                                    style={[contentSize ?? styles.invisibleImage]}
                                    isAuthTokenRequired={isAuthTokenRequired}
                                    onError={onError}
                                    onLoad={(e) => {
                                        updateContentSize(e);
                                        setLightboxImageLoaded(true);
                                    }}
                                />
                            </MultiGestureCanvas>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback if the carousel item is not active and while the lightbox is loading the image */}
                    {isFallbackVisible && (
                        <View style={StyleUtils.getFullscreenCenteredContentStyles()}>
                            <Image
                                source={{uri}}
                                resizeMode="contain"
                                style={[fallbackSize ?? styles.invisibleImage]}
                                isAuthTokenRequired={isAuthTokenRequired}
                                onLoad={(e) => {
                                    updateContentSize(e);
                                    setFallbackImageLoaded(true);
                                }}
                            />
                        </View>
                    )}

                    {/* Show activity indicator while the lightbox is still loading the image. */}
                    {isLoading && (!isOffline || isLocalFile) && (
                        <ActivityIndicator
                            size="large"
                            style={StyleSheet.absoluteFill}
                        />
                    )}
                    {isLoading && !isLocalFile && <AttachmentOfflineIndicator />}
                </>
            )}
        </View>
    );
}

Lightbox.displayName = 'Lightbox';

export default Lightbox;
