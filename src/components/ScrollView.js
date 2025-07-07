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
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
function ScrollView(_a, ref) {
    var children = _a.children, scrollIndicatorInsets = _a.scrollIndicatorInsets, contentContainerStyleProp = _a.contentContainerStyle, addBottomSafeAreaPadding = _a.addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _a.addOfflineIndicatorBottomSafeAreaPadding, props = __rest(_a, ["children", "scrollIndicatorInsets", "contentContainerStyle", "addBottomSafeAreaPadding", "addOfflineIndicatorBottomSafeAreaPadding"]);
    var contentContainerStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({
        addBottomSafeAreaPadding: addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: addOfflineIndicatorBottomSafeAreaPadding,
        style: contentContainerStyleProp,
    });
    return (<react_native_1.ScrollView ref={ref} 
    // on iOS, navigation animation sometimes cause the scrollbar to appear
    // on middle/left side of ScrollView. scrollIndicatorInsets with right
    // to closest value to 0 fixes this issue, 0 (default) doesn't work
    // See: https://github.com/Expensify/App/issues/31441
    contentContainerStyle={contentContainerStyle} scrollIndicatorInsets={scrollIndicatorInsets !== null && scrollIndicatorInsets !== void 0 ? scrollIndicatorInsets : { right: Number.MIN_VALUE }} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
            {children}
        </react_native_1.ScrollView>);
}
ScrollView.displayName = 'ScrollView';
exports.default = react_1.default.forwardRef(ScrollView);
