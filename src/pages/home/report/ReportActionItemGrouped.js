"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ReportActionItemGrouped(_a) {
    var wrapperStyle = _a.wrapperStyle, children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.chatItem, wrapperStyle]}>
            <react_native_1.View style={styles.chatItemRightGrouped}>{children}</react_native_1.View>
        </react_native_1.View>);
}
ReportActionItemGrouped.displayName = 'ReportActionItemGrouped';
exports.default = ReportActionItemGrouped;
