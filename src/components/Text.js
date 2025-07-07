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
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var FontUtils_1 = require("@styles/utils/FontUtils");
var variables_1 = require("@styles/variables");
var CustomStylesForChildrenProvider_1 = require("./CustomStylesForChildrenProvider");
function Text(_a, ref) {
    var color = _a.color, _b = _a.fontSize, fontSize = _b === void 0 ? variables_1.default.fontSizeNormal : _b, _c = _a.textAlign, textAlign = _c === void 0 ? 'left' : _c, children = _a.children, _d = _a.family, family = _d === void 0 ? 'EXP_NEUE' : _d, _e = _a.style, style = _e === void 0 ? {} : _e, _f = _a.shouldUseDefaultLineHeight, shouldUseDefaultLineHeight = _f === void 0 ? true : _f, props = __rest(_a, ["color", "fontSize", "textAlign", "children", "family", "style", "shouldUseDefaultLineHeight"]);
    var theme = (0, useTheme_1.default)();
    var customStyle = (0, react_1.useContext)(CustomStylesForChildrenProvider_1.CustomStylesForChildrenContext);
    var componentStyle = __assign(__assign(__assign({ color: color !== null && color !== void 0 ? color : theme.text, fontSize: fontSize, textAlign: textAlign }, FontUtils_1.default.fontFamily.platform[family]), react_native_1.StyleSheet.flatten(style)), react_native_1.StyleSheet.flatten(customStyle));
    if (!componentStyle.lineHeight && componentStyle.fontSize === variables_1.default.fontSizeNormal && shouldUseDefaultLineHeight) {
        componentStyle.lineHeight = variables_1.default.fontSizeNormalHeight;
    }
    return (<react_native_1.Text allowFontScaling={false} ref={ref} style={componentStyle} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
            {children}
        </react_native_1.Text>);
}
Text.displayName = 'Text';
exports.default = react_1.default.forwardRef(Text);
