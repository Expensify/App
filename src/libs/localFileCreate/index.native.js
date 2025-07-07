"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_blob_util_1 = require("react-native-blob-util");
var FileUtils = require("@libs/fileDownload/FileUtils");
/**
 * Creates a blob file using RN Fetch Blob
 * @param fileName name of the file
 * @param textContent content of the file
 * @returns path, filename and size of the newly created file
 */
var localFileCreate = function (fileName, textContent) {
    var newFileName = FileUtils.appendTimeToFileName(fileName);
    var dir = react_native_blob_util_1.default.fs.dirs.DocumentDir;
    var path = "".concat(dir, "/").concat(newFileName, ".txt");
    return react_native_blob_util_1.default.fs.writeFile(path, textContent, 'utf8').then(function () { return react_native_blob_util_1.default.fs.stat(path).then(function (_a) {
        var size = _a.size;
        return ({ path: path, newFileName: newFileName, size: size });
    }); });
};
exports.default = localFileCreate;
