"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = usePrevious;
var react_1 = require("react");
/**
 * A hook that returns the previous value of a variable
 */
function usePrevious(value) {
    var ref = (0, react_1.useRef)(value);
    (0, react_1.useEffect)(function () {
        ref.current = value;
    }, [value]);
    // eslint-disable-next-line react-compiler/react-compiler
    return ref.current;
}
