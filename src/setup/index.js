import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import listenToStorageEvents from '../libs/listenToStorageEvents';
import Log from '../libs/Log';
import platformSetup from './platformSetup';
import {canCaptureOnyxMetrics} from '../libs/canCaptureMetrics';

export default function () {
    // Initialize the Onyx store when the app loads for the first time.
    // Note: This Onyx initialization has been very intentionally placed outside of the React lifecycle of the main App component.
    //       This enables us to use Onyx in a headless JS context (i.e: to update Onyx data in response to a push notification received when the app is completely killed).
    //       More info here: https://github.com/transistorsoft/react-native-background-fetch/issues/165#issuecomment-514255928
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        captureMetrics: canCaptureOnyxMetrics(),
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
        registerStorageEventListener: (onStorageEvent) => {
            listenToStorageEvents(onStorageEvent);
        },
    });

    Onyx.registerLogger(({level, message}) => {
        if (level === 'alert') {
            Log.alert(message, 0, {}, false);
        } else {
            Log.client(message);
        }
    });

    // Perform any other platform-specific setup
    platformSetup();
}
