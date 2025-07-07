"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// On iOS we can allow multiple lightboxes to be rendered at the same time.
// This enables faster time to interaction when swiping between pages in the carousel.
// When the lightbox is pre-rendered, we don't need to wait for the gestures to initialize.
var NUMBER_OF_CONCURRENT_LIGHTBOXES = 3;
exports.default = NUMBER_OF_CONCURRENT_LIGHTBOXES;
