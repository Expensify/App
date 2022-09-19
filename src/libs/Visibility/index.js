import {AppState} from 'react-native';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';

/**
 * Detects whether the app is visible or not. Electron supports
 * document.visibilityState, but switching to another app while
 * Electron is partially occluded will not trigger a state of hidden
 * so we ask the main process synchronously whether the
 * BrowserWindow.isFocused()
 *
 * However, when the AppState is active, we want to use document.visibilityState.
 * For example, when expanding the window after minimizing, BrowserWindow.isFocused()
 * is false even if it is fully visible in the foreground.
 *
 * @returns {Boolean}
 */
function isVisible() {
    if (window.electron && AppState.currentState !== 'active') {
        return window.electron.sendSync(ELECTRON_EVENTS.REQUEST_VISIBILITY);
    }

    return document.visibilityState === 'visible';
}

export default {
    isVisible,
};
