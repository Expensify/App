import ELECTRON_EVENTS from '../../../../../desktop/ELECTRON_EVENTS';

export default () => {
    window.electron.send(ELECTRON_EVENTS.REQUEST_FOCUS_APP);
};
