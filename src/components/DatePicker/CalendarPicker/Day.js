"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
function Day(_a) {
    var disabled = _a.disabled, selected = _a.selected, pressed = _a.pressed, hovered = _a.hovered, children = _a.children;
    var themeStyles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<react_native_1.View style={[
            themeStyles.calendarDayContainer,
            selected ? themeStyles.buttonDefaultBG : {},
            !disabled ? StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(hovered, pressed)) : {},
        ]}>
            <Text_1.default style={disabled ? themeStyles.buttonOpacityDisabled : {}}>{children}</Text_1.default>
        </react_native_1.View>);
}
Day.displayName = 'Day';
exports.default = Day;
