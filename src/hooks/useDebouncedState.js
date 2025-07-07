"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
/**
 * A React hook that provides a state and its debounced version.
 *
 * @param initialValue - The initial value of the state.
 * @param delay - The debounce delay in milliseconds. Defaults to USE_DEBOUNCED_STATE_DELAY = 300ms.
 * @returns A tuple containing:
 *          - The current state value.
 *          - The debounced state value.
 *          - A function to set both the current and debounced state values.
 *
 * @template T The type of the state value.
 *
 * @example
 * const [value, debouncedValue, setValue] = useDebouncedState<string>("", 300);
 */
function useDebouncedState(initialValue, delay) {
    if (delay === void 0) { delay = CONST_1.default.TIMING.USE_DEBOUNCED_STATE_DELAY; }
    var _a = (0, react_1.useState)(initialValue), value = _a[0], setValue = _a[1];
    var _b = (0, react_1.useState)(initialValue), debouncedValue = _b[0], setDebouncedValue = _b[1];
    // eslint-disable-next-line react-compiler/react-compiler
    var debouncedSetDebouncedValue = (0, react_1.useRef)((0, debounce_1.default)(setDebouncedValue, delay)).current;
    (0, react_1.useEffect)(function () { return function () { return debouncedSetDebouncedValue.cancel(); }; }, [debouncedSetDebouncedValue]);
    var handleSetValue = (0, react_1.useCallback)(function (newValue) {
        setValue(newValue);
        debouncedSetDebouncedValue(newValue);
    }, [debouncedSetDebouncedValue]);
    return [value, debouncedValue, handleSetValue];
}
exports.default = useDebouncedState;
