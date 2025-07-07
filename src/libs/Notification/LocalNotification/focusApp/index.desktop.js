"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
var focusApp = function () {
    window.electron.send(ELECTRON_EVENTS_1.default.REQUEST_FOCUS_APP);
};
exports.default = focusApp;
