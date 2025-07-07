"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Lightbox_1 = require("@components/Lightbox");
var MultiGestureCanvas_1 = require("@components/MultiGestureCanvas");
function ImageView(_a) {
    var _b = _a.isAuthTokenRequired, isAuthTokenRequired = _b === void 0 ? false : _b, url = _a.url, style = _a.style, _c = _a.zoomRange, zoomRange = _c === void 0 ? MultiGestureCanvas_1.DEFAULT_ZOOM_RANGE : _c, onError = _a.onError;
    return (<Lightbox_1.default uri={url} zoomRange={zoomRange} isAuthTokenRequired={isAuthTokenRequired} onError={onError} style={style}/>);
}
ImageView.displayName = 'ImageView';
exports.default = ImageView;
