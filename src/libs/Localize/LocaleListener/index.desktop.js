import ELECTRON_EVENTS from '../../../../desktop/ELECTRON_EVENTS';
import BaseLocaleListener from './BaseLocaleListener';

const listenForLocaleChanges = () => {
    // Send the updated locale to the Electron main process
    BaseLocaleListener.connect(val => window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val));
};

const LocaleListener = {
    listenForLocaleChanges,
};

export default LocaleListener;
