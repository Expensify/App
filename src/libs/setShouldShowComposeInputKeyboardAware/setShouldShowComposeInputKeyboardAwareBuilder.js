"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Composer = require("@userActions/Composer");
var keyboardEventListener = null;
var setShouldShowComposeInputKeyboardAwareBuilder = function (keyboardEvent) { return function (shouldShow) {
    if (keyboardEventListener) {
        keyboardEventListener.remove();
        keyboardEventListener = null;
    }
    if (!shouldShow) {
        Composer.setShouldShowComposeInput(false);
        return;
    }
    // If keyboard is already hidden, we should show composer immediately because keyboardDidHide event won't be called
    if (!react_native_1.Keyboard.isVisible()) {
        Composer.setShouldShowComposeInput(true);
        return;
    }
    keyboardEventListener = react_native_1.Keyboard.addListener(keyboardEvent, function () {
        Composer.setShouldShowComposeInput(true);
        keyboardEventListener === null || keyboardEventListener === void 0 ? void 0 : keyboardEventListener.remove();
    });
}; };
exports.default = setShouldShowComposeInputKeyboardAwareBuilder;
