"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var willBlurTextInputOnTapOutside = function () { return !(0, getIsNarrowLayout_1.default)(); };
exports.default = willBlurTextInputOnTapOutside;
