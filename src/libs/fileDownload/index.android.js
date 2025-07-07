"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var react_native_blob_util_1 = require("react-native-blob-util");
var react_native_fs_1 = require("react-native-fs");
var CONST_1 = require("@src/CONST");
var FileUtils_1 = require("./FileUtils");
/**
 * Android permission check to store images
 */
function hasAndroidPermission() {
    // On Android API Level 33 and above, these permissions do nothing and always return 'never_ask_again'
    // More info here: https://stackoverflow.com/a/74296799
    if (Number(react_native_1.Platform.Version) >= 33) {
        return Promise.resolve(true);
    }
    // Read and write permission
    var writePromise = react_native_1.PermissionsAndroid.check(react_native_1.PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    var readPromise = react_native_1.PermissionsAndroid.check(react_native_1.PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    return Promise.all([writePromise, readPromise]).then(function (_a) {
        var hasWritePermission = _a[0], hasReadPermission = _a[1];
        if (hasWritePermission && hasReadPermission) {
            return true; // Return true if permission is already given
        }
        // Ask for permission if not given
        return react_native_1.PermissionsAndroid.requestMultiple([react_native_1.PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, react_native_1.PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]).then(function (status) { return status['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' && status['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'; });
    });
}
/**
 * Handling the download
 */
function handleDownload(url, fileName, successMessage, shouldUnlink) {
    if (shouldUnlink === void 0) { shouldUnlink = true; }
    return new Promise(function (resolve) {
        var dirs = react_native_blob_util_1.default.fs.dirs;
        // Android files will download to Download directory
        var path = dirs.DownloadDir;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and since fileName can be an empty string we want to default to `FileUtils.getFileName(url)`
        var attachmentName = (0, FileUtils_1.appendTimeToFileName)(fileName || (0, FileUtils_1.getFileName)(url));
        var isLocalFile = url.startsWith('file://');
        var attachmentPath = isLocalFile ? url : undefined;
        var fetchedAttachment = Promise.resolve();
        if (!isLocalFile) {
            // Fetching the attachment
            fetchedAttachment = react_native_blob_util_1.default.config({
                fileCache: true,
                path: "".concat(path, "/").concat(attachmentName),
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: false,
                    path: "".concat(path, "/Expensify/").concat(attachmentName),
                },
            }).fetch('GET', url);
        }
        // Resolving the fetched attachment
        fetchedAttachment
            .then(function (attachment) {
            if (!isLocalFile && (!attachment || !attachment.info())) {
                return Promise.reject();
            }
            if (!isLocalFile) {
                attachmentPath = attachment.path();
            }
            return react_native_blob_util_1.default.MediaCollection.copyToMediaStore({
                name: attachmentName,
                parentFolder: 'Expensify',
                mimeType: null,
            }, 'Download', attachmentPath !== null && attachmentPath !== void 0 ? attachmentPath : '');
        })
            .then(function () {
            if (attachmentPath && shouldUnlink) {
                react_native_blob_util_1.default.fs.unlink(attachmentPath);
            }
            (0, FileUtils_1.showSuccessAlert)(successMessage);
        })
            .catch(function () {
            (0, FileUtils_1.showGeneralErrorAlert)();
        })
            .finally(function () { return resolve(); });
    });
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
        var downloadPath = "".concat(react_native_fs_1.default.DownloadDirectoryPath, "/").concat(finalFileName);
        return react_native_fs_1.default.writeFile(downloadPath, fileData, 'utf8').then(function () { return downloadPath; });
    })
        .then(function (downloadPath) {
        return react_native_blob_util_1.default.MediaCollection.copyToMediaStore({
            name: (0, FileUtils_1.getFileName)(downloadPath),
            parentFolder: 'Expensify',
            mimeType: null,
        }, 'Download', downloadPath).then(function () { return downloadPath; });
    })
        .then(function (downloadPath) {
        react_native_blob_util_1.default.fs.unlink(downloadPath);
        (0, FileUtils_1.showSuccessAlert)();
    })
        .catch(function () {
        if (!onDownloadFailed) {
            (0, FileUtils_1.showGeneralErrorAlert)();
        }
        onDownloadFailed === null || onDownloadFailed === void 0 ? void 0 : onDownloadFailed();
    });
};
/**
 * Checks permission and downloads the file for Android
 */
var fileDownload = function (url, fileName, successMessage, _, formData, requestType, onDownloadFailed, shouldUnlink) {
    return new Promise(function (resolve) {
        hasAndroidPermission()
            .then(function (hasPermission) {
            if (hasPermission) {
                if (requestType === CONST_1.default.NETWORK.METHOD.POST) {
                    return postDownloadFile(url, fileName, formData, onDownloadFailed);
                }
                return handleDownload(url, fileName, successMessage, shouldUnlink);
            }
            (0, FileUtils_1.showPermissionErrorAlert)();
        })
            .catch(function () {
            (0, FileUtils_1.showPermissionErrorAlert)();
        })
            .finally(function () { return resolve(); });
    });
};
exports.default = fileDownload;
