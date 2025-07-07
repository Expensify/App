"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
function CaretWrapper(_a) {
    var children = _a.children, style = _a.style;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter, style]}>
            {children}
            <Icon_1.default src={Expensicons.DownArrow} fill={theme.icon} width={variables_1.default.iconSizeExtraSmall} height={variables_1.default.iconSizeExtraSmall}/>
        </react_native_1.View>);
}
exports.default = CaretWrapper;
