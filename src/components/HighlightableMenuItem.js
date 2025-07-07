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
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MenuItem_1 = require("./MenuItem");
function HighlightableMenuItem(_a, ref) {
    var wrapperStyle = _a.wrapperStyle, highlighted = _a.highlighted, restOfProps = __rest(_a, ["wrapperStyle", "highlighted"]);
    var styles = (0, useThemeStyles_1.default)();
    var flattenedWrapperStyles = react_native_1.StyleSheet.flatten(wrapperStyle);
    var animatedHighlightStyle = (0, useAnimatedHighlightStyle_1.default)({
        shouldHighlight: highlighted !== null && highlighted !== void 0 ? highlighted : false,
        height: (flattenedWrapperStyles === null || flattenedWrapperStyles === void 0 ? void 0 : flattenedWrapperStyles.height) ? Number(flattenedWrapperStyles.height) : styles.sectionMenuItem.height,
        borderRadius: (flattenedWrapperStyles === null || flattenedWrapperStyles === void 0 ? void 0 : flattenedWrapperStyles.borderRadius) ? Number(flattenedWrapperStyles.borderRadius) : styles.sectionMenuItem.borderRadius,
    });
    return (<MenuItem_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...restOfProps} outerWrapperStyle={animatedHighlightStyle} wrapperStyle={wrapperStyle} ref={ref}/>);
}
HighlightableMenuItem.displayName = 'HighlightableMenuItem';
exports.default = (0, react_1.forwardRef)(HighlightableMenuItem);
