"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
function SelectCircle(_a) {
    var _b = _a.isChecked, isChecked = _b === void 0 ? false : _b, selectCircleStyles = _a.selectCircleStyles;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.selectCircle, styles.alignSelfCenter, selectCircleStyles]}>
            {isChecked && (<Icon_1.default src={Expensicons.Checkmark} fill={theme.iconSuccessFill}/>)}
        </react_native_1.View>);
}
SelectCircle.displayName = 'SelectCircle';
exports.default = SelectCircle;
