"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateApp;
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateApp(isProduction) {
    window.electron.send(ELECTRON_EVENTS_1.default.SILENT_UPDATE);
}
