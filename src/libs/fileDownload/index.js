
exports.__esModule = true;
const DownloadUtils_1 = require('./DownloadUtils');
/**
 * The function downloads an attachment on web/desktop platforms.
 */
const fileDownload = function (url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed) {
    if (successMessage === void 0) {
        successMessage = '';
    }
    if (shouldOpenExternalLink === void 0) {
        shouldOpenExternalLink = false;
    }
    if (formData === void 0) {
        formData = undefined;
    }
    if (requestType === void 0) {
        requestType = 'get';
    }
    return DownloadUtils_1['default'](url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed);
};
exports['default'] = fileDownload;
