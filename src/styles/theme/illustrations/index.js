"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultIllustrations = void 0;
var CONST_1 = require("@src/CONST");
var dark_1 = require("./themes/dark");
var light_1 = require("./themes/light");
var illustrations = (_a = {},
    _a[CONST_1.default.THEME.LIGHT] = light_1.default,
    _a[CONST_1.default.THEME.DARK] = dark_1.default,
    _a);
var defaultIllustrations = illustrations[CONST_1.default.THEME.FALLBACK];
exports.defaultIllustrations = defaultIllustrations;
exports.default = illustrations;
