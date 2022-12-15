import ELECTRON_EVENTS from '../../../../desktop/ELECTRON_EVENTS';
import BaseLocaleListener from './BaseLocaleListener';

const listenForLocaleChanges = () => {
// Update the system context menus with the localized options.
    BaseLocaleListener.connect(val => window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, val));
};

const LocaleListener = {
    listenForLocaleChanges,
};

export default LocaleListener;
