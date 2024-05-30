import {contextBridge, ipcRenderer} from 'electron';
import ELECTRON_EVENTS from './ELECTRON_EVENTS';

type ContextBridgeApi = {
    send: (channel: string, data?: unknown) => void;
    sendSync: (channel: string, data?: unknown) => unknown;
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    on: (channel: string, func: (...args: unknown[]) => void) => void;
    removeAllListeners: (channel: string) => void;
};

const WHITELIST_CHANNELS_RENDERER_TO_MAIN = [
    ELECTRON_EVENTS.REQUEST_DEVICE_ID,
    ELECTRON_EVENTS.REQUEST_FOCUS_APP,
    ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT,
    ELECTRON_EVENTS.REQUEST_VISIBILITY,
    ELECTRON_EVENTS.START_UPDATE,
    ELECTRON_EVENTS.LOCALE_UPDATED,
    ELECTRON_EVENTS.DOWNLOAD,
    ELECTRON_EVENTS.SILENT_UPDATE,
] as const;

const WHITELIST_CHANNELS_MAIN_TO_RENDERER = [
    ELECTRON_EVENTS.KEYBOARD_SHORTCUTS_PAGE,
    ELECTRON_EVENTS.UPDATE_DOWNLOADED,
    ELECTRON_EVENTS.FOCUS,
    ELECTRON_EVENTS.BLUR,
    ELECTRON_EVENTS.DOWNLOAD_COMPLETED,
    ELECTRON_EVENTS.DOWNLOAD_FAILED,
    ELECTRON_EVENTS.DOWNLOAD_CANCELED,
] as const;

const getErrorMessage = (channel: string): string => `Electron context bridge cannot be used with channel '${channel}'`;

/**
 * The following methods will be available in the renderer process under `window.electron`.
 */
contextBridge.exposeInMainWorld('electron', {
    /**
     * Send data asynchronously from renderer process to main process.
     * Note that this is a one-way channel – main will not respond. In order to get a response from main, either:
     *
     * - Use `sendSync`
     * - Or implement `invoke` if you want to maintain asynchronous communication: https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
     */
    send: (channel: string, data: unknown) => {
        if (!WHITELIST_CHANNELS_RENDERER_TO_MAIN.some((whitelistChannel) => whitelistChannel === channel)) {
            throw new Error(getErrorMessage(channel));
        }

        ipcRenderer.send(channel, data);
    },

    /** Send data synchronously from renderer process to main process. Main process may return a result. */
    sendSync: (channel: string, data: unknown): unknown => {
        if (!WHITELIST_CHANNELS_RENDERER_TO_MAIN.some((whitelistChannel) => whitelistChannel === channel)) {
            throw new Error(getErrorMessage(channel));
        }

        return ipcRenderer.sendSync(channel, data);
    },

    /** Execute a function in the main process and return a promise that resolves with its response. */
    invoke: (channel: string, ...args: unknown[]): Promise<unknown> => {
        if (!WHITELIST_CHANNELS_RENDERER_TO_MAIN.some((whitelistChannel) => whitelistChannel === channel)) {
            throw new Error(getErrorMessage(channel));
        }

        return ipcRenderer.invoke(channel, ...args);
    },

    /** Set up a listener for events emitted from the main process and sent to the renderer process. */
    on: (channel: string, func: (...args: unknown[]) => void) => {
        if (!WHITELIST_CHANNELS_MAIN_TO_RENDERER.some((whitelistChannel) => whitelistChannel === channel)) {
            throw new Error(getErrorMessage(channel));
        }

        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args: unknown[]) => func(...args));
    },

    /** Remove listeners for a single channel from the main process and sent to the renderer process. */
    removeAllListeners: (channel: string) => {
        if (!WHITELIST_CHANNELS_MAIN_TO_RENDERER.some((whitelistChannel) => whitelistChannel === channel)) {
            throw new Error(getErrorMessage(channel));
        }

        ipcRenderer.removeAllListeners(channel);
    },
});

export default ContextBridgeApi;
