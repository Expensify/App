"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThumbnailDimensions_1 = require("@hooks/useThumbnailDimensions");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var AttachmentDeletedIndicator_1 = require("./AttachmentDeletedIndicator");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var ImageWithSizeCalculation_1 = require("./ImageWithSizeCalculation");
// Cache for the dimensions of the thumbnails to avoid flickering incorrect size when the
// image has already been loaded once. This caches the dimensions based on the URL of
// the image.
var thumbnailDimensionsCache = new Map();
function ThumbnailImage(_a) {
    var _b, _c;
    var previewSourceURL = _a.previewSourceURL, altText = _a.altText, style = _a.style, isAuthTokenRequired = _a.isAuthTokenRequired, _d = _a.imageWidth, imageWidth = _d === void 0 ? 200 : _d, _e = _a.imageHeight, imageHeight = _e === void 0 ? 200 : _e, _f = _a.shouldDynamicallyResize, shouldDynamicallyResize = _f === void 0 ? true : _f, _g = _a.fallbackIcon, fallbackIcon = _g === void 0 ? Expensicons.Gallery : _g, _h = _a.fallbackIconSize, fallbackIconSize = _h === void 0 ? variables_1.default.iconSizeSuperLarge : _h, fallbackIconColor = _a.fallbackIconColor, fallbackIconBackground = _a.fallbackIconBackground, _j = _a.objectPosition, objectPosition = _j === void 0 ? CONST_1.default.IMAGE_OBJECT_POSITION.INITIAL : _j, isDeleted = _a.isDeleted, onLoadFailure = _a.onLoadFailure, onMeasure = _a.onMeasure;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _k = (0, react_1.useState)(false), failedToLoad = _k[0], setFailedToLoad = _k[1];
    var cachedDimensions = shouldDynamicallyResize && typeof previewSourceURL === 'string' ? thumbnailDimensionsCache.get(previewSourceURL) : null;
    var _l = (0, react_1.useState)({ width: (_b = cachedDimensions === null || cachedDimensions === void 0 ? void 0 : cachedDimensions.width) !== null && _b !== void 0 ? _b : imageWidth, height: (_c = cachedDimensions === null || cachedDimensions === void 0 ? void 0 : cachedDimensions.height) !== null && _c !== void 0 ? _c : imageHeight }), imageDimensions = _l[0], setImageDimensions = _l[1];
    var thumbnailDimensionsStyles = (0, useThumbnailDimensions_1.default)(imageDimensions.width, imageDimensions.height).thumbnailDimensionsStyles;
    var StyleUtils = (0, useStyleUtils_1.default)();
    (0, react_1.useEffect)(function () {
        setFailedToLoad(false);
    }, [isOffline, previewSourceURL]);
    /**
     * Update the state with the computed thumbnail sizes.
     * @param Params - width and height of the original image.
     */
    var updateImageSize = (0, react_1.useCallback)(function (_a) {
        var width = _a.width, height = _a.height;
        if (!shouldDynamicallyResize ||
            // If the provided dimensions are good avoid caching them and updating state.
            (imageDimensions.width === width && imageDimensions.height === height)) {
            return;
        }
        if (typeof previewSourceURL === 'string') {
            thumbnailDimensionsCache.set(previewSourceURL, { width: width, height: height });
        }
        setImageDimensions({ width: width, height: height });
    }, [previewSourceURL, imageDimensions, shouldDynamicallyResize]);
    var sizeStyles = shouldDynamicallyResize ? [thumbnailDimensionsStyles] : [styles.w100, styles.h100];
    if (failedToLoad || previewSourceURL === '') {
        var fallbackColor = StyleUtils.getBackgroundColorStyle(fallbackIconBackground !== null && fallbackIconBackground !== void 0 ? fallbackIconBackground : theme.border);
        return (<react_native_1.View style={[style, styles.overflowHidden, fallbackColor]}>
                <react_native_1.View style={__spreadArray(__spreadArray([], sizeStyles, true), [styles.alignItemsCenter, styles.justifyContentCenter], false)}>
                    <Icon_1.default src={isOffline ? Expensicons.OfflineCloud : fallbackIcon} height={fallbackIconSize} width={fallbackIconSize} fill={fallbackIconColor !== null && fallbackIconColor !== void 0 ? fallbackIconColor : theme.border}/>
                </react_native_1.View>
            </react_native_1.View>);
    }
    return (<react_native_1.View style={[styles.thumbnailImageContainerHighlight, style, styles.overflowHidden]}>
            {!!isDeleted && <AttachmentDeletedIndicator_1.default containerStyles={__spreadArray([], sizeStyles, true)}/>}
            <react_native_1.View style={__spreadArray(__spreadArray([], sizeStyles, true), [styles.alignItemsCenter, styles.justifyContentCenter], false)}>
                <ImageWithSizeCalculation_1.default url={previewSourceURL} altText={altText} onMeasure={function (args) {
            updateImageSize(args);
            onMeasure === null || onMeasure === void 0 ? void 0 : onMeasure();
        }} onLoadFailure={function () {
            setFailedToLoad(true);
            onLoadFailure === null || onLoadFailure === void 0 ? void 0 : onLoadFailure();
        }} isAuthTokenRequired={isAuthTokenRequired} objectPosition={objectPosition}/>
            </react_native_1.View>
        </react_native_1.View>);
}
ThumbnailImage.displayName = 'ThumbnailImage';
exports.default = react_1.default.memo(ThumbnailImage);
