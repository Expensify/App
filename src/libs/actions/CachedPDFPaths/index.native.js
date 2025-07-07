"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearByKey = exports.add = void 0;
var react_native_fs_1 = require("react-native-fs");
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/*
 * We need to save the paths of PDF files so we can delete them later.
 * This is to remove the cached PDFs when an attachment is deleted or the user logs out.
 */
var pdfPaths = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.CACHED_PDF_PATHS,
    callback: function (val) {
        pdfPaths = val !== null && val !== void 0 ? val : {};
    },
});
var add = function (id, path) {
    var _a;
    if (pdfPaths[id]) {
        return Promise.resolve();
    }
    return react_native_onyx_1.default.merge(ONYXKEYS_1.default.CACHED_PDF_PATHS, (_a = {}, _a[id] = path, _a));
};
exports.add = add;
var clear = function (path) {
    if (!path) {
        return Promise.resolve();
    }
    return new Promise(function (resolve) {
        (0, react_native_fs_1.exists)(path).then(function (exist) {
            if (!exist) {
                resolve();
            }
            return (0, react_native_fs_1.unlink)(path);
        });
    });
};
var clearByKey = function (id) {
    var _a;
    clear((_a = pdfPaths[id]) !== null && _a !== void 0 ? _a : '').then(function () {
        var _a;
        return react_native_onyx_1.default.merge(ONYXKEYS_1.default.CACHED_PDF_PATHS, (_a = {}, _a[id] = null, _a));
    });
};
exports.clearByKey = clearByKey;
