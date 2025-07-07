"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function SidebarSpacerWrapper(_a) {
    var children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return <react_native_1.View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout)}>{children}</react_native_1.View>;
}
SidebarSpacerWrapper.displayName = 'SidebarSpacerWrapper';
exports.default = SidebarSpacerWrapper;
