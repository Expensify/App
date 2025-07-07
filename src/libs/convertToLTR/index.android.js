"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
/**
 * Android only - convert RTL text to a LTR text using Unicode controls.
 * https://www.w3.org/International/questions/qa-bidi-unicode-controls
 */
var convertToLTR = function (text) { return "".concat(CONST_1.default.UNICODE.LTR).concat(text); };
exports.default = convertToLTR;
