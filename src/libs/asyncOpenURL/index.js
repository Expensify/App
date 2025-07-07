"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Log_1 = require("@libs/Log");
var asyncOpenURL = function (promise, url) {
    if (!url) {
        return;
    }
    promise
        .then(function (params) {
        react_native_1.Linking.openURL(typeof url === 'string' ? url : url(params));
    })
        .catch(function () {
        Log_1.default.warn('[asyncOpenURL] error occurred while opening URL', { url: url });
    });
};
exports.default = asyncOpenURL;
