"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useAccountTabIndicatorStatus_1 = require("@hooks/useAccountTabIndicatorStatus");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function Indicator() {
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, useAccountTabIndicatorStatus_1.default)(), indicatorColor = _a.indicatorColor, status = _a.status;
    var indicatorStyles = [styles.alignItemsCenter, styles.justifyContentCenter, styles.statusIndicator(indicatorColor)];
    return !!status && <react_native_1.View style={react_native_1.StyleSheet.flatten(indicatorStyles)}/>;
}
Indicator.displayName = 'Indicator';
exports.default = Indicator;
