import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';
import {HasFocus, IsVisible, OnVisibilityChange} from './types';

/**
 * Detects whether the app is visible or not. Electron supports document.visibilityState,
 * but switching to another app while Electron is partially occluded will not trigger a state of hidden
 * so we ask the main process synchronously whether the BrowserWindow.isFocused()
 */
const isVisible: IsVisible = () => !!window.electron.sendSync(ELECTRON_EVENTS.REQUEST_VISIBILITY);

const hasFocus: HasFocus = () => true;

/**
 * Adds event listener for changes in visibility state
 */
const onVisibilityChange: OnVisibilityChange = (callback) => {
    // Deliberately strip callback argument to be consistent across implementations
    window.electron.on(ELECTRON_EVENTS.FOCUS, () => callback());
    window.electron.on(ELECTRON_EVENTS.BLUR, () => callback());

    return () => {
        window.electron.removeAllListeners(ELECTRON_EVENTS.FOCUS);
        window.electron.removeAllListeners(ELECTRON_EVENTS.BLUR);
    };
};

export default {
    isVisible,
    onVisibilityChange,
    hasFocus,
};
