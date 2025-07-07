"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDownload = setDownload;
exports.clearDownloads = clearDownloads;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Set whether an attachment is being downloaded so that a spinner can be shown.
 */
function setDownload(sourceID, isDownloading) {
    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.DOWNLOAD).concat(sourceID), { isDownloading: isDownloading });
}
function clearDownloads() {
    var connection = react_native_onyx_1.default.connect({
        key: ONYXKEYS_1.default.COLLECTION.DOWNLOAD,
        waitForCollectionCallback: true,
        callback: function (records) {
            react_native_onyx_1.default.disconnect(connection);
            var downloadsToDelete = {};
            Object.keys(records !== null && records !== void 0 ? records : {}).forEach(function (recordKey) {
                downloadsToDelete[recordKey] = null;
            });
            if (Object.keys(downloadsToDelete).length > 0) {
                react_native_onyx_1.default.multiSet(downloadsToDelete);
            }
        },
    });
}
