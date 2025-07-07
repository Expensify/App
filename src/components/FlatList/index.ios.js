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
// On iOS, we have to unset maintainVisibleContentPosition while the user is scrolling to prevent jumping to the beginning issue
function CustomFlatList(props, ref) {
    var originalMaintainVisibleContentPosition = props.maintainVisibleContentPosition, rest = __rest(props, ["maintainVisibleContentPosition"]);
    var _a = (0, react_1.useState)(false), isScrolling = _a[0], setIsScrolling = _a[1];
    var handleScrollBegin = (0, react_1.useCallback)(function () {
        setIsScrolling(true);
    }, []);
    var handleScrollEnd = (0, react_1.useCallback)(function () {
        setIsScrolling(false);
    }, []);
    var maintainVisibleContentPosition = isScrolling ? undefined : originalMaintainVisibleContentPosition;
    return (<react_native_1.FlatList 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} ref={ref} maintainVisibleContentPosition={maintainVisibleContentPosition} onMomentumScrollBegin={handleScrollBegin} onMomentumScrollEnd={handleScrollEnd}/>);
}
CustomFlatList.displayName = 'CustomFlatListWithRef';
exports.default = (0, react_1.forwardRef)(CustomFlatList);
