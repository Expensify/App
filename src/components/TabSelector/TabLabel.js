"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function TabLabel(_a) {
    var _b = _a.title, title = _b === void 0 ? '' : _b, _c = _a.activeOpacity, activeOpacity = _c === void 0 ? 0 : _c, _d = _a.inactiveOpacity, inactiveOpacity = _d === void 0 ? 1 : _d;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View>
            <react_native_1.Animated.View style={[{ opacity: activeOpacity }]}>
                <Text_1.default style={styles.tabText(true)}>{title}</Text_1.default>
            </react_native_1.Animated.View>
            <react_native_1.Animated.View style={[react_native_1.StyleSheet.absoluteFill, { opacity: inactiveOpacity }]}>
                <Text_1.default style={styles.tabText(false)}>{title}</Text_1.default>
            </react_native_1.Animated.View>
        </react_native_1.View>);
}
TabLabel.displayName = 'TabLabel';
exports.default = TabLabel;
