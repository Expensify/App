"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
/**
 * Set the badge on desktop
 *
 */
var updateUnread = function (totalCount) {
    // Ask the main Electron process to update our
    // badge count in the Mac OS dock icon
    window.electron.send(ELECTRON_EVENTS_1.default.REQUEST_UPDATE_BADGE_COUNT, totalCount);
};
exports.default = updateUnread;
