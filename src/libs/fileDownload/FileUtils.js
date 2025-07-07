"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfirmModalPrompt = exports.isHeicOrHeifImage = exports.getFileValidationErrorText = exports.isValidReceiptExtension = exports.validateAttachment = exports.validateReceipt = exports.createFile = exports.resizeImageIfNeeded = exports.getImageDimensionsAfterResize = exports.readFileAsync = exports.splitExtensionFromFileName = void 0;
exports.showGeneralErrorAlert = showGeneralErrorAlert;
exports.showSuccessAlert = showSuccessAlert;
exports.showPermissionErrorAlert = showPermissionErrorAlert;
exports.showCameraPermissionsAlert = showCameraPermissionsAlert;
exports.getFileName = getFileName;
exports.getFileType = getFileType;
exports.cleanFileName = cleanFileName;
exports.appendTimeToFileName = appendTimeToFileName;
exports.base64ToFile = base64ToFile;
exports.isLocalFile = isLocalFile;
exports.validateImageForCorruption = validateImageForCorruption;
exports.isImage = isImage;
exports.getFileResolution = getFileResolution;
exports.isHighResolutionImage = isHighResolutionImage;
exports.verifyFileFormat = verifyFileFormat;
var expensify_common_1 = require("expensify-common");
var react_native_1 = require("react-native");
var react_native_image_size_1 = require("react-native-image-size");
var DateUtils_1 = require("@libs/DateUtils");
var getPlatform_1 = require("@libs/getPlatform");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var saveLastRoute_1 = require("@libs/saveLastRoute");
var CONST_1 = require("@src/CONST");
var getImageManipulator_1 = require("./getImageManipulator");
var getImageResolution_1 = require("./getImageResolution");
/**
 * Show alert on successful attachment download
 * @param successMessage
 */
function showSuccessAlert(successMessage) {
    react_native_1.Alert.alert((0, Localize_1.translateLocal)('fileDownload.success.title'), 
    // successMessage can be an empty string and we want to default to `Localize.translateLocal('fileDownload.success.message')`
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    successMessage || (0, Localize_1.translateLocal)('fileDownload.success.message'), [
        {
            text: (0, Localize_1.translateLocal)('common.ok'),
            style: 'cancel',
        },
    ], { cancelable: false });
}
/**
 * Show alert on attachment download error
 */
function showGeneralErrorAlert() {
    react_native_1.Alert.alert((0, Localize_1.translateLocal)('fileDownload.generalError.title'), (0, Localize_1.translateLocal)('fileDownload.generalError.message'), [
        {
            text: (0, Localize_1.translateLocal)('common.cancel'),
            style: 'cancel',
        },
    ]);
}
/**
 * Show alert on attachment download permissions error
 */
function showPermissionErrorAlert() {
    react_native_1.Alert.alert((0, Localize_1.translateLocal)('fileDownload.permissionError.title'), (0, Localize_1.translateLocal)('fileDownload.permissionError.message'), [
        {
            text: (0, Localize_1.translateLocal)('common.cancel'),
            style: 'cancel',
        },
        {
            text: (0, Localize_1.translateLocal)('common.settings'),
            onPress: function () {
                react_native_1.Linking.openSettings();
            },
        },
    ]);
}
/**
 * Inform the users when they need to grant camera access and guide them to settings
 */
function showCameraPermissionsAlert() {
    react_native_1.Alert.alert((0, Localize_1.translateLocal)('attachmentPicker.cameraPermissionRequired'), (0, Localize_1.translateLocal)('attachmentPicker.expensifyDoesNotHaveAccessToCamera'), [
        {
            text: (0, Localize_1.translateLocal)('common.cancel'),
            style: 'cancel',
        },
        {
            text: (0, Localize_1.translateLocal)('common.settings'),
            onPress: function () {
                react_native_1.Linking.openSettings();
                // In the case of ios, the App reloads when we update camera permission from settings
                // we are saving last route so we can navigate to it after app reload
                (0, saveLastRoute_1.default)();
            },
        },
    ], { cancelable: false });
}
/**
 * Extracts a filename from a given URL and sanitizes it for file system usage.
 *
 * This function takes a URL as input and performs the following operations:
 * 1. Extracts the last segment of the URL.
 * 2. Decodes the extracted segment from URL encoding to a plain string for better readability.
 * 3. Replaces any characters in the decoded string that are illegal in file names
 *    with underscores.
 */
