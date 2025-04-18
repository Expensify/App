"use strict";
exports.__esModule = true;
// Expensify uses path with leading '/' but react-navigation doesn't. This function normalizes the path to add the leading '/' for consistency.
function normalizePath(path) {
    return !path.startsWith('/') ? "/" + path : path;
}
exports["default"] = normalizePath;
