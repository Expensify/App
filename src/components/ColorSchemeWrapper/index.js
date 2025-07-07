"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ColorSchemeWrapper(_a) {
    var children = _a.children;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return <react_native_1.View style={[styles.flex1, styles.colorSchemeStyle(theme.colorScheme)]}>{children}</react_native_1.View>;
}
exports.default = ColorSchemeWrapper;
