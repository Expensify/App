"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getOnyxValue;
var react_native_onyx_1 = require("react-native-onyx");
function getOnyxValue(key) {
    return new Promise(function (resolve) {
        react_native_onyx_1.default.connect({
            key: key,
            callback: function (value) { return resolve(value); },
        });
    });
}
