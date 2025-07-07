"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_blob_util_1 = require("react-native-blob-util");
var FileUtils = require("@libs/fileDownload/FileUtils");
var localFileCreate_1 = require("@libs/localFileCreate");
/**
 * Writes a local file to the app's internal directory with the given fileName
 * and textContent, so we're able to copy it to the Android public download dir.
 * After the file is copied, it is removed from the internal dir.
 */
var localFileDownload = function (fileName, textContent, successMessage) {
    (0, localFileCreate_1.default)(fileName, textContent).then(function (_a) {
        var path = _a.path, newFileName = _a.newFileName;
        react_native_blob_util_1.default.MediaCollection.copyToMediaStore({
            name: newFileName,
            parentFolder: '', // subdirectory in the Media Store, empty goes to 'Downloads'
            mimeType: 'text/plain',
        }, 'Download', path)
            .then(function () {
            FileUtils.showSuccessAlert(successMessage);
        })
            .catch(function () {
            FileUtils.showGeneralErrorAlert();
        })
            .finally(function () {
            react_native_blob_util_1.default.fs.unlink(path);
        });
    });
};
exports.default = localFileDownload;
