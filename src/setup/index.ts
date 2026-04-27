import toSortedPolyfill from 'array.prototype.tosorted';
import {I18nManager} from 'react-native';
import Config from 'react-native-config';
import Onyx from 'react-native-onyx';
import intlPolyfill from '@libs/IntlPolyfill';
import {setDeviceID} from '@userActions/Device';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import addUtilsToWindow from './addUtilsToWindow';
import platformSetup from './platformSetup';
import telemetry from './telemetry';

const enableDevTools = Config?.USE_REDUX_DEVTOOLS ? Config.USE_REDUX_DEVTOOLS === 'true' : true;

export default function () {
    telemetry();

    toSortedPolyfill.shim();

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
    Onyx.init({
        keys: ONYXKEYS,
        enableDevTools,
        evictableKeys: [
            ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            ONYXKEYS.COLLECTION.SNAPSHOT,
            ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
            ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
            ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
        ],
        initialKeyStates: {
            // Clear any loading and error messages so they do not appear on app startup
            [ONYXKEYS.SESSION]: {loading: false},
            [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA,
            [ONYXKEYS.RAM_ONLY_IS_SIDEBAR_LOADED]: false,
            [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
            [ONYXKEYS.MODAL]: {
                isVisible: false,
                willAlertModalBecomeVisible: false,
            },
            // Ensure the Supportal permission modal doesn't persist across reloads
            [ONYXKEYS.SUPPORTAL_PERMISSION_DENIED]: null,
            [ONYXKEYS.IS_OPEN_APP_FAILURE_MODAL_OPEN]: false,
        },
        skippableCollectionMemberIDs: CONST.SKIPPABLE_COLLECTION_MEMBER_IDS,
        snapshotMergeKeys: ['pendingAction', 'pendingFields'],
        ramOnlyKeys: [
            ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
            ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE,
            ONYXKEYS.RAM_ONLY_IS_SIDEBAR_LOADED,
            ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS,
            ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE,
            ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED,
            ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS,
            ONYXKEYS.RAM_ONLY_WALLET_ONFIDO,
        ],
    });

    // Must be imported after Onyx.init() and outside the React lifecycle so that push notification
    // handlers are registered before any push arrives, including Android headless/background wake-ups.
    import('@libs/Notification/PushNotification/subscribeToPushNotifications');

    initOnyxDerivedValues();

    setDeviceID();

    // Preload all icons early in app initialization
    // This runs outside React lifecycle for optimal performance
    // Force app layout to work left to right because our design does not currently support devices using this mode
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);

    // Polyfill the Intl API if locale data is not as expected
    intlPolyfill();

    // Perform any other platform-specific setup
    platformSetup();

    addUtilsToWindow();
}
