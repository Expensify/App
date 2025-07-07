"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useWaitForNavigation;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
/**
 * Returns a promise that resolves when navigation finishes.
 * Only use when navigating by react-navigation
 */
function useWaitForNavigation() {
    var resolvePromises = (0, react_1.useRef)([]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        return function () {
            resolvePromises.current.forEach(function (resolve) {
                resolve();
            });
            resolvePromises.current = [];
        };
    }, []));
    return function (navigate) { return function () {
        navigate();
        return new Promise(function (resolve) {
            resolvePromises.current.push(resolve);
        });
    }; };
}
