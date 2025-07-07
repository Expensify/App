"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_blob_util_1 = require("react-native-blob-util");
var getFile = function (source, path, assetExtension) {
    return react_native_blob_util_1.default.config({
        fileCache: true,
        appendExt: assetExtension,
        path: path,
    }).fetch('GET', source);
};
exports.default = getFile;
