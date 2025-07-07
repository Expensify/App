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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_vision_camera_1 = require("react-native-vision-camera");
// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function Camera(_a, ref) {
    var cameraTabIndex = _a.cameraTabIndex, props = __rest(_a, ["cameraTabIndex"]);
    var isCameraActive = (0, native_1.useIsFocused)();
    return (<react_native_vision_camera_1.Camera ref={ref} photoQualityBalance="speed" 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} isActive={isCameraActive}/>);
}
Camera.displayName = 'NavigationAwareCamera';
exports.default = react_1.default.forwardRef(Camera);
