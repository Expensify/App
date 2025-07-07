"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
var CONST_1 = require("@src/CONST");
var DownloadUtils_1 = require("./DownloadUtils");
/**
 * The function downloads an attachment on desktop platforms.
 */
var fileDownload = function (url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed) {
    if (requestType === CONST_1.default.NETWORK.METHOD.POST) {
        window.electron.send(ELECTRON_EVENTS_1.default.DOWNLOAD);
        return (0, DownloadUtils_1.default)(url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed);
    }
    var options = {
        filename: fileName,
        saveAs: true,
    };
    window.electron.send(ELECTRON_EVENTS_1.default.DOWNLOAD, { url: url, options: options });
    return new Promise(function (resolve) {
        // This sets a timeout that will resolve the promise after 5 seconds to prevent indefinite hanging
        var downloadTimeout = setTimeout(function () {
            resolve();
        }, CONST_1.default.DOWNLOADS_TIMEOUT);
        var handleDownloadStatus = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var arg = Array.isArray(args) ? args.at(0) : null;
            var eventUrl = arg && typeof arg === 'object' && 'url' in arg ? arg.url : null;
            if (eventUrl === url) {
                clearTimeout(downloadTimeout);
                resolve();
            }
        };
        window.electron.on(ELECTRON_EVENTS_1.default.DOWNLOAD_COMPLETED, handleDownloadStatus);
        window.electron.on(ELECTRON_EVENTS_1.default.DOWNLOAD_FAILED, handleDownloadStatus);
        window.electron.on(ELECTRON_EVENTS_1.default.DOWNLOAD_CANCELED, handleDownloadStatus);
    });
};
exports.default = fileDownload;
