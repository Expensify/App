"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
/**
 * Detects whether the app is visible or not.
 */
var isVisible = function () { return document.visibilityState === 'visible'; };
/**
 * Whether the app is focused.
 */
var hasFocus = function () { return document.hasFocus(); };
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
