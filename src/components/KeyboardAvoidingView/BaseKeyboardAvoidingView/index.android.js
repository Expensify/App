"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_keyboard_controller_1 = require("react-native-keyboard-controller");
function BaseKeyboardAvoidingView(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <react_native_keyboard_controller_1.KeyboardAvoidingView {...props}/>;
}
BaseKeyboardAvoidingView.displayName = 'BaseKeyboardAvoidingView';
exports.default = BaseKeyboardAvoidingView;
