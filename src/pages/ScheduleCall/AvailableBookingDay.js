"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
function AvailableBookingDay(_a) {
    var disabled = _a.disabled, selected = _a.selected, pressed = _a.pressed, hovered = _a.hovered, children = _a.children;
    var themeStyles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<react_native_1.View style={[
            themeStyles.calendarDayContainer,
            !disabled ? [themeStyles.buttonDefaultBG, StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(hovered, pressed))] : {},
            selected ? themeStyles.buttonSuccess : {},
        ]}>
            <Text_1.default>{children}</Text_1.default>
        </react_native_1.View>);
}
AvailableBookingDay.displayName = 'AvailableBookingDay';
exports.default = AvailableBookingDay;
