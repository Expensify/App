// We conditionally import the ipcRenderer here so that we can
// communicate with the main Electron process in main.js
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

/**
 * Detects whether the app is visible or not. Electron supports
 * document.visibilityState, but switching to another app does not
 * always trigger a state of hidden so we ask the main process synchronously
 * whether the BrowserWindow.isFocused()
 *
 * See: https://github.com/electron/electron/issues/8664
 *
 * @returns {Boolean}
 */
function isVisible() {
    return ipcRenderer
        ? ipcRenderer.sendSync('request-visibility')
        : document.visibilityState === 'visible';
}

export default {
    isVisible,
};
