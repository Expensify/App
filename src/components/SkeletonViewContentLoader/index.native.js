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
var native_1 = require("react-content-loader/native");
var react_native_1 = require("react-native");
function ContentLoader(_a) {
    var style = _a.style, props = __rest(_a, ["style"]);
    return (<native_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} 
    // Using StyleSheet.flatten() because SkeletonViewContentLoader is not able to handle array style notation(eg. style={[style1, style2]}) of style prop
    style={react_native_1.StyleSheet.flatten(style)}/>);
}
exports.default = ContentLoader;
