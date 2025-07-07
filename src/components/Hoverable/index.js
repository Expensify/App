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
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var mergeRefs_1 = require("@libs/mergeRefs");
var ValueUtils_1 = require("@libs/ValueUtils");
var ActiveHoverable_1 = require("./ActiveHoverable");
/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */
function Hoverable(_a, ref) {
    var isDisabled = _a.isDisabled, props = __rest(_a, ["isDisabled"]);
    // If Hoverable is disabled, just render the child without additional logic or event listeners.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (isDisabled || !(0, DeviceCapabilities_1.hasHoverSupport)()) {
        var child = (0, ValueUtils_1.getReturnValue)(props.children, false);
        // eslint-disable-next-line react-compiler/react-compiler
        return (0, react_1.cloneElement)(child, { ref: (0, mergeRefs_1.default)(ref, child.ref) });
    }
    return (<ActiveHoverable_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref}/>);
}
exports.default = (0, react_1.forwardRef)(Hoverable);
