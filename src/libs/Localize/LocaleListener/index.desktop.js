import ELECTRON_EVENTS from '../../../../desktop/ELECTRON_EVENTS';
import BaseLocaleListener from './BaseLocaleListener';

const connect = () => {
    // Send the updated locale to the Electron main process
    BaseLocaleListener.connect(val => window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val));
};

export default {
    connect,
};
