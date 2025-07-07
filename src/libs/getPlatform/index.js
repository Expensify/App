"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getPlatform;
var Browser = require("@libs/Browser");
var CONST_1 = require("@src/CONST");
function getPlatform(shouldMobileWebBeDistinctFromWeb) {
    if (shouldMobileWebBeDistinctFromWeb === void 0) { shouldMobileWebBeDistinctFromWeb = false; }
    if (shouldMobileWebBeDistinctFromWeb && Browser.isMobile()) {
        return CONST_1.default.PLATFORM.MOBILE_WEB;
    }
    return CONST_1.default.PLATFORM.WEB;
}
