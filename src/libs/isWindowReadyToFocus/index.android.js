"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var isWindowReadyPromise = Promise.resolve();
var resolveWindowReadyToFocus;
react_native_1.AppState.addEventListener('focus', function () {
    if (!resolveWindowReadyToFocus) {
        return;
    }
    resolveWindowReadyToFocus();
});
react_native_1.AppState.addEventListener('blur', function () {
    isWindowReadyPromise = new Promise(function (resolve) {
        resolveWindowReadyToFocus = resolve;
    });
});
/**
 * If we want to show the soft keyboard reliably, we need to ensure that the input's window gains focus first.
 * Fortunately, we only need to manage the focus of the app window now,
 * so we can achieve this by listening to the 'focus' event of the AppState.
 * See {@link https://developer.android.com/develop/ui/views/touch-and-input/keyboard-input/visibility#ShowReliably}
 */
var isWindowReadyToFocus = function () { return isWindowReadyPromise; };
exports.default = isWindowReadyToFocus;
