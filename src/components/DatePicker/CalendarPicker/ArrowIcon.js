"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function ArrowIcon(_a) {
    var _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.direction, direction = _c === void 0 ? CONST_1.default.DIRECTION.RIGHT : _c;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<react_native_1.View style={[styles.p1, StyleUtils.getDirectionStyle(direction), disabled ? styles.buttonOpacityDisabled : {}]}>
            <Icon_1.default fill={theme.icon} src={Expensicons.ArrowRight}/>
        </react_native_1.View>);
}
ArrowIcon.displayName = 'ArrowIcon';
exports.default = ArrowIcon;
