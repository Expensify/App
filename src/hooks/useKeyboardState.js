"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useKeyboardState;
var react_1 = require("react");
var withKeyboardState_1 = require("@components/withKeyboardState");
/**
 * Hook for getting current state of keyboard
 * whether the keyboard is open
 */
function useKeyboardState() {
    return (0, react_1.useContext)(withKeyboardState_1.KeyboardStateContext);
}
