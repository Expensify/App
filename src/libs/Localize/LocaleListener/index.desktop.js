import ELECTRON_EVENTS from '../../../../desktop/ELECTRON_EVENTS';
import BaseLocaleListener from './BaseLocaleListener';

const connect = (callback) => {
    BaseLocaleListener.connect((val) => {
    	callback(val);

    	// Send the updated locale to the Electron main process
    	window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val);
    });
};
    // Send the updated locale to the Electron main process
    BaseLocaleListener.connect(val => window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val));
};

const LocaleListener = {
    listenForLocaleChanges,
};

export default LocaleListener;
