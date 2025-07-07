"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function SubmitButtonShadow(_a) {
    var children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    return <react_native_1.View style={[styles.receiptsSubmitButton, styles.buttonShadowContainer, styles.webButtonShadow]}>{children}</react_native_1.View>;
}
exports.default = SubmitButtonShadow;
