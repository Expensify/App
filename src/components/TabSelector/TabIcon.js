"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var useTheme_1 = require("@hooks/useTheme");
function TabIcon(_a) {
    var icon = _a.icon, _b = _a.activeOpacity, activeOpacity = _b === void 0 ? 0 : _b, _c = _a.inactiveOpacity, inactiveOpacity = _c === void 0 ? 1 : _c;
    var theme = (0, useTheme_1.default)();
    return (<react_native_1.View>
            {!!icon && (<>
                    <react_native_1.Animated.View style={{ opacity: inactiveOpacity }}>
                        <Icon_1.default src={icon} fill={theme.icon} small/>
                    </react_native_1.Animated.View>
                    <react_native_1.Animated.View style={[react_native_1.StyleSheet.absoluteFill, { opacity: activeOpacity }]}>
                        <Icon_1.default src={icon} fill={theme.iconMenu} small/>
                    </react_native_1.Animated.View>
                </>)}
        </react_native_1.View>);
}
TabIcon.displayName = 'TabIcon';
exports.default = TabIcon;
