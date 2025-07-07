"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var useScrollEnabled = function () {
    var isFocused = (0, native_1.useIsFocused)();
    return isFocused;
};
exports.default = useScrollEnabled;
