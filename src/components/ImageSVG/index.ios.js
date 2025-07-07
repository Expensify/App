"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_1 = require("expo-image");
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
function ImageSVG(_a) {
    var src = _a.src, _b = _a.width, width = _b === void 0 ? '100%' : _b, _c = _a.height, height = _c === void 0 ? '100%' : _c, fill = _a.fill, _d = _a.contentFit, contentFit = _d === void 0 ? 'cover' : _d, style = _a.style, onLoadEnd = _a.onLoadEnd;
    var tintColorProp = fill ? { tintColor: fill } : {};
    return (<expo_image_1.Image onLoadEnd={onLoadEnd} cachePolicy="memory-disk" contentFit={contentFit} source={src} style={[{ width: width, height: height }, style]} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...tintColorProp} transition={CONST_1.default.IMAGE_SVG_TRANSITION_DURATION}/>);
}
ImageSVG.displayName = 'ImageSVG';
exports.default = ImageSVG;
