"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
// eslint-disable-next-line no-restricted-imports
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
/**
 * A wrapper around React Native's useWindowDimensions hook.
 */
function default_1() {
    // we need to use `useSafeAreaFrame` instead of `useWindowDimensions` because of https://github.com/facebook/react-native/issues/41918
    var _a = (0, react_native_safe_area_context_1.useSafeAreaFrame)(), windowWidth = _a.width, windowHeight = _a.height;
    return {
        windowWidth: windowWidth,
        windowHeight: windowHeight,
    };
}
