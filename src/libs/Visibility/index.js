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
    return window.electron
        ? window.electron.send(ELECTRON_EVENTS.REQUEST_VISIBILITY)
        : document.visibilityState === 'visible';
}

export default {
    isVisible,
};
