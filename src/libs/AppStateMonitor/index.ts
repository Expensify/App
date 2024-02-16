import type {AppStateStatus} from 'react-native';
import {AppState} from 'react-native';
import CONST from '@src/CONST';
import shouldReportActivity from './shouldReportActivity';

let appState: AppStateStatus = CONST.APP_STATE.ACTIVE;

/**
 * Listener that will only fire the callback when the user has become active.
 * @returns callback to unsubscribe
 */
function addBecameActiveListener(callback: () => void): () => void {
    function appStateChangeCallback(state: AppStateStatus) {
        if (shouldReportActivity && (appState === CONST.APP_STATE.INACTIVE || appState === CONST.APP_STATE.BACKGROUND) && state === CONST.APP_STATE.ACTIVE) {
            callback();
        }
        appState = state;
    }
    const appStateChangeSubscription = AppState.addEventListener('change', appStateChangeCallback);
    return () => {
        if (!appStateChangeSubscription) {
            return;
        }
        appStateChangeSubscription.remove();
    };
}

export default {
    addBecameActiveListener,
};
