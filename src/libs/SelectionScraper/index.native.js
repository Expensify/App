"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This is a no-op function for native devices because they wouldn't be able to support Selection API like a website.
var getCurrentSelection = function () { return ''; };
exports.default = {
    getCurrentSelection: getCurrentSelection,
};
