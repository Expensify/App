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
var AttachmentOfflineIndicator_1 = require("@components/AttachmentOfflineIndicator");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var Image_1 = require("@components/Image");
var resizeModes_1 = require("@components/Image/resizeModes");
var Lightbox_1 = require("@components/Lightbox");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities = require("@libs/DeviceCapabilities");
var FileUtils = require("@libs/fileDownload/FileUtils");
var CONST_1 = require("@src/CONST");
var viewRef_1 = require("@src/types/utils/viewRef");
function ImageView(_a) {
    var _b = _a.isAuthTokenRequired, isAuthTokenRequired = _b === void 0 ? false : _b, url = _a.url, fileName = _a.fileName, onError = _a.onError;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(0), containerHeight = _d[0], setContainerHeight = _d[1];
    var _e = (0, react_1.useState)(0), containerWidth = _e[0], setContainerWidth = _e[1];
    var _f = (0, react_1.useState)(false), isZoomed = _f[0], setIsZoomed = _f[1];
    var _g = (0, react_1.useState)(false), isDragging = _g[0], setIsDragging = _g[1];
    var _h = (0, react_1.useState)(false), isMouseDown = _h[0], setIsMouseDown = _h[1];
    var _j = (0, react_1.useState)(0), initialScrollLeft = _j[0], setInitialScrollLeft = _j[1];
    var _k = (0, react_1.useState)(0), initialScrollTop = _k[0], setInitialScrollTop = _k[1];
    var _l = (0, react_1.useState)(0), initialX = _l[0], setInitialX = _l[1];
    var _m = (0, react_1.useState)(0), initialY = _m[0], setInitialY = _m[1];
    var _o = (0, react_1.useState)(0), imgWidth = _o[0], setImgWidth = _o[1];
    var _p = (0, react_1.useState)(0), imgHeight = _p[0], setImgHeight = _p[1];
    var _q = (0, react_1.useState)(0), zoomScale = _q[0], setZoomScale = _q[1];
    var _r = (0, react_1.useState)(), zoomDelta = _r[0], setZoomDelta = _r[1];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var scrollableRef = (0, react_1.useRef)(null);
    var canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    var setScale = function (newContainerWidth, newContainerHeight, newImageWidth, newImageHeight) {
        if (!newContainerWidth || !newImageWidth || !newContainerHeight || !newImageHeight) {
            return;
        }
        var newZoomScale = Math.min(newContainerWidth / newImageWidth, newContainerHeight / newImageHeight);
        setZoomScale(newZoomScale);
    };
    var onContainerLayoutChanged = function (e) {
        var _a = e.nativeEvent.layout, width = _a.width, height = _a.height;
        setScale(width, height, imgWidth, imgHeight);
        setContainerHeight(height);
        setContainerWidth(width);
    };
    /**
     * When open image, set image width, height.
     */
    var setImageRegion = function (imageWidth, imageHeight) {
        if (imageHeight <= 0) {
            return;
        }
        setScale(containerWidth, containerHeight, imageWidth, imageHeight);
        setImgWidth(imageWidth);
        setImgHeight(imageHeight);
    };
    var imageLoadingStart = function () {
        if (!isLoading) {
            return;
        }
        setIsLoading(true);
        setZoomScale(0);
        setIsZoomed(false);
    };
    var imageLoad = function (_a) {
        var nativeEvent = _a.nativeEvent;
        setImageRegion(nativeEvent.width, nativeEvent.height);
        setIsLoading(false);
    };
    var onContainerPressIn = function (e) {
        var _a, _b, _c, _d;
        var _e = e.nativeEvent, pageX = _e.pageX, pageY = _e.pageY;
        setIsMouseDown(true);
        setInitialX(pageX);
        setInitialY(pageY);
        setInitialScrollLeft((_b = (_a = scrollableRef.current) === null || _a === void 0 ? void 0 : _a.scrollLeft) !== null && _b !== void 0 ? _b : 0);
        setInitialScrollTop((_d = (_c = scrollableRef.current) === null || _c === void 0 ? void 0 : _c.scrollTop) !== null && _d !== void 0 ? _d : 0);
    };
    /**
     * Convert touch point to zoomed point
     * @param x point when click zoom
     * @param y point when click zoom
     * @returns converted touch point
     */
    var getScrollOffset = function (x, y) {
        var offsetX = 0;
        var offsetY = 0;
        // Container size bigger than clicked position offset
        if (x <= containerWidth / 2) {
            offsetX = 0;
        }
        else if (x > containerWidth / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetX = x - containerWidth / 2;
        }
        if (y <= containerHeight / 2) {
            offsetY = 0;
        }
        else if (y > containerHeight / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetY = y - containerHeight / 2;
        }
        return { offsetX: offsetX, offsetY: offsetY };
    };
    var onContainerPress = function (e) {
        if (!isZoomed && !isDragging) {
            if (e && 'nativeEvent' in e && e.nativeEvent instanceof PointerEvent) {
                var _a = e.nativeEvent, offsetX = _a.offsetX, offsetY = _a.offsetY;
                // Dividing clicked positions by the zoom scale to get coordinates
                // so that once we zoom we will scroll to the clicked location.
                var delta = getScrollOffset(offsetX / zoomScale, offsetY / zoomScale);
                setZoomDelta(delta);
            }
            else {
                setZoomDelta({ offsetX: 0, offsetY: 0 });
            }
        }
        if (isZoomed && isDragging && isMouseDown) {
            setIsDragging(false);
            setIsMouseDown(false);
        }
        else {
            // We first zoom and once its done then we scroll to the location the user clicked.
            setIsZoomed(!isZoomed);
            setIsMouseDown(false);
        }
    };
    var trackPointerPosition = (0, react_1.useCallback)(function (event) {
        var _a;
        // Whether the pointer is released inside the ImageView
        var isInsideImageView = (_a = scrollableRef.current) === null || _a === void 0 ? void 0 : _a.contains(event.target);
        if (!isInsideImageView && isZoomed && isDragging && isMouseDown) {
            setIsDragging(false);
            setIsMouseDown(false);
        }
    }, [isDragging, isMouseDown, isZoomed]);
    var trackMovement = (0, react_1.useCallback)(function (event) {
        if (!isZoomed) {
            return;
        }
        if (isDragging && isMouseDown && scrollableRef.current) {
            var x = event.x;
            var y = event.y;
            var moveX = initialX - x;
            var moveY = initialY - y;
            scrollableRef.current.scrollLeft = initialScrollLeft + moveX;
            scrollableRef.current.scrollTop = initialScrollTop + moveY;
        }
        setIsDragging(isMouseDown);
    }, [initialScrollLeft, initialScrollTop, initialX, initialY, isDragging, isMouseDown, isZoomed]);
    (0, react_1.useEffect)(function () {
        if (!isZoomed || !zoomDelta || !scrollableRef.current) {
            return;
        }
        scrollableRef.current.scrollLeft = zoomDelta.offsetX;
        scrollableRef.current.scrollTop = zoomDelta.offsetY;
    }, [zoomDelta, isZoomed]);
    (0, react_1.useEffect)(function () {
        if (canUseTouchScreen) {
            return;
        }
        document.addEventListener('mousemove', trackMovement);
        document.addEventListener('mouseup', trackPointerPosition);
        return function () {
            document.removeEventListener('mousemove', trackMovement);
            document.removeEventListener('mouseup', trackPointerPosition);
        };
    }, [canUseTouchScreen, trackMovement, trackPointerPosition]);
    // isLocalToUserDeviceFile means the file is located on the user device,
    // not loaded on the server yet (the user is offline when loading this file in fact)
    var isLocalToUserDeviceFile = FileUtils.isLocalFile(url);
    if (isLocalToUserDeviceFile && typeof url === 'string' && url.startsWith('/chat-attachments')) {
        isLocalToUserDeviceFile = false;
    }
    if (canUseTouchScreen) {
        return (<Lightbox_1.default uri={url} isAuthTokenRequired={isAuthTokenRequired} onError={onError}/>);
    }
    return (<react_native_1.View 
    // eslint-disable-next-line react-compiler/react-compiler
    ref={(0, viewRef_1.default)(scrollableRef)} onLayout={onContainerLayoutChanged} style={[styles.imageViewContainer, styles.overflowAuto, styles.pRelative]}>
            <PressableWithoutFeedback_1.default style={__assign(__assign(__assign(__assign({}, StyleUtils.getZoomSizingStyle(isZoomed, imgWidth, imgHeight, zoomScale, containerHeight, containerWidth, isLoading)), StyleUtils.getZoomCursorStyle(isZoomed, isDragging)), (isZoomed && zoomScale >= 1 ? styles.pRelative : styles.pAbsolute)), styles.flex1)} onPressIn={onContainerPressIn} onPress={onContainerPress} role={CONST_1.default.ROLE.IMG} accessibilityLabel={fileName}>
                <Image_1.default source={{ uri: url }} isAuthTokenRequired={isAuthTokenRequired} style={[styles.h100, styles.w100]} resizeMode={resizeModes_1.default.contain} onLoadStart={imageLoadingStart} onLoad={imageLoad} waitForSession={function () {
            setIsLoading(true);
            setZoomScale(0);
            setIsZoomed(false);
        }} onError={onError}/>
            </PressableWithoutFeedback_1.default>

            {isLoading && (!isOffline || isLocalToUserDeviceFile) && <FullscreenLoadingIndicator_1.default style={[styles.opacity1, styles.bgTransparent]}/>}
            {isLoading && !isLocalToUserDeviceFile && <AttachmentOfflineIndicator_1.default />}
        </react_native_1.View>);
}
ImageView.displayName = 'ImageView';
exports.default = ImageView;
