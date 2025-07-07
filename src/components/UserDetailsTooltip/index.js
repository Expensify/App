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
var BaseUserDetailsTooltip_1 = require("./BaseUserDetailsTooltip");
function UserDetailsTooltip(_a) {
    var _b = _a.shouldRender, shouldRender = _b === void 0 ? true : _b, children = _a.children, props = __rest(_a, ["shouldRender", "children"]);
    if (!shouldRender) {
        return children;
    }
    return (<BaseUserDetailsTooltip_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
            {children}
        </BaseUserDetailsTooltip_1.default>);
}
UserDetailsTooltip.displayName = 'UserDetailsTooltip';
exports.default = UserDetailsTooltip;
