"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Browser = require("@libs/Browser");
var isMobileChrome = Browser.isMobileChrome();
var shouldUseEmojiPickerSelection = function () { return isMobileChrome; };
exports.default = shouldUseEmojiPickerSelection;
