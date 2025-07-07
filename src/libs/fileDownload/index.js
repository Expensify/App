"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DownloadUtils_1 = require("./DownloadUtils");
/**
 * The function downloads an attachment on web/desktop platforms.
 */
var fileDownload = function (url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed) {
    if (successMessage === void 0) { successMessage = ''; }
    if (shouldOpenExternalLink === void 0) { shouldOpenExternalLink = false; }
    if (formData === void 0) { formData = undefined; }
    if (requestType === void 0) { requestType = 'get'; }
    return (0, DownloadUtils_1.default)(url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed);
};
exports.default = fileDownload;
