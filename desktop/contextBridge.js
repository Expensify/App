const _ = require('underscore');
const {
    contextBridge,
    ipcRenderer,
} = require('electron');
const ELECTRON_EVENTS = require('./ELECTRON_EVENTS');

const WHITELIST_CHANNELS_RENDERER_TO_MAIN = [
    ELECTRON_EVENTS.REQUEST_FOCUS_APP,
    ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT,
    ELECTRON_EVENTS.REQUEST_VISIBILITY,
    ELECTRON_EVENTS.START_UPDATE,
];

const WHITELIST_CHANNELS_MAIN_TO_RENDERER = [
    ELECTRON_EVENTS.SHOW_KEYBOARD_SHORTCUTS_MODAL,
    ELECTRON_EVENTS.UPDATE_DOWNLOADED,
];

contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        if (!_.contains(WHITELIST_CHANNELS_RENDERER_TO_MAIN, channel)) {
            throw new Error(`Attempt to send data across electron context bridge with invalid channel ${channel}`);
        }

        ipcRenderer.send(channel, data);
    },
    sendSync: (channel, data) => {
        if (!_.contains(WHITELIST_CHANNELS_RENDERER_TO_MAIN, channel)) {
            throw new Error(`Attempt to send data across electron context bridge with invalid channel ${channel}`);
        }

        return ipcRenderer.sendSync(channel, data);
    },
    on: (channel, func) => {
        if (!_.contains(WHITELIST_CHANNELS_MAIN_TO_RENDERER, channel)) {
            throw new Error(`Attempt to send data across electron context bridge with invalid channel ${channel}`);
        }

        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
});
