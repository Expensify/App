"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var SwipeInterceptPanResponder = react_native_1.PanResponder.create({
    onStartShouldSetPanResponder: function () { return true; },
    onMoveShouldSetPanResponder: function () { return true; },
    onPanResponderTerminationRequest: function () { return false; },
});
exports.default = SwipeInterceptPanResponder;
