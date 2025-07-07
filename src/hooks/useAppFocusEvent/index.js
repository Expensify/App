"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
/**
 * Runs the given callback when the app is focused (eg: after re-opening the app, switching tabs, or focusing the window)
 *
 * @param callback the function to run when the app is focused. This should be memoized with `useCallback`.
 */
var useAppFocusEvent = function (callback) {
    (0, react_1.useEffect)(function () {
        window.addEventListener('focus', callback);
        return function () {
            window.removeEventListener('focus', callback);
        };
    }, [callback]);
};
exports.default = useAppFocusEvent;
