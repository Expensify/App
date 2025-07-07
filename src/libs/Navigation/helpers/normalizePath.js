"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Expensify uses path with leading '/' but react-navigation doesn't. This function normalizes the path to add the leading '/' for consistency.
function normalizePath(path) {
    return !path.startsWith('/') ? "/".concat(path) : path;
}
exports.default = normalizePath;
