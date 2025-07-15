import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import type LocaleEventCallback from './types';

const localeEventCallback: LocaleEventCallback = (value) => {
    // Send the updated locale to the Electron main process
    window.electron.send(ELECTRON_EVENTS.LOCALE_UPDATED, value);
};

export default localeEventCallback;
