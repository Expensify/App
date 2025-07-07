"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
var setTestReceipt = function (asset, assetExtension, onFileRead, onFileError) {
    var filename = "".concat(CONST_1.default.TEST_RECEIPT.FILENAME, "_").concat(Date.now(), ".").concat(assetExtension);
    (0, FileUtils_1.readFileAsync)(asset, filename, function (file) {
        var source = URL.createObjectURL(file);
        onFileRead(source, file, filename);
    }, function (error) {
        Log_1.default.warn('Error reading test receipt:', { message: error });
        onFileError === null || onFileError === void 0 ? void 0 : onFileError(error);
    }, CONST_1.default.TEST_RECEIPT.FILE_TYPE);
};
exports.default = setTestReceipt;
