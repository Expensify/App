"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var delay_1 = require("lodash/delay");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AttachmentOfflineIndicator_1 = require("./AttachmentOfflineIndicator");
var FullscreenLoadingIndicator_1 = require("./FullscreenLoadingIndicator");
var Image_1 = require("./Image");
function ImageWithSizeCalculation(_a) {
    var onError = _a.onError, containerStyles = _a.containerStyles, _b = _a.shouldShowOfflineIndicator, shouldShowOfflineIndicator = _b === void 0 ? true : _b, loadingIconSize = _a.loadingIconSize, waitForSession = _a.waitForSession, loadingIndicatorStyles = _a.loadingIndicatorStyles, resizeMode = _a.resizeMode, onLoad = _a.onLoad, rest = __rest(_a, ["onError", "containerStyles", "shouldShowOfflineIndicator", "loadingIconSize", "waitForSession", "loadingIndicatorStyles", "resizeMode", "onLoad"]);
    var styles = (0, useThemeStyles_1.default)();
    var isLoadedRef = (0, react_1.useRef)(null);
    var _c = (0, react_1.useState)(true), isImageCached = _c[0], setIsImageCached = _c[1];
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var handleError = function () {
        onError === null || onError === void 0 ? void 0 : onError();
        if (isLoadedRef.current) {
            isLoadedRef.current = false;
            setIsImageCached(false);
        }
        if (isOffline) {
            return;
        }
        setIsLoading(false);
    };
    var imageLoadedSuccessfully = function (e) {
        isLoadedRef.current = true;
        setIsLoading(false);
        setIsImageCached(true);
        onLoad === null || onLoad === void 0 ? void 0 : onLoad(e);
    };
    /** Delay the loader to detect whether the image is being loaded from the cache or the internet. */
    (0, react_1.useEffect)(function () {
        var _a;
        if ((_a = isLoadedRef.current) !== null && _a !== void 0 ? _a : !isLoading) {
            return;
        }
        var timeout = (0, delay_1.default)(function () {
            if (!isLoading || isLoadedRef.current) {
                return;
            }
            setIsImageCached(false);
        }, 200);
        return function () { return clearTimeout(timeout); };
    }, [isLoading]);
    return (<react_native_1.View style={[styles.w100, styles.h100, containerStyles]}>
            <Image_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} style={[styles.w100, styles.h100]} onLoadStart={function () {
            var _a;
            if ((_a = isLoadedRef.current) !== null && _a !== void 0 ? _a : isLoading) {
                return;
            }
            setIsLoading(true);
        }} onError={handleError} onLoad={function (e) {
            imageLoadedSuccessfully(e);
        }} waitForSession={function () {
            // Called when the image should wait for a valid session to reload
            // At the moment this function is called, the image is not in cache anymore
            isLoadedRef.current = false;
            setIsImageCached(false);
            setIsLoading(true);
            waitForSession === null || waitForSession === void 0 ? void 0 : waitForSession();
        }} loadingIconSize={loadingIconSize} loadingIndicatorStyles={loadingIndicatorStyles}/>
            {isLoading && !isImageCached && !isOffline && (<FullscreenLoadingIndicator_1.default iconSize={loadingIconSize} style={[styles.opacity1, styles.bgTransparent, loadingIndicatorStyles]}/>)}
            {isLoading && shouldShowOfflineIndicator && !isImageCached && <AttachmentOfflineIndicator_1.default isPreview/>}
        </react_native_1.View>);
}
ImageWithSizeCalculation.displayName = 'ImageWithSizeCalculation';
exports.default = react_1.default.memo(ImageWithSizeCalculation);
