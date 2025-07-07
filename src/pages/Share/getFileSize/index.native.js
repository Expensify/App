"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_fs_1 = require("react-native-fs");
var getFileSize = function (uri) {
    return react_native_fs_1.default.stat(uri).then(function (fileStat) {
        return fileStat.size;
    });
};
exports.default = getFileSize;
