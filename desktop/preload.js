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
    ELECTRON_EVENTS.UPDATE_DOWNLOADED,
];

contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        if (!_.contains(WHITELIST_CHANNELS_RENDERER_TO_MAIN, channel)) {
            // eslint-disable-next-line no-console
            console.warn(`Attempt to send data across electron context bridge with invalid channel ${channel}`);
            return;
        }

        ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
        if (!_.contains(WHITELIST_CHANNELS_MAIN_TO_RENDERER, channel)) {
            // eslint-disable-next-line no-console
            console.warn(`Attempt to send data across electron context bridge with invalid channel ${channel}`);
            return;
        }

        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
});
