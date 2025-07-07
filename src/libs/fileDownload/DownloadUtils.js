"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiUtils = require("@libs/ApiUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var Link = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var FileUtils_1 = require("./FileUtils");
var createDownloadLink = function (href, fileName) {
    var _a;
    // creating anchor tag to initiate download
    var link = document.createElement('a');
    // adding href to anchor
    link.href = href;
    link.style.display = 'none';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and since fileName can be an empty string we want to default to `FileUtils.getFileName(url)`
    link.download = fileName;
    // Append to html link element page
    document.body.appendChild(link);
    // Start download
    link.click();
    // Clean up and remove the link
    URL.revokeObjectURL(link.href);
    (_a = link.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(link);
};
/**
 * The function downloads an attachment on web/desktop platforms.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var fetchFileDownload = function (url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed) {
    if (successMessage === void 0) { successMessage = ''; }
    if (shouldOpenExternalLink === void 0) { shouldOpenExternalLink = false; }
    if (formData === void 0) { formData = undefined; }
    if (requestType === void 0) { requestType = 'get'; }
    var resolvedUrl = (0, tryResolveUrlFromApiRoot_1.default)(url);
    var isApiUrl = resolvedUrl.startsWith(ApiUtils.getApiRoot());
    var isAttachmentUrl = CONST_1.default.ATTACHMENT_LOCAL_URL_PREFIX.some(function (prefix) { return resolvedUrl.startsWith(prefix); });
    var isSageUrl = url === CONST_1.default.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT;
    if (
    // We have two file download cases that we should allow: 1. downloading attachments 2. downloading Expensify package for Sage Intacct
    shouldOpenExternalLink ||
        (!isApiUrl && !isAttachmentUrl && !isSageUrl)) {
        // Different origin URLs might pose a CORS issue during direct downloads.
        // Opening in a new tab avoids this limitation, letting the browser handle the download.
        Link.openExternalLink(url);
        return Promise.resolve();
    }
    var fetchOptions = {
        method: requestType,
        body: formData,
        credentials: 'same-origin',
    };
    return fetch(url, fetchOptions)
        .then(function (response) {
        var contentType = response.headers.get('content-type');
        if (contentType === 'application/json' && (fileName === null || fileName === void 0 ? void 0 : fileName.includes('.csv'))) {
            throw new Error();
        }
        return response.blob();
    })
        .then(function (blob) {
        // Create blob link to download
        var href = URL.createObjectURL(new Blob([blob]));
        var completeFileName = (0, FileUtils_1.appendTimeToFileName)(fileName !== null && fileName !== void 0 ? fileName : (0, FileUtils_1.getFileName)(url));
        createDownloadLink(href, completeFileName);
    })
        .catch(function () {
        if (onDownloadFailed) {
            onDownloadFailed();
        }
        else {
            // file could not be downloaded, open sourceURL in new tab
            Link.openExternalLink(url);
        }
    });
};
exports.default = fetchFileDownload;
