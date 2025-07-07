"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
var resizeModes_1 = require("./Image/resizeModes");
var ImageWithLoading_1 = require("./ImageWithLoading");
/**
 * Preloads an image by getting the size and passing dimensions via callback.
 * Image size must be provided by parent via width and height props. Useful for
 * performing some calculation on a network image after fetching dimensions so
 * it can be appropriately resized.
 */
function ImageWithSizeCalculation(_a) {
    var url = _a.url, altText = _a.altText, style = _a.style, onMeasure = _a.onMeasure, onLoadFailure = _a.onLoadFailure, isAuthTokenRequired = _a.isAuthTokenRequired, _b = _a.objectPosition, objectPosition = _b === void 0 ? CONST_1.default.IMAGE_OBJECT_POSITION.INITIAL : _b;
    var styles = (0, useThemeStyles_1.default)();
    var source = (0, react_1.useMemo)(function () { return (typeof url === 'string' ? { uri: url } : url); }, [url]);
    var onError = function () {
        Log_1.default.hmmm('Unable to fetch image to calculate size', { url: url });
        onLoadFailure === null || onLoadFailure === void 0 ? void 0 : onLoadFailure();
    };
    return (<ImageWithLoading_1.default containerStyles={[styles.w100, styles.h100, style]} style={[styles.w100, styles.h100]} source={source} aria-label={altText} isAuthTokenRequired={isAuthTokenRequired} resizeMode={resizeModes_1.default.cover} onError={onError} onLoad={function (event) {
            onMeasure({
                width: event.nativeEvent.width,
                height: event.nativeEvent.height,
            });
        }} objectPosition={objectPosition}/>);
}
ImageWithSizeCalculation.displayName = 'ImageWithSizeCalculation';
exports.default = react_1.default.memo(ImageWithSizeCalculation);
