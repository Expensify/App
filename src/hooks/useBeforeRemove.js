"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
// beforeRemove have some limitations. When the react-navigation is upgraded to 7.x, update this to use usePreventRemove hook.
var useBeforeRemove = function (onBeforeRemove) {
    var navigation = (0, native_1.useNavigation)();
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);
        return unsubscribe;
    }, [navigation, onBeforeRemove]);
};
exports.default = useBeforeRemove;
