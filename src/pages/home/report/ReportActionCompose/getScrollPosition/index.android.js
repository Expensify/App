"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Use a stub function as react-native-keyboard-controller already accounts for the scroll position on Android.
function getScrollPosition() {
    return {
        scrollValue: 0,
    };
}
exports.default = getScrollPosition;
