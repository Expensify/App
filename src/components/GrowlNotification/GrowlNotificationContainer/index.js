"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function GrowlNotificationContainer(_a) {
    var children = _a.children, translateY = _a.translateY;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return styles.growlNotificationTranslateY(translateY); });
    return (<react_native_reanimated_1.default.View style={[styles.growlNotificationContainer, styles.growlNotificationDesktopContainer, animatedStyles, shouldUseNarrowLayout && styles.mwn]}>{children}</react_native_reanimated_1.default.View>);
}
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';
exports.default = GrowlNotificationContainer;
