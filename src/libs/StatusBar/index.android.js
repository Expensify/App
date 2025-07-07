"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var setBackgroundColor = types_1.default.setBackgroundColor;
var statusBarColor = null;
types_1.default.getBackgroundColor = function () { return statusBarColor; };
types_1.default.setBackgroundColor = function (color, animated) {
    if (animated === void 0) { animated = false; }
    statusBarColor = color;
    setBackgroundColor(color, animated);
};
exports.default = types_1.default;
