"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
/**
 * Custom hook to track if the window is being resized.
 * It sets a state variable `isResizing` to true when a resize event occurs,
 * and sets it back to false after 1 second of inactivity.
 */
function useIsResizing() {
    var _a = (0, react_1.useState)(false), isResizing = _a[0], setIsResizing = _a[1];
    var debouncedSetIsResizing = (0, react_1.useMemo)(function () {
        return (0, debounce_1.default)(function () {
            if (!isResizing) {
                return;
            }
            // Set isResizing to false after 500 milliseconds of inactivity (no resize events emitted)
            setIsResizing(false);
        }, 500);
    }, [isResizing]);
    (0, react_1.useEffect)(function () {
        var handleResize = function () {
            if (!isResizing) {
                setIsResizing(true);
            }
            debouncedSetIsResizing();
        };
        window.addEventListener('resize', handleResize);
        return function () {
            window.removeEventListener('resize', handleResize);
            debouncedSetIsResizing.cancel();
        };
    }, [isResizing, debouncedSetIsResizing]);
    return isResizing;
}
exports.default = useIsResizing;
