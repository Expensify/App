"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function EditedRenderer(_a) {
    var tnode = _a.tnode, TDefaultRenderer = _a.TDefaultRenderer, style = _a.style, defaultRendererProps = __rest(_a, ["tnode", "TDefaultRenderer", "style"]);
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isPendingDelete = !!(tnode.attributes.deleted !== undefined);
    return (<Text_1.default fontSize={variables_1.default.fontSizeSmall}>
            <Text_1.default fontSize={variables_1.default.fontSizeSmall}> </Text_1.default>
            <Text_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...defaultRendererProps} fontSize={variables_1.default.fontSizeSmall} color={theme.textSupporting} style={[styles.editedLabelStyles, isPendingDelete && styles.offlineFeedback.deleted]}>
                {translate('reportActionCompose.edited')}
            </Text_1.default>
        </Text_1.default>);
}
EditedRenderer.displayName = 'EditedRenderer';
exports.default = EditedRenderer;
