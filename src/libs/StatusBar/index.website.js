"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
types_1.default.getBackgroundColor = function () {
    var element = document.querySelector('meta[name=theme-color]');
    if (!(element === null || element === void 0 ? void 0 : element.content)) {
        return null;
    }
    return element.content;
};
types_1.default.setBackgroundColor = function (backgroundColor) {
    var element = document.querySelector('meta[name=theme-color]');
    if (!element) {
        return;
    }
    element.content = backgroundColor;
};
exports.default = types_1.default;
