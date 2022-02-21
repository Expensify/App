// eslint-disable-next-line no-restricted-imports
import {I18nManager, TextInput} from 'react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import platformSetup from './platformSetup';
import * as Metrics from '../libs/Metrics';

export default function () {
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
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        captureMetrics: Metrics.canCaptureOnyxMetrics(),
        initialKeyStates: {

            // Clear any loading and error messages so they do not appear on app startup
            [ONYXKEYS.SESSION]: {loading: false, shouldShowComposeInput: true},
            [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA,
            [ONYXKEYS.NETWORK]: {isOffline: false},
            [ONYXKEYS.IOU]: {
                loading: false, error: false, creatingIOUTransaction: false, isRetrievingCurrency: false,
            },
            [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
        },
    });

    // force app layout to work left to right.
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
    I18nManager.swapLeftAndRightInRTL(false);
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.textAlign = 'left';

    // Perform any other platform-specific setup
    platformSetup();
}
