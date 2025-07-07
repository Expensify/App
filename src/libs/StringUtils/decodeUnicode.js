"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = decodeUnicode;
function decodeUnicode(str) {
    return str.replace(/\\u[\dA-Fa-f]{4}/g, function (match) { return String.fromCharCode(parseInt(match.slice(2), 16)); });
}
