"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
var localeEventCallback = function (value) {
    // Send the updated locale to the Electron main process
    window.electron.send(ELECTRON_EVENTS_1.default.LOCALE_UPDATED, value);
};
exports.default = localeEventCallback;
