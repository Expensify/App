"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var CONST_1 = require("@src/CONST");
/**
 * Extract the thumbnail URL, source URL and the original filename from the HTML.
 */
var getAttachmentDetails = function (html) {
    var _a, _b, _c, _d, _e, _f;
    // Files can be rendered either as anchor tag or as an image so based on that we have to form regex.
    var IS_IMAGE_TAG = /<img([\w\W]+?)\/>/i.test(html);
    var PREVIEW_SOURCE_REGEX = new RegExp("".concat(CONST_1.default.ATTACHMENT_PREVIEW_ATTRIBUTE, "*=*\"(.+?)\""), 'i');
    var SOURCE_REGEX = new RegExp("".concat(CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE, "*=*\"(.+?)\""), 'i');
    var ORIGINAL_FILENAME_REGEX = IS_IMAGE_TAG ? new RegExp("".concat(CONST_1.default.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE, "*=*\"(.+?)\""), 'i') : new RegExp('<(?:a|video)[^>]*>([^<]+)</(?:a|video)>', 'i');
    if (!html) {
        return {
            previewSourceURL: null,
            sourceURL: null,
            originalFileName: null,
        };
    }
    // Files created/uploaded/hosted by App should resolve from API ROOT. Other URLs aren't modified
    var sourceURL = (0, tryResolveUrlFromApiRoot_1.default)((_b = (_a = html.match(SOURCE_REGEX)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : '');
    var imageURL = IS_IMAGE_TAG ? (0, tryResolveUrlFromApiRoot_1.default)((_d = (_c = html.match(PREVIEW_SOURCE_REGEX)) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : '') : null;
    var previewSourceURL = IS_IMAGE_TAG ? imageURL : sourceURL;
    var originalFileName = (_f = (_e = html.match(ORIGINAL_FILENAME_REGEX)) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : null;
    // Update the image URL so the images can be accessed depending on the config environment
    return {
        previewSourceURL: previewSourceURL,
        sourceURL: sourceURL,
        originalFileName: originalFileName,
    };
};
exports.default = getAttachmentDetails;
