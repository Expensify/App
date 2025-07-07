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
var expo_image_1 = require("expo-image");
var react_1 = require("react");
function BaseImage(_a) {
    var onLoad = _a.onLoad, props = __rest(_a, ["onLoad"]);
    var isLoadedRef = (0, react_1.useRef)(false);
    var imageLoadedSuccessfully = (0, react_1.useCallback)(function (event) {
        if (!onLoad) {
            return;
        }
        if (isLoadedRef.current === true) {
            return;
        }
        // We override `onLoad`, so both web and native have the same signature
        var _a = event.source, width = _a.width, height = _a.height;
        isLoadedRef.current = true;
        onLoad({ nativeEvent: { width: width, height: height } });
    }, [onLoad]);
    return (<expo_image_1.Image 
    // Only subscribe to onLoad when a handler is provided to avoid unnecessary event registrations, optimizing performance.
    onLoad={onLoad ? imageLoadedSuccessfully : undefined} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
BaseImage.displayName = 'BaseImage';
exports.default = BaseImage;
