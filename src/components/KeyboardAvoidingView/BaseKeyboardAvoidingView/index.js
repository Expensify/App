"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * The KeyboardAvoidingView stub implementation for web and other platforms where the keyboard is handled automatically.
 */
var react_1 = require("react");
var react_native_1 = require("react-native");
function BaseKeyboardAvoidingView(props) {
    var behavior = props.behavior, contentContainerStyle = props.contentContainerStyle, enabled = props.enabled, keyboardVerticalOffset = props.keyboardVerticalOffset, rest = __rest(props, ["behavior", "contentContainerStyle", "enabled", "keyboardVerticalOffset"]);
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <react_native_1.View {...rest}/>);
}
BaseKeyboardAvoidingView.displayName = 'BaseKeyboardAvoidingView';
exports.default = BaseKeyboardAvoidingView;
