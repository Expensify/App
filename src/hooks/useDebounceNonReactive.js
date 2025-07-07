"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useDebounceNonReactive;
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
/**
 * Create and return a debounced function.
 *
 * Every time the identity of any of the arguments changes, the debounce operation will restart (canceling any ongoing debounce).
 * This hook doesn't react on function identity changes and will not cancel the debounce in case of function identity change.
 * This is important because we want to debounce the function call and not the function reference.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options The options object.
 * @param options.leading Specify invoking on the leading edge of the timeout.
 * @param options.maxWait The maximum time func is allowed to be delayed before it’s invoked.
 * @param options.trailing Specify invoking on the trailing edge of the timeout.
 * @returns Returns a function to call the debounced function.
 */
function useDebounceNonReactive(func, wait, options) {
    var funcRef = (0, react_1.useRef)(func); // Store the latest func reference
    var debouncedFnRef = (0, react_1.useRef)(undefined);
    var _a = options !== null && options !== void 0 ? options : {}, leading = _a.leading, maxWait = _a.maxWait, _b = _a.trailing, trailing = _b === void 0 ? true : _b;
    (0, react_1.useEffect)(function () {
        // Update the funcRef dynamically to avoid recreating debounce
        funcRef.current = func;
    }, [func]);
    // Recreate the debounce instance only if debounce settings change
    (0, react_1.useEffect)(function () {
        var debouncedFn = (0, debounce_1.default)(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            funcRef.current.apply(funcRef, args); // Use the latest func reference
        }, wait, { leading: leading, maxWait: maxWait, trailing: trailing });
        debouncedFnRef.current = debouncedFn;
        return function () {
            debouncedFn.cancel();
        };
    }, [wait, leading, maxWait, trailing]);
    var debounceCallback = (0, react_1.useCallback)(function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = debouncedFnRef.current) === null || _a === void 0 ? void 0 : _a.call.apply(_a, __spreadArray([debouncedFnRef], args, false));
    }, []);
    // eslint-disable-next-line react-compiler/react-compiler
    return debounceCallback;
}
