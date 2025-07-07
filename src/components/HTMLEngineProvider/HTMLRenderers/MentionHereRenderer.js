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
var react_native_1 = require("react-native");
var react_native_render_html_1 = require("react-native-render-html");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
function MentionHereRenderer(_a) {
    var style = _a.style, tnode = _a.tnode;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var flattenStyle = react_native_1.StyleSheet.flatten(style);
    var color = flattenStyle.color, styleWithoutColor = __rest(flattenStyle, ["color"]);
    return (<Text_1.default>
            <Text_1.default 
    // Passing the true value to the function as here mention is always for the current user
    color={StyleUtils.getMentionTextColor(true)} style={[styleWithoutColor, StyleUtils.getMentionStyle(true)]}>
                <react_native_render_html_1.TNodeChildrenRenderer tnode={tnode}/>
            </Text_1.default>
        </Text_1.default>);
}
MentionHereRenderer.displayName = 'HereMentionRenderer';
exports.default = MentionHereRenderer;
