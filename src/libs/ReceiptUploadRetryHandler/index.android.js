"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handleRetryPress;
var react_native_fs_1 = require("react-native-fs");
var handleFileRetry_1 = require("./handleFileRetry");
function handleRetryPress(message, dismissError, setShouldShowErrorModal) {
    if (!message.source) {
        return;
    }
    // Android-specific logic using RNFS
    var filePath = message.source.replace('file://', '');
    react_native_fs_1.default.readFile(filePath, 'base64')
        .then(function (fileContent) {
        var file = new File([fileContent], message.filename, { type: 'image/jpeg' });
        file.uri = message.source;
        file.source = message.source;
        (0, handleFileRetry_1.default)(message, file, dismissError, setShouldShowErrorModal);
    })
        .catch(function () {
        setShouldShowErrorModal(true);
    });
}