function getFileName(url) {
    var _a, _b;
    var fileName = (_b = (_a = url.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0].split('#')[0]) !== null && _b !== void 0 ? _b : '';
    if (!fileName) {
        Log_1.default.warn('[FileUtils] Could not get attachment name', { url: url });
    }
    return decodeURIComponent(fileName).replace(CONST_1.default.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_');
}
function isImage(fileName) {
    return CONST_1.default.FILE_TYPE_REGEX.IMAGE.test(fileName);
}
function isVideo(fileName) {
    return CONST_1.default.FILE_TYPE_REGEX.VIDEO.test(fileName);
}
/**
 * Returns file type based on the uri
 */
function getFileType(fileUrl) {
    if (!fileUrl) {
        return;
    }
    var fileName = getFileName(fileUrl);
    if (!fileName) {
        return;
    }
    if (isImage(fileName)) {
        return CONST_1.default.ATTACHMENT_FILE_TYPE.IMAGE;
    }
    if (isVideo(fileName)) {
        return CONST_1.default.ATTACHMENT_FILE_TYPE.VIDEO;
    }
    return CONST_1.default.ATTACHMENT_FILE_TYPE.FILE;
}
/**
 * Returns the filename split into fileName and fileExtension
 */
var splitExtensionFromFileName = function (fullFileName) {
    var fileName = fullFileName.trim();
    var splitFileName = fileName.split('.');
    var fileExtension = splitFileName.length > 1 ? splitFileName.pop() : '';
    return { fileName: splitFileName.join('.'), fileExtension: fileExtension !== null && fileExtension !== void 0 ? fileExtension : '' };
};
exports.splitExtensionFromFileName = splitExtensionFromFileName;
/**
 * Returns the filename replacing special characters with underscore
 */
function cleanFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9\-._]/g, '_');
}
function appendTimeToFileName(fileName) {
    var file = splitExtensionFromFileName(fileName);
    var newFileName = "".concat(file.fileName, "-").concat(DateUtils_1.default.getDBTime());
    // Replace illegal characters before trying to download the attachment.
    newFileName = newFileName.replace(CONST_1.default.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_');
    if (file.fileExtension) {
        newFileName += ".".concat(file.fileExtension);
    }
    return newFileName;
}
/**
 * Reads a locally uploaded file
 * @param path - the blob url of the locally uploaded file
 * @param fileName - name of the file to read
 */
var readFileAsync = function (path, fileName, onSuccess, onFailure, fileType) {
    if (onFailure === void 0) { onFailure = function () { }; }
    if (fileType === void 0) { fileType = ''; }
    return new Promise(function (resolve) {
        if (!path) {
            resolve();
            onFailure('[FileUtils] Path not specified');
            return;
        }
        fetch(path)
            .then(function (res) {
            // For some reason, fetch is "Unable to read uploaded file"
            // on Android even though the blob is returned, so we'll ignore
            // in that case
            if (!res.ok && react_native_1.Platform.OS !== 'android') {
                throw Error(res.statusText);
            }
            res.blob()
                .then(function (blob) {
                // On Android devices, fetching blob for a file with name containing spaces fails to retrieve the type of file.
                // In this case, let us fallback on fileType provided by the caller of this function.
                var file = new File([blob], cleanFileName(fileName), { type: blob.type || fileType });
                file.source = path;
                // For some reason, the File object on iOS does not have a uri property
                // so images aren't uploaded correctly to the backend
                file.uri = path;
                onSuccess(file);
                resolve(file);
            })
                .catch(function (e) {
                console.debug('[FileUtils] Could not read uploaded file', e);
                onFailure(e);
                resolve();
            });
        })
            .catch(function (e) {
            console.debug('[FileUtils] Could not read uploaded file', e);
            onFailure(e);
            resolve();
        });
    });
};
exports.readFileAsync = readFileAsync;
/**
 * Converts a base64 encoded image string to a File instance.
 * Adds a `uri` property to the File instance for accessing the blob as a URI.
 *
 * @param base64 - The base64 encoded image string.
 * @param filename - Desired filename for the File instance.
 * @returns The File instance created from the base64 string with an additional `uri` property.
 *
 * @example
 * const base64Image = "data:image/png;base64,..."; // your base64 encoded image
 * const imageFile = base64ToFile(base64Image, "example.png");
 * console.log(imageFile.uri); // Blob URI
 */
function base64ToFile(base64, filename) {
    var _a, _b, _c;
    // Decode the base64 string
    var byteString = atob((_a = base64.split(',').at(1)) !== null && _a !== void 0 ? _a : '');
    // Get the mime type from the base64 string
    var mimeString = (_c = (_b = base64.split(',').at(0)) === null || _b === void 0 ? void 0 : _b.split(':').at(1)) === null || _c === void 0 ? void 0 : _c.split(';').at(0);
    // Convert byte string to Uint8Array
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var uint8Array = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    // Create a blob from the Uint8Array
    var blob = new Blob([uint8Array], { type: mimeString });
    // Create a File instance from the Blob
    var file = new File([blob], filename, { type: mimeString, lastModified: Date.now() });
    // Add a uri property to the File instance for accessing the blob as a URI
    file.uri = URL.createObjectURL(blob);
    return file;
}
function validateImageForCorruption(file) {
    var _a;
    if (!expensify_common_1.Str.isImage((_a = file.name) !== null && _a !== void 0 ? _a : '') || !file.uri) {
        return Promise.resolve();
    }
    return new Promise(function (resolve, reject) {
        var _a;
        react_native_image_size_1.default.getSize((_a = file.uri) !== null && _a !== void 0 ? _a : '')
            .then(function (size) {
            if (size.height <= 0 || size.width <= 0) {
                return reject(new Error('Error reading file: The file is corrupted'));
            }
            resolve();
        })
            .catch(function () {
            return reject(new Error('Error reading file: The file is corrupted'));
        });
    });
}
/** Verify file format based on the magic bytes of the file - some formats might be identified by multiple signatures */
function verifyFileFormat(_a) {
    var fileUri = _a.fileUri, formatSignatures = _a.formatSignatures;
    return fetch(fileUri)
        .then(function (file) { return file.arrayBuffer(); })
        .then(function (arrayBuffer) {
        var uintArray = new Uint8Array(arrayBuffer, 4, 12);
        var hexString = Array.from(uintArray)
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
        return hexString;
    })
        .then(function (hexSignature) {
        return formatSignatures.some(function (signature) { return hexSignature.startsWith(signature); });
    });
}
function isLocalFile(receiptUri) {
    if (!receiptUri) {
        return false;
    }
    return typeof receiptUri === 'number' || (receiptUri === null || receiptUri === void 0 ? void 0 : receiptUri.startsWith('blob:')) || (receiptUri === null || receiptUri === void 0 ? void 0 : receiptUri.startsWith('file:')) || (receiptUri === null || receiptUri === void 0 ? void 0 : receiptUri.startsWith('/'));
}
function getFileResolution(targetFile) {
    var _a, _b;
    if (!targetFile) {
        return Promise.resolve(null);
    }
    // If the file already has width and height, return them directly
    if ('width' in targetFile && 'height' in targetFile) {
        return Promise.resolve({ width: (_a = targetFile.width) !== null && _a !== void 0 ? _a : 0, height: (_b = targetFile.height) !== null && _b !== void 0 ? _b : 0 });
    }
    // Otherwise, attempt to get the image resolution
    return (0, getImageResolution_1.default)(targetFile)
        .then(function (_a) {
        var width = _a.width, height = _a.height;
        return ({ width: width, height: height });
    })
        .catch(function (error) {
        Log_1.default.hmmm('Failed to get image resolution:', error);
        return null;
    });
}
function isHighResolutionImage(resolution) {
    return resolution !== null && (resolution.width > CONST_1.default.IMAGE_HIGH_RESOLUTION_THRESHOLD || resolution.height > CONST_1.default.IMAGE_HIGH_RESOLUTION_THRESHOLD);
}
var getImageDimensionsAfterResize = function (file) {
    var _a;
    return react_native_image_size_1.default.getSize((_a = file.uri) !== null && _a !== void 0 ? _a : '').then(function (_a) {
        var width = _a.width, height = _a.height;
        var scaleFactor = CONST_1.default.MAX_IMAGE_DIMENSION / (width < height ? height : width);
        var newWidth = Math.max(1, width * scaleFactor);
        var newHeight = Math.max(1, height * scaleFactor);
        return { width: newWidth, height: newHeight };
    });
};
exports.getImageDimensionsAfterResize = getImageDimensionsAfterResize;
var resizeImageIfNeeded = function (file) {
    var _a, _b;
    if (!file || !expensify_common_1.Str.isImage((_a = file.name) !== null && _a !== void 0 ? _a : '') || ((_b = file === null || file === void 0 ? void 0 : file.size) !== null && _b !== void 0 ? _b : 0) <= CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
        return Promise.resolve(file);
    }
    return getImageDimensionsAfterResize(file).then(function (_a) {
        var _b, _c;
        var width = _a.width, height = _a.height;
        return (0, getImageManipulator_1.default)({ fileUri: (_b = file.uri) !== null && _b !== void 0 ? _b : '', width: width, height: height, fileName: (_c = file.name) !== null && _c !== void 0 ? _c : '', type: file.type });
    });
};
exports.resizeImageIfNeeded = resizeImageIfNeeded;
var createFile = function (file) {
    if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.ANDROID || (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.IOS) {
        return {
            uri: file.uri,
            name: file.name,
            type: file.type,
        };
    }
    return new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
    });
};
exports.createFile = createFile;
var validateReceipt = function (file, setUploadReceiptError) {
    return validateImageForCorruption(file)
        .then(function () {
        var _a, _b, _c, _d;
        var fileExtension = splitExtensionFromFileName((_a = file === null || file === void 0 ? void 0 : file.name) !== null && _a !== void 0 ? _a : '').fileExtension;
        if (!CONST_1.default.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(fileExtension.toLowerCase())) {
            setUploadReceiptError(true, 'attachmentPicker.wrongFileType', 'attachmentPicker.notAllowedExtension');
            return false;
        }
        if (!expensify_common_1.Str.isImage((_b = file.name) !== null && _b !== void 0 ? _b : '') && ((_c = file === null || file === void 0 ? void 0 : file.size) !== null && _c !== void 0 ? _c : 0) > CONST_1.default.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE) {
            setUploadReceiptError(true, 'attachmentPicker.attachmentTooLarge', 'attachmentPicker.sizeExceededWithLimit');
            return false;
        }
        if (((_d = file === null || file === void 0 ? void 0 : file.size) !== null && _d !== void 0 ? _d : 0) < CONST_1.default.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            setUploadReceiptError(true, 'attachmentPicker.attachmentTooSmall', 'attachmentPicker.sizeNotMet');
            return false;
        }
        return true;
    })
        .catch(function () {
        setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.errorWhileSelectingCorruptedAttachment');
        return false;
    });
};
exports.validateReceipt = validateReceipt;
var getConfirmModalPrompt = function (attachmentInvalidReason) {
    if (!attachmentInvalidReason) {
        return '';
    }
    if (attachmentInvalidReason === 'attachmentPicker.sizeExceededWithLimit') {
        return (0, Localize_1.translateLocal)(attachmentInvalidReason, { maxUploadSizeInMB: CONST_1.default.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE / (1024 * 1024) });
    }
    return (0, Localize_1.translateLocal)(attachmentInvalidReason);
};
exports.getConfirmModalPrompt = getConfirmModalPrompt;
var isValidReceiptExtension = function (file) {
    var _a;
    var fileExtension = splitExtensionFromFileName((_a = file === null || file === void 0 ? void 0 : file.name) !== null && _a !== void 0 ? _a : '').fileExtension;
    return CONST_1.default.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(fileExtension.toLowerCase());
};
exports.isValidReceiptExtension = isValidReceiptExtension;
var isHeicOrHeifImage = function (file) {
    var _a, _b, _c;
    return (((_a = file === null || file === void 0 ? void 0 : file.type) === null || _a === void 0 ? void 0 : _a.startsWith('image')) &&
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (((_b = file.name) === null || _b === void 0 ? void 0 : _b.toLowerCase().endsWith('.heic')) || ((_c = file.name) === null || _c === void 0 ? void 0 : _c.toLowerCase().endsWith('.heif'))));
};
exports.isHeicOrHeifImage = isHeicOrHeifImage;
var validateAttachment = function (file, isCheckingMultipleFiles, isValidatingReceipt) {
    var _a, _b, _c;
    var maxFileSize = isValidatingReceipt ? CONST_1.default.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE : CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_SIZE;
    if (!expensify_common_1.Str.isImage((_a = file.name) !== null && _a !== void 0 ? _a : '') && !isHeicOrHeifImage(file) && ((_b = file === null || file === void 0 ? void 0 : file.size) !== null && _b !== void 0 ? _b : 0) > maxFileSize) {
        return isCheckingMultipleFiles ? CONST_1.default.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE_MULTIPLE : CONST_1.default.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE;
    }
    if (((_c = file === null || file === void 0 ? void 0 : file.size) !== null && _c !== void 0 ? _c : 0) < CONST_1.default.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        return CONST_1.default.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL;
    }
    if (isValidatingReceipt && !isValidReceiptExtension(file)) {
        return isCheckingMultipleFiles ? CONST_1.default.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE : CONST_1.default.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE;
    }
    return '';
};
exports.validateAttachment = validateAttachment;
var getFileValidationErrorText = function (validationError, additionalData) {
    var _a, _b;
    if (additionalData === void 0) { additionalData = {}; }
    if (!validationError) {
        return {
            title: '',
            reason: '',
        };
    }
    switch (validationError) {
        case CONST_1.default.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.wrongFileType'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.notAllowedExtension'),
            };
        case CONST_1.default.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.someFilesCantBeUploaded'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.unsupportedFileType', { fileType: (_a = additionalData.fileType) !== null && _a !== void 0 ? _a : '' }),
            };
        case CONST_1.default.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.attachmentTooLarge'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.sizeExceeded'),
            };
        case CONST_1.default.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE_MULTIPLE:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.someFilesCantBeUploaded'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.sizeLimitExceeded', {
                    maxUploadSizeInMB: (_b = additionalData.maxUploadSizeInMB) !== null && _b !== void 0 ? _b : CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_SIZE / 1024 / 1024,
                }),
            };
        case CONST_1.default.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.attachmentTooSmall'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.sizeNotMet'),
            };
        case CONST_1.default.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.attachmentError'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.folderNotAllowedMessage'),
            };
        case CONST_1.default.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.someFilesCantBeUploaded'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.maxFileLimitExceeded'),
            };
        case CONST_1.default.FILE_VALIDATION_ERRORS.FILE_CORRUPTED:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.attachmentError'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.errorWhileSelectingCorruptedAttachment'),
            };
        case CONST_1.default.FILE_VALIDATION_ERRORS.PROTECTED_FILE:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.attachmentError'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.protectedPDFNotSupported'),
            };
        default:
            return {
                title: (0, Localize_1.translateLocal)('attachmentPicker.attachmentError'),
                reason: (0, Localize_1.translateLocal)('attachmentPicker.errorWhileSelectingCorruptedAttachment'),
            };
    }
};
exports.getFileValidationErrorText = getFileValidationErrorText;
