"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useHandleBackButton;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
function useHandleBackButton(callback) {
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        var backHandler = react_native_1.BackHandler.addEventListener('hardwareBackPress', callback);
        return function () { return backHandler.remove(); };
    }, [callback]));
}
