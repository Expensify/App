"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var BaseGenericPressable_1 = require("./BaseGenericPressable");
function WebGenericPressable(_a, ref) {
    var _b, _c, _d, _e, _f, _g, _h;
    var _j = _a.focusable, focusable = _j === void 0 ? true : _j, props = __rest(_a, ["focusable"]);
    var accessible = ((_b = props.accessible) !== null && _b !== void 0 ? _b : props.accessible === undefined) ? true : props.accessible;
    return (<BaseGenericPressable_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} 
    // change native accessibility props to web accessibility props
    focusable={focusable} tabIndex={((_c = props.tabIndex) !== null && _c !== void 0 ? _c : (!accessible || !focusable)) ? -1 : 0} role={((_d = props.accessibilityRole) !== null && _d !== void 0 ? _d : props.role)} id={props.id} aria-label={props.accessibilityLabel} aria-labelledby={props.accessibilityLabelledBy} aria-valuenow={(_e = props.accessibilityValue) === null || _e === void 0 ? void 0 : _e.now} aria-valuemin={(_f = props.accessibilityValue) === null || _f === void 0 ? void 0 : _f.min} aria-valuemax={(_g = props.accessibilityValue) === null || _g === void 0 ? void 0 : _g.max} aria-valuetext={(_h = props.accessibilityValue) === null || _h === void 0 ? void 0 : _h.text} dataSet={__assign(__assign({ tag: 'pressable' }, (props.noDragArea && { dragArea: false })), props.dataSet)}/>);
}
WebGenericPressable.displayName = 'WebGenericPressable';
exports.default = (0, react_1.forwardRef)(WebGenericPressable);
