"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// We can't use the common component for the Tooltip as Web implementation uses DOM specific method
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Tooltip(_a, ref) {
    var children = _a.children;
    return children;
}
Tooltip.displayName = 'Tooltip';
exports.default = (0, react_1.forwardRef)(Tooltip);
