import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import Visibility from '@libs/Visibility';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type BackgroundRefresh from './types';

function getLastOnyxUpdateID(): Promise<number | null> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (lastUpdateIDAppliedToClient) => {
                Onyx.disconnect(connectionID);
                resolve(lastUpdateIDAppliedToClient);
            },
        });
    });
}

/**
 * Runs our reconnectApp action if the app is in the background.
 *
 * We use this to refresh the app in the background after receiving a push notification (native only). Since the full app
 * wakes on iOS and by extension runs reconnectApp already, this is a no-op on everything but Android.
 */
const backgroundRefresh: BackgroundRefresh = () => {
    if (Visibility.isVisible()) {
        return;
    }

    getLastOnyxUpdateID()
        .then((lastUpdateIDAppliedToClient) => {
            /**
             * ReconnectApp waits on the isReadyToOpenApp promise to resolve and this normally only resolves when the LHN is rendered.
             * However on Android, this callback is run in the background using a Headless JS task which does not render the React UI,
             * so we must manually run confirmReadyToOpenApp here instead.
             *
             * See more here: https://reactnative.dev/docs/headless-js-android
             */
            App.confirmReadyToOpenApp();
            Log.info('[PushNotification] Sending ReconnectApp');
            App.reconnectApp(lastUpdateIDAppliedToClient ?? undefined);
        })
        .catch((error) => {
            Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} [PushNotification] backgroundRefresh failed. This should never happen.`, {error});
        });
};

export default backgroundRefresh;
