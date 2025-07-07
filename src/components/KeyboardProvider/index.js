"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_keyboard_controller_1 = require("react-native-keyboard-controller");
function KeyboardProviderWrapper(_a) {
    var children = _a.children;
    return (<react_native_keyboard_controller_1.KeyboardProvider statusBarTranslucent navigationBarTranslucent>
            {children}
        </react_native_keyboard_controller_1.KeyboardProvider>);
}
exports.default = KeyboardProviderWrapper;
