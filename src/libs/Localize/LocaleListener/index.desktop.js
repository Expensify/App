import ELECTRON_EVENTS from '../../../../desktop/ELECTRON_EVENTS';
import BaseLocaleListener from './BaseLocaleListener';

export default {
    // Send the updated locale to the Electron main process
    connect: () => BaseLocaleListener.connect(val => window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val)),
};
