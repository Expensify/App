"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_1 = require("expo-image");
var react_1 = require("react");
function ImageSVG(_a) {
    var src = _a.src, _b = _a.width, width = _b === void 0 ? '100%' : _b, _c = _a.height, height = _c === void 0 ? '100%' : _c, fill = _a.fill, _d = _a.contentFit, contentFit = _d === void 0 ? 'cover' : _d, style = _a.style, onLoadEnd = _a.onLoadEnd;
    var tintColorProp = fill ? { tintColor: fill } : {};
    // Clear memory cache when unmounting images to avoid memory overload
    (0, react_1.useEffect)(function () {
        var clearMemoryCache = function () { return expo_image_1.Image.clearMemoryCache(); };
        return function () {
            clearMemoryCache();
        };
    }, []);
    return (<expo_image_1.Image onLoadEnd={onLoadEnd} 
    // Caching images to memory since some SVGs are being displayed with delay
    // See issue: https://github.com/Expensify/App/issues/34881
    cachePolicy="memory" contentFit={contentFit} source={src} style={[{ width: width, height: height }, style]} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...tintColorProp}/>);
}
ImageSVG.displayName = 'ImageSVG';
exports.default = ImageSVG;
