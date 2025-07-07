"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handleRetryPress;
var handleFileRetry_1 = require("./handleFileRetry");
function handleRetryPress(message, dismissError, setShouldShowErrorModal) {
    if (!message.source) {
        return;
    }
    fetch(message.source)
        .then(function (res) { return res.blob(); })
        .then(function (blob) {
        var reconstructedFile = new File([blob], message.filename);
        reconstructedFile.uri = message.source;
        reconstructedFile.source = message.source;
        (0, handleFileRetry_1.default)(message, reconstructedFile, dismissError, setShouldShowErrorModal);
    })
        .catch(function () {
        setShouldShowErrorModal(true);
    });
}
