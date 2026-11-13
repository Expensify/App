import CONST from '@src/CONST';

import type {AppStateStatus} from 'react-native';

import {AppState} from 'react-native';

import shouldReportActivity from './shouldReportActivity';

/**
 * Listener that will only fire the callback when the user has become active.
 * @returns callback to unsubscribe
 */
function addBecameActiveListener(callback: () => void): () => void {
    // A plain string, because the Strict TypeScript API types `AppState.currentState` as `string` rather than `AppStateStatus`.
    let previousAppState: string = AppState.currentState ?? CONST.APP_STATE.ACTIVE;

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
