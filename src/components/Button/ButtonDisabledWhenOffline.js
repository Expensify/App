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
var useNetwork_1 = require("@hooks/useNetwork");
var _1 = require(".");
function ButtonDisabledWhenOffline(_a) {
    var _b = _a.disabledWhenOffline, disabledWhenOffline = _b === void 0 ? true : _b, props = __rest(_a, ["disabledWhenOffline"]);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    return (<_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} isDisabled={disabledWhenOffline && isOffline}/>);
}
exports.default = ButtonDisabledWhenOffline;
