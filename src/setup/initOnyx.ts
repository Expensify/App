import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import initializeLastVisitedPath from './initializeLastVisitedPath';

/*
 * Initialize the Onyx store when the app loads for the first time.
 *
 * Note: This Onyx initialization has been very intentionally placed completely outside of the React lifecycle of the main App component.
 *
 * To understand why we must do this, you must first understand that a typical React Native Android application consists of an Application and an Activity.
 * The project root's index.js runs in the Application, but the main RN `App` component + UI runs in a separate Activity, spawned when you call AppRegistry.registerComponent.
 * When an application launches in a headless JS context (i.e: when woken from a killed state by a push notification), only the Application is available, but not the UI Activity.
 * This means that in a headless context NO REACT CODE IS EXECUTED, and none of your components will mount.
 *
 * However, we still need to use Onyx to update the underlying app data from the headless JS context.
 * Therefore it must be initialized completely outside the React component lifecycle.
 */

export default function initOnyx() {
    Onyx.init({
        keys: ONYXKEYS,

        // Increase the cached key count so that the app works more consistently for accounts with large numbers of reports
        maxCachedKeysCount: 20000,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        initialKeyStates: {
            // Clear any loading and error messages so they do not appear on app startup
            [ONYXKEYS.SESSION]: {loading: false},
            [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA,
            [ONYXKEYS.NETWORK]: CONST.DEFAULT_NETWORK_DATA,
            [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
            [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
            [ONYXKEYS.MODAL]: {
                isVisible: false,
                willAlertModalBecomeVisible: false,
            },
            // Always open the home route on app startup for native platforms by clearing the lastVisitedPath
            [ONYXKEYS.LAST_VISITED_PATH]: initializeLastVisitedPath(),
        },
    });
}
