import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';

/**
 * Detects whether the app is visible or not. Electron supports
 * document.visibilityState, but switching to another app while
 * Electron is partially occluded will not trigger a state of hidden
 * so we ask the main process synchronously whether the
 * BrowserWindow.isFocused()
 *
 * @returns {Boolean}
 */
function isVisible() {
    return window.electron.sendSync(ELECTRON_EVENTS.REQUEST_VISIBILITY);
}

/**
 * Event subscription for changes in visibility state
 *
 * @param {Function} callback
 *
 * @return {Object} To have .remove() invoked to remove listener
 */
function onChange(callback) {
    window.electron.on(ELECTRON_EVENTS.FOCUS, callback);
    window.electron.on(ELECTRON_EVENTS.BLUR, callback);

    return {
        remove: () => {
            window.electron.removeAllListeners(ELECTRON_EVENTS.FOCUS);
            window.electron.removeAllListeners(ELECTRON_EVENTS.BLUR);
        },
    };
}

export default {
    isVisible,
    onChange,
};
