"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
/**
 * Get the unique ID of the current device. This should remain the same even if the user uninstalls and reinstalls the app.
 */
var generateDeviceID = function () { return window.electron.invoke(ELECTRON_EVENTS_1.default.REQUEST_DEVICE_ID); };
exports.default = generateDeviceID;
