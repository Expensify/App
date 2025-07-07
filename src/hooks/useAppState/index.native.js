"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
function useAppState(_a) {
    var _b = _a === void 0 ? {} : _a, onAppStateChange = _b.onAppStateChange;
    var _c = react_1.default.useState({
        isForeground: react_native_1.AppState.currentState === 'active',
        isInactive: react_native_1.AppState.currentState === 'inactive',
        isBackground: react_native_1.AppState.currentState === 'background',
    }), appState = _c[0], setAppState = _c[1];
    react_1.default.useEffect(function () {
        function handleAppStateChange(nextAppState) {
            setAppState({
                isForeground: nextAppState === 'active',
                isInactive: nextAppState === 'inactive',
                isBackground: nextAppState === 'background',
            });
            onAppStateChange === null || onAppStateChange === void 0 ? void 0 : onAppStateChange(nextAppState);
        }
        var subscription = react_native_1.AppState.addEventListener('change', handleAppStateChange);
        return function () { return subscription.remove(); };
    }, [onAppStateChange]);
    return appState;
}
exports.default = useAppState;
