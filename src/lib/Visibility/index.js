const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

function isVisible() {
    if (ipcRenderer) {
        return ipcRenderer.sendSync('request-visibility');
    }

    return document.visibilityState === 'visible';
}

export default {
    isVisible,
};
