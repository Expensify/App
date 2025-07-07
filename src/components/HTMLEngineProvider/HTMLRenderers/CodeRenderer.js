"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var react_native_render_html_1 = require("react-native-render-html");
var HTMLEngineUtils = require("@components/HTMLEngineProvider/htmlEngineUtils");
var InlineCodeBlock_1 = require("@components/InlineCodeBlock");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var FontUtils_1 = require("@styles/utils/FontUtils");
function CodeRenderer(_a) {
    var TDefaultRenderer = _a.TDefaultRenderer, key = _a.key, style = _a.style, defaultRendererProps = __rest(_a, ["TDefaultRenderer", "key", "style"]);
    var StyleUtils = (0, useStyleUtils_1.default)();
    // We split wrapper and inner styles
    // "boxModelStyle" corresponds to border, margin, padding and backgroundColor
    var _b = (0, react_native_render_html_1.splitBoxModelStyle)(style !== null && style !== void 0 ? style : {}), boxModelStyle = _b.boxModelStyle, textStyle = _b.otherStyle;
    /** Get the default fontFamily variant */
    var font = FontUtils_1.default.fontFamily.platform.MONOSPACE.fontFamily;
    // Determine the font size for the code based on whether it's inside an H1 element.
    var isInsideH1 = HTMLEngineUtils.isChildOfH1(defaultRendererProps.tnode);
    var isInsideTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(defaultRendererProps.tnode);
    var fontSize = StyleUtils.getCodeFontSize(isInsideH1, isInsideTaskTitle);
    var textStyleOverride = {
        fontSize: fontSize,
        fontFamily: font,
    };
    return (<InlineCodeBlock_1.default defaultRendererProps={__assign(__assign({}, defaultRendererProps), { style: {} })} TDefaultRenderer={TDefaultRenderer} boxModelStyle={boxModelStyle} textStyle={__assign(__assign({}, textStyle), textStyleOverride)} key={key}/>);
}
CodeRenderer.displayName = 'CodeRenderer';
exports.default = CodeRenderer;
