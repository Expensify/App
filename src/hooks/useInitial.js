"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
/**
 * A hook that returns the initial non-undefined value of a variable.
 *
 * @param value The value to evaluate.
 * @returns The first non-undefined value passed to the hook.
 */
function useInitial(value) {
    var initialValueRef = (0, react_1.useRef)(undefined);
    /* eslint-disable react-compiler/react-compiler */
    if (initialValueRef.current === undefined && value !== undefined) {
        initialValueRef.current = value;
    }
    return initialValueRef.current;
    /* eslint-enable react-compiler/react-compiler */
}
exports.default = useInitial;
