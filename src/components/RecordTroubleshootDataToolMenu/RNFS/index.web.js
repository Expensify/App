"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RNFS = {
    exists: function () { return Promise.resolve(false); },
    unlink: function () { return Promise.resolve(); },
    copyFile: function () { return Promise.resolve(); },
    DocumentDirectoryPath: '',
    writeFile: function (path, data, encoding) {
        var dataStr = "data:text/json;charset=".concat(encoding, ",").concat(encodeURIComponent(JSON.stringify(data)));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', path);
        document.body.appendChild(downloadAnchorNode); // required for Firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        return Promise.resolve();
    },
};
exports.default = RNFS;
