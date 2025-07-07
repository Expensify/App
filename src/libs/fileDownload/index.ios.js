"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var camera_roll_1 = require("@react-native-camera-roll/camera-roll");
var react_native_blob_util_1 = require("react-native-blob-util");
var react_native_fs_1 = require("react-native-fs");
var react_native_share_1 = require("react-native-share");
var CONST_1 = require("@src/CONST");
var FileUtils_1 = require("./FileUtils");
/**
 * Downloads the file to Documents section in iOS
 */
function downloadFile(fileUrl, fileName) {
    var dirs = react_native_blob_util_1.default.fs.dirs;
    // The iOS files will download to documents directory
    var path = dirs.DocumentDir;
    // Fetching the attachment
    return react_native_blob_util_1.default.config({
        fileCache: true,
        path: "".concat(path, "/").concat(fileName),
        addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: "".concat(path, "/Expensify/").concat(fileName),
        },
    }).fetch('GET', fileUrl);
}
var postDownloadFile = function (url, fileName, formData, onDownloadFailed) {
    var fetchOptions = {
        method: 'POST',
        body: formData,
    };
    return fetch(url, fetchOptions)
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Failed to download file');
        }
        var contentType = response.headers.get('content-type');
        if (contentType === 'application/json' && (fileName === null || fileName === void 0 ? void 0 : fileName.includes('.csv'))) {
            throw new Error();
        }
        return response.text();
    })
        .then(function (fileData) {
        var finalFileName = (0, FileUtils_1.appendTimeToFileName)(fileName !== null && fileName !== void 0 ? fileName : 'Expensify');
        var expensifyDir = "".concat(react_native_fs_1.default.DocumentDirectoryPath, "/Expensify");
        var localPath = "".concat(expensifyDir, "/").concat(finalFileName);
        return react_native_fs_1.default.mkdir(expensifyDir).then(function () {
            return react_native_fs_1.default.writeFile(localPath, fileData, 'utf8')
                .then(function () { return react_native_share_1.default.open({ url: localPath, failOnCancel: false, saveToFiles: true }); })
                .then(function () { return react_native_fs_1.default.unlink(localPath); });
        });
    })
        .catch(function () {
        if (!onDownloadFailed) {
            (0, FileUtils_1.showGeneralErrorAlert)();
        }
        onDownloadFailed === null || onDownloadFailed === void 0 ? void 0 : onDownloadFailed();
    });
};
/**
 * Download the image to photo lib in iOS
 */
function downloadImage(fileUrl) {
    return camera_roll_1.CameraRoll.saveAsset(fileUrl);
}
/**
 * Download the video to photo lib in iOS
 */
function downloadVideo(fileUrl, fileName) {
    return new Promise(function (resolve, reject) {
        var documentPathUri = null;
        var cameraRollAsset;
        // Because CameraRoll doesn't allow direct downloads of video with remote URIs, we first download as documents, then copy to photo lib and unlink the original file.
        downloadFile(fileUrl, fileName)
            .then(function (attachment) {
            documentPathUri = attachment.data;
            if (!documentPathUri) {
                throw new Error('Error downloading video');
            }
            return camera_roll_1.CameraRoll.saveAsset(documentPathUri);
        })
            .then(function (attachment) {
            cameraRollAsset = attachment;
            if (!documentPathUri) {
                throw new Error('Error downloading video');
            }
            return react_native_blob_util_1.default.fs.unlink(documentPathUri);
        })
            .then(function () {
            resolve(cameraRollAsset);
        })
            .catch(function (err) { return reject(err); });
    });
}
/**
 * Download the file based on type(image, video, other file types)for iOS
 */
var fileDownload = function (fileUrl, fileName, successMessage, _, formData, requestType, onDownloadFailed) {
    return new Promise(function (resolve) {
        var fileDownloadPromise;
        var fileType = (0, FileUtils_1.getFileType)(fileUrl);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and since fileName can be an empty string we want to default to `FileUtils.getFileName(url)`
        var attachmentName = (0, FileUtils_1.appendTimeToFileName)(fileName || (0, FileUtils_1.getFileName)(fileUrl));
        switch (fileType) {
            case CONST_1.default.ATTACHMENT_FILE_TYPE.IMAGE:
                fileDownloadPromise = downloadImage(fileUrl);
                break;
            case CONST_1.default.ATTACHMENT_FILE_TYPE.VIDEO:
                fileDownloadPromise = downloadVideo(fileUrl, attachmentName);
                break;
            default:
                if (requestType === CONST_1.default.NETWORK.METHOD.POST) {
                    fileDownloadPromise = postDownloadFile(fileUrl, fileName, formData, onDownloadFailed);
                    break;
                }
                fileDownloadPromise = downloadFile(fileUrl, attachmentName);
                break;
        }
        fileDownloadPromise
            .then(function (attachment) {
            if (!attachment) {
                return;
            }
            (0, FileUtils_1.showSuccessAlert)(successMessage);
        })
            .catch(function (err) {
            // iOS shows permission popup only once. Subsequent request will only throw an error.
            // We catch the error and show a redirection link to the settings screen
            if (err.message === CONST_1.default.IOS_CAMERA_ROLL_ACCESS_ERROR) {
                (0, FileUtils_1.showPermissionErrorAlert)();
            }
            else {
                (0, FileUtils_1.showGeneralErrorAlert)();
            }
        })
            .finally(function () { return resolve(); });
    });
};
exports.default = fileDownload;
