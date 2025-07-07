"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isFileUploadable(file) {
    return file instanceof Blob;
}
exports.default = isFileUploadable;
