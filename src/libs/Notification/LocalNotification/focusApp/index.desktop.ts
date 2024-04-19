import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import type FocusApp from './types';

const focusApp: FocusApp = () => {
    window.electron.send(ELECTRON_EVENTS.REQUEST_FOCUS_APP);
};

export default focusApp;
