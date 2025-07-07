"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_blob_util_1 = require("react-native-blob-util");
var react_native_fs_1 = require("react-native-fs");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var getFile = function (source, path, assetExtension) {
    if (CONFIG_1.default.ENVIRONMENT === CONST_1.default.ENVIRONMENT.DEV) {
        return react_native_blob_util_1.default.config({
            fileCache: true,
            appendExt: assetExtension,
            path: path,
        }).fetch('GET', source);
    }
    return react_native_fs_1.default.copyFileRes("".concat(source, ".").concat(assetExtension), path);
};
exports.default = getFile;
