"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var ELECTRON_EVENTS_1 = require("./ELECTRON_EVENTS");
var WHITELIST_CHANNELS_RENDERER_TO_MAIN = [
    ELECTRON_EVENTS_1.default.REQUEST_DEVICE_ID,
    ELECTRON_EVENTS_1.default.REQUEST_FOCUS_APP,
    ELECTRON_EVENTS_1.default.REQUEST_UPDATE_BADGE_COUNT,
    ELECTRON_EVENTS_1.default.REQUEST_VISIBILITY,
    ELECTRON_EVENTS_1.default.START_UPDATE,
    ELECTRON_EVENTS_1.default.LOCALE_UPDATED,
    ELECTRON_EVENTS_1.default.DOWNLOAD,
    ELECTRON_EVENTS_1.default.SILENT_UPDATE,
    ELECTRON_EVENTS_1.default.OPEN_LOCATION_SETTING,
];
var WHITELIST_CHANNELS_MAIN_TO_RENDERER = [
    ELECTRON_EVENTS_1.default.KEYBOARD_SHORTCUTS_PAGE,
    ELECTRON_EVENTS_1.default.UPDATE_DOWNLOADED,
    ELECTRON_EVENTS_1.default.FOCUS,
    ELECTRON_EVENTS_1.default.BLUR,
    ELECTRON_EVENTS_1.default.DOWNLOAD_COMPLETED,
    ELECTRON_EVENTS_1.default.DOWNLOAD_FAILED,
    ELECTRON_EVENTS_1.default.DOWNLOAD_CANCELED,
];
var getErrorMessage = function (channel) { return "Electron context bridge cannot be used with channel '".concat(channel, "'"); };
/**
 * The following methods will be available in the renderer process under `window.electron`.
 */
electron_1.contextBridge.exposeInMainWorld('electron', {
    /**
     * Send data asynchronously from renderer process to main process.
     * Note that this is a one-way channel – main will not respond. In order to get a response from main, either:
     *
     * - Use `sendSync`
     * - Or implement `invoke` if you want to maintain asynchronous communication: https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
     */
    send: function (channel, data) {
        if (!WHITELIST_CHANNELS_RENDERER_TO_MAIN.some(function (whitelistChannel) { return whitelistChannel === channel; })) {
            throw new Error(getErrorMessage(channel));
        }
        electron_1.ipcRenderer.send(channel, data);
    },
    /** Send data synchronously from renderer process to main process. Main process may return a result. */
    sendSync: function (channel, data) {
        if (!WHITELIST_CHANNELS_RENDERER_TO_MAIN.some(function (whitelistChannel) { return whitelistChannel === channel; })) {
            throw new Error(getErrorMessage(channel));
        }
        return electron_1.ipcRenderer.sendSync(channel, data);
    },
    /** Execute a function in the main process and return a promise that resolves with its response. */
    invoke: function (channel) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!WHITELIST_CHANNELS_RENDERER_TO_MAIN.some(function (whitelistChannel) { return whitelistChannel === channel; })) {
            throw new Error(getErrorMessage(channel));
        }
        return electron_1.ipcRenderer.invoke.apply(electron_1.ipcRenderer, __spreadArray([channel], args, false));
    },
    /** Set up a listener for events emitted from the main process and sent to the renderer process. */
    on: function (channel, func) {
        if (!WHITELIST_CHANNELS_MAIN_TO_RENDERER.some(function (whitelistChannel) { return whitelistChannel === channel; })) {
            throw new Error(getErrorMessage(channel));
        }
        // Deliberately strip event as it includes `sender`
        electron_1.ipcRenderer.on(channel, function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return func.apply(void 0, args);
        });
    },
    /** Remove listeners for a single channel from the main process and sent to the renderer process. */
    removeAllListeners: function (channel) {
        if (!WHITELIST_CHANNELS_MAIN_TO_RENDERER.some(function (whitelistChannel) { return whitelistChannel === channel; })) {
            throw new Error(getErrorMessage(channel));
        }
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
});
