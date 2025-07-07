"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mobile apps do not require this check for visibility as
// they do not use the Notification lib.
var react_native_1 = require("react-native");
var isVisible = function () { return react_native_1.AppState.currentState === 'active'; };
var hasFocus = function () { return true; };
/**
 * Adds event listener for changes in visibility state
 */
var onVisibilityChange = function (callback) {
    // Deliberately strip callback argument to be consistent across implementations
    var subscription = react_native_1.AppState.addEventListener('change', function () { return callback(); });
    return function () { return subscription.remove(); };
};
exports.default = {
    isVisible: isVisible,
    hasFocus: hasFocus,
    onVisibilityChange: onVisibilityChange,
};
