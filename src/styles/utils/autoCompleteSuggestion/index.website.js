"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Browser = require("@libs/Browser");
var isMobileSafari = Browser.isMobileSafari();
var shouldPreventScrollOnAutoCompleteSuggestion = function () { return !isMobileSafari; };
exports.default = shouldPreventScrollOnAutoCompleteSuggestion;
