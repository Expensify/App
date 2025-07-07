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
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ScrollView_1 = require("./ScrollView");
function FormScrollView(_a, ref) {
    var children = _a.children, rest = __rest(_a, ["children"]);
    var styles = (0, useThemeStyles_1.default)();
    return (<ScrollView_1.default style={[styles.w100, styles.flex1]} ref={ref} contentContainerStyle={styles.flexGrow1} keyboardShouldPersistTaps="handled" 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}>
            {children}
        </ScrollView_1.default>);
}
FormScrollView.displayName = 'FormScrollView';
exports.default = react_1.default.forwardRef(FormScrollView);
