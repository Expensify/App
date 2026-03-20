import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import AppStateMonitor from '@libs/AppStateMonitor';
import Log from '@libs/Log';
import {flush} from '@libs/Network/SequentialQueue';
import {isOffline, onReachabilityConfirmed as onNetworkReachabilityConfirmed, refresh as refreshNetworkState} from '@libs/NetworkState';
import ONYXKEYS from '@src/ONYXKEYS';
import {openApp, reconnectApp} from './App';

let lastUpdateIDAppliedToClient: OnyxEntry<number>;
let isLoadingApp: OnyxEntry<boolean>;
let currentAccountID: number | undefined;

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

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        currentAccountID = session?.accountID;
    },
});

/**
 * Centralized reconnection logic.
 * Called when recovering from a hard stop or when the app comes to foreground.
 * Syncs app data and flushes the sequential queue.
 */
function reconnect() {
    if (!currentAccountID) {
        Log.info('[Reconnect] Skipping reconnection — no active session');
        return;
    }

    Log.info('[Reconnect] Triggering reconnection');

    if (isLoadingApp) {
        Log.info('[Reconnect] App is still loading, calling openApp');
        openApp();
    } else {
        Log.info('[Reconnect] Calling reconnectApp');
        reconnectApp(lastUpdateIDAppliedToClient);
    }

    // Flush the sequential queue to process any pending write requests
    flush();
}

// Internet confirmed reachable — reconnect
onNetworkReachabilityConfirmed(() => {
    reconnect();
});

// App came to foreground — reconnect to catch up on missed Pusher events
AppStateMonitor.addBecameActiveListener(() => {
    Log.info('[Reconnect] App became active');
    if (isOffline()) {
        refreshNetworkState();
    }
    // Always reconnect on foreground to catch up on missed events
    reconnect();
});

// eslint-disable-next-line import/prefer-default-export -- single export is intentional; more reconnection helpers may be added here as the architecture evolves
export {reconnect};
