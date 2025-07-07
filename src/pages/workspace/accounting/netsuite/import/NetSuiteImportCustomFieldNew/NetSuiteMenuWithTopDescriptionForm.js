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
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
function NetSuiteMenuWithTopDescriptionForm(_a) {
    var value = _a.value, valueRenderer = _a.valueRenderer, props = __rest(_a, ["value", "valueRenderer"]);
    return (<MenuItemWithTopDescription_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} title={valueRenderer ? valueRenderer(value) : value}/>);
}
NetSuiteMenuWithTopDescriptionForm.displayName = 'NetSuiteMenuWithTopDescriptionForm';
exports.default = NetSuiteMenuWithTopDescriptionForm;
