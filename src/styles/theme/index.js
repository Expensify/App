"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTheme = void 0;
var CONST_1 = require("@src/CONST");
var dark_1 = require("./themes/dark");
var light_1 = require("./themes/light");
var themes = (_a = {},
    _a[CONST_1.default.THEME.LIGHT] = light_1.default,
    _a[CONST_1.default.THEME.DARK] = dark_1.default,
    _a);
var defaultTheme = themes[CONST_1.default.THEME.FALLBACK];
exports.defaultTheme = defaultTheme;
exports.default = themes;
