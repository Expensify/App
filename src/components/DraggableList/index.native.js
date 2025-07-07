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
var react_native_draggable_flatlist_1 = require("react-native-draggable-flatlist");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function DraggableList(_a, ref) {
    var viewProps = __rest(_a, []);
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_draggable_flatlist_1.default ref={ref} containerStyle={styles.flex1} contentContainerStyle={styles.flexGrow1} ListFooterComponentStyle={styles.flex1} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...viewProps}/>);
}
DraggableList.displayName = 'DraggableList';
exports.default = react_1.default.forwardRef(DraggableList);
