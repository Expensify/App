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
var BaseEducationalTooltip_1 = require("./BaseEducationalTooltip");
function EducationalTooltip(_a) {
    var children = _a.children, props = __rest(_a, ["children"]);
    return (<BaseEducationalTooltip_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
            {children}
        </BaseEducationalTooltip_1.default>);
}
EducationalTooltip.displayName = 'EducationalTooltip';
exports.default = EducationalTooltip;
