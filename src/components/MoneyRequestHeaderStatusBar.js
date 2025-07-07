"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Text_1 = require("./Text");
function MoneyRequestHeaderStatusBar(_a) {
    var icon = _a.icon, description = _a.description, _b = _a.shouldStyleFlexGrow, shouldStyleFlexGrow = _b === void 0 ? true : _b;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, shouldStyleFlexGrow && styles.flexGrow1, styles.overflowHidden, styles.headerStatusBarContainer]}>
            <react_native_1.View style={styles.mr2}>{icon}</react_native_1.View>
            <react_native_1.View style={[styles.flexShrink1]}>
                <Text_1.default style={[styles.textLabelSupporting]}>{description}</Text_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
MoneyRequestHeaderStatusBar.displayName = 'MoneyRequestHeaderStatusBar';
exports.default = MoneyRequestHeaderStatusBar;
