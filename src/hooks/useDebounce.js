"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useDebounce;
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
/**
 * Create and return a debounced function.
 *
 * Every time the identity of any of the arguments changes, the debounce operation will restart (canceling any ongoing debounce).
 * This is especially important in the case of func. To prevent that, pass stable references.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options The options object.
 * @param options.leading Specify invoking on the leading edge of the timeout.
 * @param options.maxWait The maximum time func is allowed to be delayed before it’s invoked.
 * @param options.trailing Specify invoking on the trailing edge of the timeout.
 * @returns Returns a function to call the debounced function.
 */
function useDebounce(func, wait, options) {
    var debouncedFnRef = (0, react_1.useRef)(undefined);
    var _a = options !== null && options !== void 0 ? options : {}, leading = _a.leading, maxWait = _a.maxWait, _b = _a.trailing, trailing = _b === void 0 ? true : _b;
    (0, react_1.useEffect)(function () {
        var debouncedFn = (0, debounce_1.default)(func, wait, { leading: leading, maxWait: maxWait, trailing: trailing });
        debouncedFnRef.current = debouncedFn;
        return function () {
            debouncedFn.cancel();
        };
    }, [func, wait, leading, maxWait, trailing]);
    var debounceCallback = (0, react_1.useCallback)(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var debouncedFn = debouncedFnRef.current;
        if (debouncedFn) {
            debouncedFn.apply(void 0, args);
        }
    }, []);
    // eslint-disable-next-line react-compiler/react-compiler
    return debounceCallback;
}
