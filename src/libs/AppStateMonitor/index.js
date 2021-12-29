import {AppState} from 'react-native';
import CONST from '../../CONST';
import shouldReportActivity from './shouldReportActivity';

let appState = CONST.APP_STATE.ACTIVE;

/**
 * Listener that will only fire the callback when the user has become active.
 *
 * @param {Function} callback
 * @returns {Function} to unsubscribe
 */
function addBecameActiveListener(callback) {
    /**
     * @param {String} state
     */
    function appStateChangeCallback(state) {
        if (
            shouldReportActivity
            && (appState === CONST.APP_STATE.INACTIVE || appState === CONST.APP_STATE.BACKGROUND)
            && state === CONST.APP_STATE.ACTIVE
        ) {
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
