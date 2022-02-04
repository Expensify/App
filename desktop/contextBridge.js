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
    /**
     * Send data asynchronously from renderer process to main process.
     * Note that this is a one-way channel – main will not respond. In order to get a response from main, either:
     *
     * - Use `sendSync`
     * - Or implement `invoke` if you want to maintain asynchronous communication: https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
     *
     * @param {String} channel
     * @param {*} data
     */
    send: (channel, data) => {
        if (!_.contains(WHITELIST_CHANNELS_RENDERER_TO_MAIN, channel)) {
            throw new Error(`Attempt to send data across electron context bridge with invalid channel ${channel}`);
        }

        ipcRenderer.send(channel, data);
    },

    /**
     * Send data synchronously from renderer process to main process. Main process may return a result.
     *
     * @param {String} channel
     * @param {*} data
     * @returns {*}
     */
    sendSync: (channel, data) => {
        if (!_.contains(WHITELIST_CHANNELS_RENDERER_TO_MAIN, channel)) {
            throw new Error(`Attempt to send data across electron context bridge with invalid channel ${channel}`);
        }

        return ipcRenderer.sendSync(channel, data);
    },

    /**
     * Set up a listener for events emitted from the main process and sent to the renderer process.
     *
     * @param {String} channel
     * @param {Function} func
     */
    on: (channel, func) => {
        if (!_.contains(WHITELIST_CHANNELS_MAIN_TO_RENDERER, channel)) {
            throw new Error(`Attempt to send data across electron context bridge with invalid channel ${channel}`);
        }

        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
});
