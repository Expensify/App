"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var isVisible = false;
react_native_1.Keyboard.addListener('keyboardDidHide', function () {
    isVisible = false;
});
react_native_1.Keyboard.addListener('keyboardDidShow', function () {
    isVisible = true;
});
var dismiss = function () {
    return new Promise(function (resolve) {
        if (!isVisible) {
            resolve();
            return;
        }
        var subscription = react_native_1.Keyboard.addListener('keyboardDidHide', function () {
            resolve(undefined);
            subscription.remove();
        });
        react_native_1.Keyboard.dismiss();
    });
};
var utils = { dismiss: dismiss };
exports.default = utils;
