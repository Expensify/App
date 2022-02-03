import ELECTRON_EVENTS from '../../../../../desktop/ELECTRON_EVENTS';

export default () => {
    window.electronContextBridge.send(ELECTRON_EVENTS.REQUEST_FOCUS_APP);
};
