"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var FileUtils_1 = require("./fileDownload/FileUtils");
function validateAttachmentFile(file) {
    if (!file || !isDirectoryCheck(file)) {
        return Promise.resolve({ isValid: false, error: 'fileDoesNotExist' });
    }
    var fileObject = file;
    if ('getAsFile' in file && typeof file.getAsFile === 'function') {
        fileObject = file.getAsFile();
    }
    if (!fileObject) {
        return Promise.resolve({ isValid: false, error: 'fileInvalid' });
    }
    return isFileCorrupted(fileObject).then(function (corruptionResult) {
        if (!corruptionResult.isValid) {
            return corruptionResult;
        }
        if (fileObject instanceof File) {
            /**
             * Cleaning file name, done here so that it covers all cases:
             * upload, drag and drop, copy-paste
             */
            var updatedFile = fileObject;
            var cleanName = (0, FileUtils_1.cleanFileName)(updatedFile.name);
            if (updatedFile.name !== cleanName) {
                updatedFile = new File([updatedFile], cleanName, { type: updatedFile.type });
            }
            var inputSource = URL.createObjectURL(updatedFile);
            updatedFile.uri = inputSource;
            return { isValid: true, fileType: 'file', source: inputSource, file: updatedFile };
        }
        return { isValid: true, fileType: 'uri', source: fileObject.uri, file: fileObject };
    });
}
function isFileCorrupted(fileObject) {
    return (0, FileUtils_1.validateImageForCorruption)(fileObject)
        .then(function () {
        if (fileObject.size && fileObject.size > CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            return {
                isValid: false,
                error: 'tooLarge',
            };
        }
        if (fileObject.size && fileObject.size < CONST_1.default.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            return {
                isValid: false,
                error: 'tooSmall',
            };
        }
        return {
            isValid: true,
        };
    })
        .catch(function () {
        return {
            isValid: false,
            error: 'error',
        };
    });
}
function isDirectoryCheck(data) {
    var _a;
    if ('webkitGetAsEntry' in data && ((_a = data.webkitGetAsEntry()) === null || _a === void 0 ? void 0 : _a.isDirectory)) {
        return false;
    }
    return true;
}
exports.default = validateAttachmentFile;
