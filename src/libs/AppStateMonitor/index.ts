import type {AppStateStatus} from 'react-native';
import {AppState} from 'react-native';
import CONST from '@src/CONST';
import shouldReportActivity from './shouldReportActivity';

/**
 * Listener that will only fire the callback when the user has become active.
 * @returns callback to unsubscribe
 */
function addBecameActiveListener(callback: () => void): () => void {
    let previousAppState: AppStateStatus = AppState.currentState ?? CONST.APP_STATE.ACTIVE;

    function appStateChangeCallback(state: AppStateStatus) {
        if (shouldReportActivity && (previousAppState === CONST.APP_STATE.INACTIVE || previousAppState === CONST.APP_STATE.BACKGROUND) && state === CONST.APP_STATE.ACTIVE) {
            callback();
        }
        previousAppState = state;
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
