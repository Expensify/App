"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileUtils = require("@libs/fileDownload/FileUtils");
/**
 * Creates a Blob file
 * @param fileName name of the file
 * @param textContent content of the file
 * @returns path, filename and size of the newly created file
 */
var localFileCreate = function (fileName, textContent) {
    var newFileName = FileUtils.appendTimeToFileName(fileName);
    var blob = new Blob([textContent], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    return Promise.resolve({ path: url, newFileName: newFileName, size: blob.size });
};
exports.default = localFileCreate;
