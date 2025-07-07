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
var react_1 = require("react");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var BaseKeyboardAvoidingView_1 = require("./BaseKeyboardAvoidingView");
function KeyboardAvoidingView(_a) {
    var _b = _a.shouldOffsetBottomSafeAreaPadding, shouldOffsetBottomSafeAreaPadding = _b === void 0 ? false : _b, keyboardVerticalOffsetProp = _a.keyboardVerticalOffset, restProps = __rest(_a, ["shouldOffsetBottomSafeAreaPadding", "keyboardVerticalOffset"]);
    var paddingBottom = (0, useSafeAreaPaddings_1.default)(true).paddingBottom;
    var keyboardVerticalOffset = (0, react_1.useMemo)(function () { return (keyboardVerticalOffsetProp !== null && keyboardVerticalOffsetProp !== void 0 ? keyboardVerticalOffsetProp : 0) + (shouldOffsetBottomSafeAreaPadding ? -paddingBottom : 0); }, [keyboardVerticalOffsetProp, paddingBottom, shouldOffsetBottomSafeAreaPadding]);
    return (<BaseKeyboardAvoidingView_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...restProps} keyboardVerticalOffset={keyboardVerticalOffset}/>);
}
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
exports.default = KeyboardAvoidingView;
