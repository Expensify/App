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
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useTheme_1 = require("@hooks/useTheme");
var MenuItem_1 = require("./MenuItem");
function MenuItemWithTopDescription(_a, ref) {
    var highlighted = _a.highlighted, outerWrapperStyle = _a.outerWrapperStyle, props = __rest(_a, ["highlighted", "outerWrapperStyle"]);
    var theme = (0, useTheme_1.default)();
    var highlightedOuterWrapperStyle = (0, useAnimatedHighlightStyle_1.default)({
        shouldHighlight: highlighted !== null && highlighted !== void 0 ? highlighted : false,
        highlightColor: theme.messageHighlightBG,
        itemEnterDelay: 0,
    });
    return (<MenuItem_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} shouldShowBasicTitle shouldShowDescriptionOnTop outerWrapperStyle={highlighted ? highlightedOuterWrapperStyle : outerWrapperStyle}/>);
}
MenuItemWithTopDescription.displayName = 'MenuItemWithTopDescription';
exports.default = (0, react_1.forwardRef)(MenuItemWithTopDescription);
