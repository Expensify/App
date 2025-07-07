"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function ImageSVG(_a) {
    var src = _a.src, _b = _a.width, width = _b === void 0 ? '100%' : _b, _c = _a.height, height = _c === void 0 ? '100%' : _c, fill = _a.fill, _d = _a.hovered, hovered = _d === void 0 ? false : _d, _e = _a.pressed, pressed = _e === void 0 ? false : _e, style = _a.style, pointerEvents = _a.pointerEvents, preserveAspectRatio = _a.preserveAspectRatio;
    var ImageSvgComponent = src;
    var additionalProps = {};
    if (fill) {
        additionalProps.fill = fill;
    }
    if (pointerEvents) {
        additionalProps.pointerEvents = pointerEvents;
    }
    if (preserveAspectRatio) {
        additionalProps.preserveAspectRatio = preserveAspectRatio;
    }
    return (<ImageSvgComponent width={width} height={height} style={style} hovered={"".concat(hovered)} pressed={"".concat(pressed)} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...additionalProps}/>);
}
ImageSVG.displayName = 'ImageSVG';
exports.default = ImageSVG;
