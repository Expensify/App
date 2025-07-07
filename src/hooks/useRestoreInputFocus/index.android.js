"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_keyboard_controller_1 = require("react-native-keyboard-controller");
var useRestoreInputFocus = function (isLostFocus) {
    var keyboardVisibleBeforeLoosingFocusRef = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (isLostFocus) {
            keyboardVisibleBeforeLoosingFocusRef.current = react_native_1.Keyboard.isVisible();
        }
        if (!isLostFocus && keyboardVisibleBeforeLoosingFocusRef.current) {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                react_native_keyboard_controller_1.KeyboardController.setFocusTo('current');
            });
        }
    }, [isLostFocus]);
};
exports.default = useRestoreInputFocus;
