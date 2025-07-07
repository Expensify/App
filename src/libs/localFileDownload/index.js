"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var localFileCreate_1 = require("@libs/localFileCreate");
/**
 * Creates a Blob with the given fileName and textContent, then dynamically
 * creates a temporary anchor, just to programmatically click it, so the file
 * is downloaded by the browser.
 */
var localFileDownload = function (fileName, textContent) {
    (0, localFileCreate_1.default)("".concat(fileName, ".txt"), textContent).then(function (_a) {
        var path = _a.path, newFileName = _a.newFileName;
        var link = document.createElement('a');
        link.download = newFileName;
        link.href = path;
        link.click();
    });
};
exports.default = localFileDownload;
