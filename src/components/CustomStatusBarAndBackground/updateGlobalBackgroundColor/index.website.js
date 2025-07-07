"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var updateGlobalBackgroundColor = function (theme) {
    var htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.style.setProperty('background-color', theme.appBG);
};
exports.default = updateGlobalBackgroundColor;
