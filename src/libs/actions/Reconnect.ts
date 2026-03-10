import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import {flush} from '@libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import * as App from './App';

let lastUpdateIDAppliedToClient: OnyxEntry<number>;
let isLoadingApp: OnyxEntry<boolean>;

Onyx.connectWithoutView({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => {
        lastUpdateIDAppliedToClient = val;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (val) => {
        isLoadingApp = val;
    },
});

/**
 * Centralized reconnection logic.
 * Called when recovering from a hard stop or when the app comes to foreground.
 * Syncs app data and flushes the sequential queue.
 */
function reconnect() {
    Log.info('[Reconnect] Triggering reconnection');

    if (isLoadingApp) {
        Log.info('[Reconnect] App is still loading, calling openApp');
        App.openApp();
    } else {
        Log.info('[Reconnect] Calling reconnectApp');
        App.reconnectApp(lastUpdateIDAppliedToClient);
    }

    // Flush the sequential queue to process any pending write requests
    flush();
}

// eslint-disable-next-line import/prefer-default-export
export {reconnect};
