"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var react_native_blob_util_1 = require("react-native-blob-util");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
var getFile_1 = require("./getFile");
var setTestReceipt = function (asset, assetExtension, onFileRead, onFileError) {
    var filename = "".concat(CONST_1.default.TEST_RECEIPT.FILENAME, "_").concat(Date.now(), ".").concat(assetExtension);
    var path = "".concat(react_native_blob_util_1.default.fs.dirs.CacheDir, "/").concat(filename);
    var source = react_native_1.Image.resolveAssetSource(asset).uri;
    (0, getFile_1.default)(source, path, assetExtension)
        .then(function () {
        var file = {
            uri: "file://".concat(path),
            name: filename,
            type: CONST_1.default.TEST_RECEIPT.FILE_TYPE,
            size: 0,
        };
        if (!file.uri) {
            Log_1.default.warn('Error reading test receipt');
            return;
        }
        onFileRead(file.uri, file, filename);
    })
        .catch(function (error) {
        Log_1.default.warn('Error reading test receipt:', { message: error });
        onFileError === null || onFileError === void 0 ? void 0 : onFileError(error);
    });
};
exports.default = setTestReceipt;
