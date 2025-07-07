"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
/**
 * On mobile, there is no concept of hovering, so we return a plain wrapper around the component's children,
 * where the hover state is always false.
 */
function Hoverable(_a) {
    var children = _a.children;
    var childrenWithHoverState = typeof children === 'function' ? children(false) : children;
    return <react_native_1.View>{childrenWithHoverState}</react_native_1.View>;
}
Hoverable.displayName = 'Hoverable';
exports.default = Hoverable;
