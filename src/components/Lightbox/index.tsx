import React, {useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {PixelRatio, StyleSheet, View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentOfflineIndicator from '@components/AttachmentOfflineIndicator';
import {useAttachmentCarouselPagerActions, useAttachmentCarouselPagerState} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {Attachment} from '@components/Attachments/types';
import Image from '@components/Image';
import type {ImageOnLoadEvent} from '@components/Image/types';
import MultiGestureCanvas, {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';
import type {OnScaleChangedCallback, ZoomRange} from '@components/MultiGestureCanvas/types';
import {getCanvasFitScale} from '@components/MultiGestureCanvas/utils';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import type {Dimensions} from '@src/types/utils/Layout';
import NUMBER_OF_CONCURRENT_LIGHTBOXES from './numberOfConcurrentLightboxes';

const FALLBACK_OFFSET = 2;

const cachedImageDimensions = new Map<string, Dimensions | undefined>();

function getImagePriority(isActive: boolean, isLightboxVisible: boolean) {
    if (isActive) {
        return CONST.IMAGE_LOADING_PRIORITY.HIGH;
    }
    if (isLightboxVisible) {
        return CONST.IMAGE_LOADING_PRIORITY.NORMAL;
    }
    return CONST.IMAGE_LOADING_PRIORITY.LOW;
}

type LightboxProps = Pick<Attachment, 'attachmentID'> & {
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
function Lightbox({attachmentID, isAuthTokenRequired = false, uri, onScaleChanged: onScaleChangedProp, onError, style, zoomRange = DEFAULT_ZOOM_RANGE}: LightboxProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    /**
     * React hooks must be used in the render function of the component at top-level and unconditionally.
     * Therefore, in order to provide a default value for "isPagerScrolling" if the "AttachmentCarouselPagerContext" is not available,
     * we need to create a shared value that can be used in the render function.
     */
    const isPagerScrollingFallback = useSharedValue(false);
    const isScrollingEnabledFallback = useSharedValue(false);
    const {isOffline} = useNetwork();

    const state = useAttachmentCarouselPagerState();
    const actions = useAttachmentCarouselPagerActions();
    let carouselContext;
    if (state === null || actions === null) {
        carouselContext = {
            isUsedInCarousel: false,
            isSingleCarouselItem: true,
            isPagerScrolling: isPagerScrollingFallback,
            isScrollEnabled: isScrollingEnabledFallback,
            page: 0,
            activePage: 0,
            onTap: () => {},
            onScaleChanged: () => {},
            onSwipeDown: () => {},
            pagerRef: undefined,
            externalGestureHandler: undefined,
        };
    } else {
        const identifier = attachmentID ?? uri;
        const foundPage = state.pagerItems.findIndex((item) => (item.attachmentID ?? item.source) === identifier);
        carouselContext = {
            ...state,
            ...actions,
            isUsedInCarousel: !!state.pagerRef,
            isSingleCarouselItem: state.pagerItems.length === 1,
            page: foundPage === -1 ? 0 : foundPage,
        };
    }
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
        isScrollEnabled,
        externalGestureHandler,
    } = carouselContext;

    /** Whether the Lightbox is used within an attachment carousel and there are more than one page in the carousel */
    const hasSiblingCarouselItems = isUsedInCarousel && !isSingleCarouselItem;
    const isActive = page === activePage;

    const [canvasSize, setCanvasSize] = useState<Dimensions>();
    const isCanvasLoading = canvasSize === undefined;
    const updateCanvasSize = ({
        nativeEvent: {
            layout: {width, height},
        },
    }: LayoutChangeEvent) => setCanvasSize({width: PixelRatio.roundToNearestPixel(width), height: PixelRatio.roundToNearestPixel(height)});

    const [contentSize, setInternalContentSize] = useState<Dimensions | undefined>(() => cachedImageDimensions.get(uri));
    const setContentSize = (newDimensions: Dimensions | undefined) => {
        setInternalContentSize(newDimensions);
        cachedImageDimensions.set(uri, newDimensions);
    };
    const updateContentSize = ({nativeEvent: {width, height}}: ImageOnLoadEvent) => {
        if (contentSize !== undefined) {
            return;
        }

        setContentSize({width, height});
    };

    const indexCanvasOffset = Math.floor((NUMBER_OF_CONCURRENT_LIGHTBOXES - 1) / 2) || 0;
    const isPageInRange = page >= activePage - indexCanvasOffset && page <= activePage + indexCanvasOffset;
    const isLightboxVisible = !hasSiblingCarouselItems || isPageInRange;

    const isFallbackInRange = !hasSiblingCarouselItems || Math.abs(page - activePage) <= FALLBACK_OFFSET;

    const [isLightboxImageLoaded, setLightboxImageLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isFallbackVisible = !hasSiblingCarouselItems ? !isLightboxVisible : !(isActive && isLightboxVisible && isLightboxImageLoaded);
    const [isFallbackImageLoaded, setFallbackImageLoaded] = useState(false);

    let fallbackSize: Dimensions | undefined;
    if (!hasSiblingCarouselItems || !contentSize || isCanvasLoading) {
        fallbackSize = undefined;
    } else {
        const {minScale} = getCanvasFitScale({canvasSize, contentSize});
        fallbackSize = {
            width: PixelRatio.roundToNearestPixel(contentSize.width * minScale),
            height: PixelRatio.roundToNearestPixel(contentSize.height * minScale),
        };
    }

    // If the fallback image is currently visible, we want to hide the Lightbox by setting the opacity to 0,
    // until the fallback gets hidden so that we don't see two overlapping images at the same time.
    // If there the Lightbox is not used within a carousel, we don't need to hide the Lightbox,
    // because it's only going to be rendered after the fallback image is hidden.
    const shouldShowLightbox = isLightboxImageLoaded && !isFallbackVisible;

    const isFallbackStillLoading = isFallbackVisible && !isFallbackImageLoaded;
    const isLightboxStillLoading = isLightboxVisible && !isLightboxImageLoaded;
    const isImageLoaded = !(isActive && (isCanvasLoading || isFallbackStillLoading || isLightboxStillLoading));

    const [prevLightboxVisible, setPrevLightboxVisible] = useState(isLightboxVisible);
    if (prevLightboxVisible !== isLightboxVisible) {
        setPrevLightboxVisible(isLightboxVisible);
        if (!isLightboxVisible) {
            setLightboxImageLoaded(false);
            setInternalContentSize(undefined);
            cachedImageDimensions.set(uri, undefined);
        }
    }

    // Reset isFallbackImageLoaded when fallback becomes invisible (so it's false when we show fallback again)
    const [prevFallbackVisible, setPrevFallbackVisible] = useState(isFallbackVisible);
    if (prevFallbackVisible !== isFallbackVisible) {
        setPrevFallbackVisible(isFallbackVisible);
        if (!isFallbackVisible) {
            setFallbackImageLoaded(false);
        }
    }

    const scaleChange = (scale: number) => {
        onScaleChangedProp?.(scale);
        onScaleChangedContext?.(scale);
    };

    const imagePriority = getImagePriority(isActive, isLightboxVisible);

    const isALocalFile = isLocalFile(uri);
    const shouldShowOfflineIndicator = isOffline && !isLoading && !isALocalFile;

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'Lightbox',
        isImageLoaded,
        isLoadingPreviousUri: false,
        isOffline,
        isLoading,
        isALocalFile,
    };

    return (
        <View
            testID="lightbox-wrapper"
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
                                isUsedInCarousel={isUsedInCarousel}
                                shouldDisableTransformationGestures={isPagerScrolling}
                                isPagerScrollEnabled={isScrollEnabled}
                                onTap={onTap}
                                onScaleChanged={scaleChange}
                                onSwipeDown={onSwipeDown}
                                externalGestureHandler={externalGestureHandler}
                            >
                                <Image
                                    source={{uri}}
                                    style={[contentSize ?? styles.invisibleImage]}
                                    isAuthTokenRequired={isAuthTokenRequired}
                                    priority={imagePriority}
                                    onError={onError}
                                    onLoad={(e) => {
                                        updateContentSize(e);
                                        setLightboxImageLoaded(true);
                                    }}
                                    waitForSession={() => {
                                        // only active lightbox should call this function
                                        if (!isActive || isFallbackVisible || !isLightboxVisible) {
                                            return;
                                        }
                                        setContentSize(cachedImageDimensions.get(uri));
                                        setLightboxImageLoaded(false);
                                    }}
                                    onLoadEnd={() => {
                                        setIsLoading(false);
                                    }}
                                />
                            </MultiGestureCanvas>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback if the carousel item is not active and while the lightbox is loading the image */}
                    {isFallbackVisible && isFallbackInRange && (
                        <View style={StyleUtils.getFullscreenCenteredContentStyles()}>
                            <Image
                                source={{uri}}
                                resizeMode="contain"
                                style={[fallbackSize ?? styles.invisibleImage]}
                                isAuthTokenRequired={isAuthTokenRequired}
                                priority={imagePriority}
                                onLoad={(e) => {
                                    updateContentSize(e);
                                    setFallbackImageLoaded(true);
                                }}
                            />
                        </View>
                    )}

                    {/* Show activity indicator while the lightbox is still loading the image. */}
                    {!isImageLoaded && !shouldShowOfflineIndicator && (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={StyleSheet.absoluteFill}
                            reasonAttributes={reasonAttributes}
                        />
                    )}
                    {!isImageLoaded && shouldShowOfflineIndicator && <AttachmentOfflineIndicator />}
                </>
            )}
        </View>
    );
}

export default Lightbox;
