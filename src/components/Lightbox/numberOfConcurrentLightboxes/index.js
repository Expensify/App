"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// On web, this is not used.
// On Android, we don't want to allow rendering multiple lightboxes,
// because performance is typically slower than on iOS and this caused issues.
var NUMBER_OF_CONCURRENT_LIGHTBOXES = 1;
exports.default = NUMBER_OF_CONCURRENT_LIGHTBOXES;
