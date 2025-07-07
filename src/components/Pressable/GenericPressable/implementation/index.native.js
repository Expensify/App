"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseGenericPressable_1 = require("./BaseGenericPressable");
function NativeGenericPressable(props, ref) {
    var _a;
    return (<BaseGenericPressable_1.default focusable accessible accessibilityHint={(_a = props.accessibilityHint) !== null && _a !== void 0 ? _a : props.accessibilityLabel} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref}/>);
}
NativeGenericPressable.displayName = 'NativeGenericPressable';
exports.default = (0, react_1.forwardRef)(NativeGenericPressable);
