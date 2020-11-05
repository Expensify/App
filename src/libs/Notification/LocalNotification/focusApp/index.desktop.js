import ELECTRON_EVENTS from '../../../../../desktop/ELECTRON_EVENTS';

const ipcRenderer = window.require('electron').ipcRenderer;

export default () => {
    ipcRenderer.send(ELECTRON_EVENTS.REQUEST_FOCUS_APP);
};
