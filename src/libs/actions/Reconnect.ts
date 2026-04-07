import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import AppStateMonitor from '@libs/AppStateMonitor';
import Log from '@libs/Log';
import {flush} from '@libs/Network/SequentialQueue';
import {getIsOffline, onReachabilityConfirmed as onNetworkReachabilityConfirmed, refresh as refreshNetworkState, subscribe as subscribeNetworkState} from '@libs/NetworkState';
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
 * Syncs app data with the server — fetches missed Onyx updates.
 * Queue flushing is handled separately by the offline→online subscriber below.
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
}

// Internet confirmed reachable — reconnect
onNetworkReachabilityConfirmed(() => {
    reconnect();
});

// Any offline→online transition — flush the sequential queue
let wasOffline = getIsOffline();
subscribeNetworkState(() => {
    const offline = getIsOffline();
    if (wasOffline && !offline) {
        Log.info('[Reconnect] Offline→online, flushing queue');
        flush();
    }
    wasOffline = offline;
});

// App came to foreground — sync data and flush queue
AppStateMonitor.addBecameActiveListener(() => {
    Log.info('[Reconnect] App became active');
    if (getIsOffline()) {
        refreshNetworkState();
    }
    reconnect();
    flush();
});

// eslint-disable-next-line import/prefer-default-export -- single export is intentional; more reconnection helpers may be added here as the architecture evolves
export {reconnect};
