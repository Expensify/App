"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var AttachmentOfflineIndicator_1 = require("@components/AttachmentOfflineIndicator");
var AttachmentCarouselPagerContext_1 = require("@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext");
var Image_1 = require("@components/Image");
var MultiGestureCanvas_1 = require("@components/MultiGestureCanvas");
var utils_1 = require("@components/MultiGestureCanvas/utils");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var numberOfConcurrentLightboxes_1 = require("./numberOfConcurrentLightboxes");
var cachedImageDimensions = new Map();
/**
 * On the native layer, we use a image library to handle zoom functionality
 */
function Lightbox(_a) {
    var _b = _a.isAuthTokenRequired, isAuthTokenRequired = _b === void 0 ? false : _b, uri = _a.uri, onScaleChangedProp = _a.onScaleChanged, onError = _a.onError, style = _a.style, _c = _a.zoomRange, zoomRange = _c === void 0 ? MultiGestureCanvas_1.DEFAULT_ZOOM_RANGE : _c;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    /**
     * React hooks must be used in the render function of the component at top-level and unconditionally.
     * Therefore, in order to provide a default value for "isPagerScrolling" if the "AttachmentCarouselPagerContext" is not available,
     * we need to create a shared value that can be used in the render function.
     */
    var isPagerScrollingFallback = (0, react_native_reanimated_1.useSharedValue)(false);
    var isScrollingEnabledFallback = (0, react_native_reanimated_1.useSharedValue)(false);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var attachmentCarouselPagerContext = (0, react_1.useContext)(AttachmentCarouselPagerContext_1.default);
    var _d = (0, react_1.useMemo)(function () {
        if (attachmentCarouselPagerContext === null) {
            return {
                isUsedInCarousel: false,
                isSingleCarouselItem: true,
                isPagerScrolling: isPagerScrollingFallback,
                isScrollEnabled: isScrollingEnabledFallback,
                page: 0,
                activePage: 0,
                onTap: function () { },
                onScaleChanged: function () { },
                onSwipeDown: function () { },
                pagerRef: undefined,
                externalGestureHandler: undefined,
            };
        }
        var foundPage = attachmentCarouselPagerContext.pagerItems.findIndex(function (item) { return item.source === uri || item.previewSource === uri; });
        return __assign(__assign({}, attachmentCarouselPagerContext), { isUsedInCarousel: !!attachmentCarouselPagerContext.pagerRef, isSingleCarouselItem: attachmentCarouselPagerContext.pagerItems.length === 1, page: foundPage });
    }, [attachmentCarouselPagerContext, isPagerScrollingFallback, isScrollingEnabledFallback, uri]), isUsedInCarousel = _d.isUsedInCarousel, isSingleCarouselItem = _d.isSingleCarouselItem, isPagerScrolling = _d.isPagerScrolling, page = _d.page, activePage = _d.activePage, onTap = _d.onTap, onScaleChangedContext = _d.onScaleChanged, onSwipeDown = _d.onSwipeDown, pagerRef = _d.pagerRef, isScrollEnabled = _d.isScrollEnabled, externalGestureHandler = _d.externalGestureHandler;
    /** Whether the Lightbox is used within an attachment carousel and there are more than one page in the carousel */
    var hasSiblingCarouselItems = isUsedInCarousel && !isSingleCarouselItem;
    var isActive = page === activePage;
    var _e = (0, react_1.useState)(), canvasSize = _e[0], setCanvasSize = _e[1];
    var isCanvasLoading = canvasSize === undefined;
    var updateCanvasSize = (0, react_1.useCallback)(function (_a) {
        var _b = _a.nativeEvent.layout, width = _b.width, height = _b.height;
        return setCanvasSize({ width: react_native_1.PixelRatio.roundToNearestPixel(width), height: react_native_1.PixelRatio.roundToNearestPixel(height) });
    }, []);
    var _f = (0, react_1.useState)(function () { return cachedImageDimensions.get(uri); }), contentSize = _f[0], setInternalContentSize = _f[1];
    var setContentSize = (0, react_1.useCallback)(function (newDimensions) {
        setInternalContentSize(newDimensions);
        cachedImageDimensions.set(uri, newDimensions);
    }, [uri]);
    var updateContentSize = (0, react_1.useCallback)(function (_a) {
        var _b = _a.nativeEvent, width = _b.width, height = _b.height;
        if (contentSize !== undefined) {
            return;
        }
        setContentSize({ width: width, height: height });
    }, [contentSize, setContentSize]);
    // Enables/disables the lightbox based on the number of concurrent lightboxes
    // On higher-end devices, we can show render lightboxes at the same time,
    // while on lower-end devices we want to only render the active carousel item as a lightbox
    // to avoid performance issues.
    var isLightboxVisible = (0, react_1.useMemo)(function () {
        if (!hasSiblingCarouselItems || numberOfConcurrentLightboxes_1.default === 'UNLIMITED') {
            return true;
        }
        var indexCanvasOffset = Math.floor((numberOfConcurrentLightboxes_1.default - 1) / 2) || 0;
        var indexOutOfRange = page > activePage + indexCanvasOffset || page < activePage - indexCanvasOffset;
        return !indexOutOfRange;
    }, [activePage, hasSiblingCarouselItems, page]);
    var _g = (0, react_1.useState)(false), isLightboxImageLoaded = _g[0], setLightboxImageLoaded = _g[1];
    var _h = (0, react_1.useState)(!isLightboxVisible), isFallbackVisible = _h[0], setFallbackVisible = _h[1];
    var _j = (0, react_1.useState)(false), isFallbackImageLoaded = _j[0], setFallbackImageLoaded = _j[1];
    var fallbackSize = (0, react_1.useMemo)(function () {
        if (!hasSiblingCarouselItems || !contentSize || isCanvasLoading) {
            return undefined;
        }
        var minScale = (0, utils_1.getCanvasFitScale)({ canvasSize: canvasSize, contentSize: contentSize }).minScale;
        return {
            width: react_native_1.PixelRatio.roundToNearestPixel(contentSize.width * minScale),
            height: react_native_1.PixelRatio.roundToNearestPixel(contentSize.height * minScale),
        };
    }, [hasSiblingCarouselItems, contentSize, isCanvasLoading, canvasSize]);
    // If the fallback image is currently visible, we want to hide the Lightbox by setting the opacity to 0,
    // until the fallback gets hidden so that we don't see two overlapping images at the same time.
    // If there the Lightbox is not used within a carousel, we don't need to hide the Lightbox,
    // because it's only going to be rendered after the fallback image is hidden.
    var shouldShowLightbox = isLightboxImageLoaded && !isFallbackVisible;
    var isFallbackStillLoading = isFallbackVisible && !isFallbackImageLoaded;
    var isLightboxStillLoading = isLightboxVisible && !isLightboxImageLoaded;
    var isLoading = isActive && (isCanvasLoading || isFallbackStillLoading || isLightboxStillLoading);
    // Resets the lightbox when it becomes inactive
    (0, react_1.useEffect)(function () {
        if (isLightboxVisible) {
            return;
        }
        setLightboxImageLoaded(false);
        setContentSize(undefined);
    }, [isLightboxVisible, setContentSize]);
    // Enables and disables the fallback image when the carousel item is active or not
    (0, react_1.useEffect)(function () {
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
    var scaleChange = (0, react_1.useCallback)(function (scale) {
        onScaleChangedProp === null || onScaleChangedProp === void 0 ? void 0 : onScaleChangedProp(scale);
        onScaleChangedContext === null || onScaleChangedContext === void 0 ? void 0 : onScaleChangedContext(scale);
    }, [onScaleChangedContext, onScaleChangedProp]);
    var isALocalFile = (0, FileUtils_1.isLocalFile)(uri);
    return (<react_native_1.View style={[react_native_1.StyleSheet.absoluteFill, style]} onLayout={updateCanvasSize}>
            {!isCanvasLoading && (<>
                    {isLightboxVisible && (<react_native_1.View style={[StyleUtils.getFullscreenCenteredContentStyles(), StyleUtils.getOpacityStyle(Number(shouldShowLightbox))]}>
                            <MultiGestureCanvas_1.default isActive={isActive} canvasSize={canvasSize} contentSize={contentSize} zoomRange={zoomRange} pagerRef={pagerRef} isUsedInCarousel={isUsedInCarousel} shouldDisableTransformationGestures={isPagerScrolling} isPagerScrollEnabled={isScrollEnabled} onTap={onTap} onScaleChanged={scaleChange} onSwipeDown={onSwipeDown} externalGestureHandler={externalGestureHandler}>
                                <Image_1.default source={{ uri: uri }} style={[contentSize !== null && contentSize !== void 0 ? contentSize : styles.invisibleImage]} isAuthTokenRequired={isAuthTokenRequired} onError={onError} onLoad={function (e) {
                    updateContentSize(e);
                    setLightboxImageLoaded(true);
                }} waitForSession={function () {
                    // only active lightbox should call this function
                    if (!isActive || isFallbackVisible || !isLightboxVisible) {
                        return;
                    }
                    setContentSize(cachedImageDimensions.get(uri));
                    setLightboxImageLoaded(false);
                }}/>
                            </MultiGestureCanvas_1.default>
                        </react_native_1.View>)}

                    {/* Keep rendering the image without gestures as fallback if the carousel item is not active and while the lightbox is loading the image */}
                    {isFallbackVisible && (<react_native_1.View style={StyleUtils.getFullscreenCenteredContentStyles()}>
                            <Image_1.default source={{ uri: uri }} resizeMode="contain" style={[fallbackSize !== null && fallbackSize !== void 0 ? fallbackSize : styles.invisibleImage]} isAuthTokenRequired={isAuthTokenRequired} onLoad={function (e) {
                    updateContentSize(e);
                    setFallbackImageLoaded(true);
                }}/>
                        </react_native_1.View>)}

                    {/* Show activity indicator while the lightbox is still loading the image. */}
                    {isLoading && (!isOffline || isALocalFile) && (<react_native_1.ActivityIndicator size="large" style={react_native_1.StyleSheet.absoluteFill}/>)}
                    {isLoading && !isALocalFile && <AttachmentOfflineIndicator_1.default />}
                </>)}
        </react_native_1.View>);
}
Lightbox.displayName = 'Lightbox';
exports.default = Lightbox;
