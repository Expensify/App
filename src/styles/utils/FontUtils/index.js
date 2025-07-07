"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fontFamily_1 = require("./fontFamily");
var multiFontFamily_1 = require("./fontFamily/multiFontFamily");
var singleFontFamily_1 = require("./fontFamily/singleFontFamily");
var fontWeight_1 = require("./fontWeight");
var FontUtils = {
    fontFamily: {
        /**
         * Set of font families that can either have fallback fonts (if web / desktop) or not (if native).
         */
        platform: fontFamily_1.default,
        /**
         * Set of font families that don't include any fallback fonts, normally used on native platforms.
         */
        single: singleFontFamily_1.default,
        /**
         * Set of font families that include fallback fonts, normally used on web / desktop platforms.
         */
        multi: multiFontFamily_1.default,
    },
    fontWeight: fontWeight_1.default,
};
exports.default = FontUtils;
