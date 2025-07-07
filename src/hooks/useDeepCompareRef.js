"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useDeepCompareRef;
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
/**
 * This hook returns a reference to the provided value,
 * but only updates that reference if a deep comparison indicates that the value has changed.
 *
 * This is useful when working with objects or arrays as dependencies to other hooks like `useEffect` or `useMemo`,
 * where you want the hook to trigger not just on reference changes, but also when the contents of the object or array change.
 *
 * @example
 * const myArray = // some array
 * const deepComparedArray = useDeepCompareRef(myArray);
 * useEffect(() => {
 *   // This will run not just when myArray is a new array, but also when its contents change.
 * }, [deepComparedArray]);
 */
function useDeepCompareRef(value) {
    var ref = (0, react_1.useRef)(undefined);
    // eslint-disable-next-line react-compiler/react-compiler
    if (!(0, fast_equals_1.deepEqual)(value, ref.current)) {
        // eslint-disable-next-line react-compiler/react-compiler
        ref.current = value;
    }
    // eslint-disable-next-line react-compiler/react-compiler
    return ref.current;
}
