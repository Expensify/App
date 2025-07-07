"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var moveAccessibilityFocus = function (ref) {
    if (!ref) {
        return;
    }
    react_native_1.AccessibilityInfo.sendAccessibilityEvent(ref, 'focus');
};
exports.default = moveAccessibilityFocus;
