"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var Queue_1 = require("@libs/Queue/Queue");
var CONST_1 = require("@src/CONST");
var ELECTRON_EVENTS_1 = require("./ELECTRON_EVENTS");
/**
 * Returns the filename with extension based on the given name and MIME type.
 * @param name - The name of the file.
 * @param mime - The MIME type of the file.
 * @returns The filename with extension.
 */
var getFilenameFromMime = function (name, mime) {
    var extensions = mime.split('/').pop();
    return "".concat(name, ".").concat(extensions);
};
var createDownloadQueue = function () {
    var downloadItemProcessor = function (item) {
        return new Promise(function (resolve, reject) {
            var downloadTimeout;
            var downloadListener;
            var timeoutFunction = function () {
                item.win.webContents.session.removeListener('will-download', downloadListener);
                resolve();
            };
            var listenerFunction = function (event, electronDownloadItem) {
                var _a;
                clearTimeout(downloadTimeout);
                var options = item.options;
                var cleanup = function () { return item.win.webContents.session.removeListener('will-download', listenerFunction); };
                var errorMessage = "The download of ".concat(electronDownloadItem.getFilename(), " was interrupted");
                if (options.directory && !path.isAbsolute(options.directory)) {
                    throw new Error('The `directory` option must be an absolute path');
                }
                var directory = (_a = options.directory) !== null && _a !== void 0 ? _a : electron_1.app.getPath('downloads');
                var filePath;
                if (options.filename) {
                    filePath = path.join(directory, options.filename);
                }
                else {
                    var filename = electronDownloadItem.getFilename();
                    var name_1 = path.extname(filename) ? filename : getFilenameFromMime(filename, electronDownloadItem.getMimeType());
                    filePath = options.overwrite ? path.join(directory, name_1) : path.join(directory, name_1);
                }
                if (options.saveAs) {
                    electronDownloadItem.setSaveDialogOptions(__assign({ defaultPath: filePath }, options.dialogOptions));
                }
                else {
                    electronDownloadItem.setSavePath(filePath);
                }
                electronDownloadItem.on('updated', function (_, state) {
                    if (state !== 'interrupted') {
                        return;
                    }
                    item.win.webContents.send(ELECTRON_EVENTS_1.default.DOWNLOAD_CANCELED, { url: item.url });
                    cleanup();
                    reject(new Error(errorMessage));
                    electronDownloadItem.cancel();
                });
                electronDownloadItem.on('done', function (_, state) {
                    cleanup();
                    if (state === 'cancelled') {
                        item.win.webContents.send(ELECTRON_EVENTS_1.default.DOWNLOAD_CANCELED, { url: item.url });
                        resolve();
                    }
                    else if (state === 'interrupted') {
                        item.win.webContents.send(ELECTRON_EVENTS_1.default.DOWNLOAD_FAILED, { url: item.url });
                        reject(new Error(errorMessage));
                    }
                    else if (state === 'completed') {
                        if (process.platform === 'darwin') {
                            var savePath = electronDownloadItem.getSavePath();
                            electron_1.app.dock.downloadFinished(savePath);
                        }
                        item.win.webContents.send(ELECTRON_EVENTS_1.default.DOWNLOAD_COMPLETED, { url: item.url });
                        resolve();
                    }
                });
            };
            downloadTimeout = setTimeout(timeoutFunction, CONST_1.default.DOWNLOADS_TIMEOUT);
            downloadListener = listenerFunction;
            item.win.webContents.downloadURL(item.url);
            item.win.webContents.session.on('will-download', downloadListener);
        });
    };
    var queue = (0, Queue_1.default)(downloadItemProcessor);
    var enqueueDownloadItem = function (item) {
        queue.enqueue(item);
    };
    return { enqueueDownloadItem: enqueueDownloadItem, dequeueDownloadItem: queue.dequeue };
};
exports.default = createDownloadQueue;
