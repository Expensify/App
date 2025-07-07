"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function GrowlNotificationContainer(_a) {
    var children = _a.children, translateY = _a.translateY;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var insets = (0, useSafeAreaInsets_1.default)();
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return styles.growlNotificationTranslateY(translateY); });
    return <react_native_reanimated_1.default.View style={[StyleUtils.getPlatformSafeAreaPadding(insets), styles.growlNotificationContainer, animatedStyles]}>{children}</react_native_reanimated_1.default.View>;
}
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';
exports.default = GrowlNotificationContainer;
