"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function SafeArea(_a) {
    var children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_safe_area_context_1.SafeAreaView style={[styles.iPhoneXSafeArea]} edges={['left', 'right']}>
            {children}
        </react_native_safe_area_context_1.SafeAreaView>);
}
SafeArea.displayName = 'SafeArea';
exports.default = SafeArea;
