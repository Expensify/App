"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useAppFocusEvent = function (callback) {
    (0, react_1.useEffect)(function () {
        var subscription = react_native_1.AppState.addEventListener('change', function (appState) {
            if (appState !== 'active') {
                return;
            }
            callback();
        });
        return function () {
            subscription.remove();
        };
    }, [callback]);
};
exports.default = useAppFocusEvent;
