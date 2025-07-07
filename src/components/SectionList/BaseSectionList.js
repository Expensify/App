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
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var AnimatedSectionList_1 = require("./AnimatedSectionList");
function BaseSectionList(_a, ref) {
    var addBottomSafeAreaPadding = _a.addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _a.addOfflineIndicatorBottomSafeAreaPadding, contentContainerStyleProp = _a.contentContainerStyle, restProps = __rest(_a, ["addBottomSafeAreaPadding", "addOfflineIndicatorBottomSafeAreaPadding", "contentContainerStyle"]);
    var contentContainerStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({ addBottomSafeAreaPadding: addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding: addOfflineIndicatorBottomSafeAreaPadding, style: contentContainerStyleProp });
    return (<AnimatedSectionList_1.default contentContainerStyle={contentContainerStyle} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...restProps} ref={ref}/>);
}
BaseSectionList.displayName = 'BaseSectionList';
exports.default = (0, react_1.forwardRef)(BaseSectionList);
