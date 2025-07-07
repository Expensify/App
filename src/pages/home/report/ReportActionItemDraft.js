"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ReportActionItemDraft(_a) {
    var children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={styles.chatItemDraft}>
            <react_native_1.View style={styles.flex1}>{children}</react_native_1.View>
        </react_native_1.View>);
}
ReportActionItemDraft.displayName = 'ReportActionItemDraft';
exports.default = ReportActionItemDraft;
