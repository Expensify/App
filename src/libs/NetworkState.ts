import NetInfo from '@react-native-community/netinfo';
import {setIsOffline} from './actions/Network';
import {reconnect} from './actions/Reconnect';
import AppStateMonitor from './AppStateMonitor';
import {onSustainedFailureChange, resetCounters as resetFailureCounters} from './FailureTracker';
import Log from './Log';
import {pause, unpause} from './Network/SequentialQueue';

let hasRadio = true;
let sustainedFailuresActive = false;
let shouldForceOffline = false;

// Wire FailureTracker → NetworkState (avoids circular dependency)
onSustainedFailureChange((active) => setSustainedFailures(active));

function isInHardStop(): boolean {
    return !hasRadio || sustainedFailuresActive || shouldForceOffline;
}

function updateState() {
    const offline = isInHardStop();
    setIsOffline(offline, `hard stop: noRadio=${!hasRadio}, sustainedFailures=${sustainedFailuresActive}, forceOffline=${shouldForceOffline}`);

    if (offline) {
        pause();
    } else {
        unpause();
    }
}

/**
 * Called by the NetInfo listener when the OS reports radio status changes.
 * `hasRadio=false` means airplane mode / WiFi off / no cellular.
 */
function setHasRadio(connected: boolean) {
    const hadRadio = hasRadio;
    hasRadio = connected;

    if (hadRadio && !hasRadio) {
        Log.info('[NetworkState] Hard stop: NO_RADIO — OS reports no network interface');
        updateState();
    } else if (!hadRadio && hasRadio) {
        Log.info('[NetworkState] NO_RADIO cleared — OS reports radio is back');
        updateState();
    }
}

/**
 * Called by FailureTracker when sustained request failures are detected.
 */
function setSustainedFailures(active: boolean) {
    const wasActive = sustainedFailuresActive;
    sustainedFailuresActive = active;

    if (!wasActive && active) {
        Log.info('[NetworkState] Hard stop: SUSTAINED_FAILURES — requests have been failing consistently');
        updateState();
    } else if (wasActive && !active) {
        Log.info('[NetworkState] SUSTAINED_FAILURES cleared');
        updateState();
    }
}

/**
 * Called when shouldForceOffline changes in Onyx (debug tool).
 */
function setForceOffline(force: boolean) {
    shouldForceOffline = force;
    Log.info(`[NetworkState] shouldForceOffline set to ${force}`);
    updateState();
}

/**
 * Called by the NetInfo listener when isInternetReachable transitions to true.
 * Clears all hard stops and triggers reconnect.
 */
function onReachabilityRestored() {
    Log.info('[NetworkState] Internet reachability restored — clearing hard stops and reconnecting');
    hasRadio = true;
    sustainedFailuresActive = false;
    resetFailureCounters();
    updateState();

    // Trigger app data sync
    reconnect();
}

/**
 * Wire app foreground listener.
 * - If in hard stop → refresh NetInfo to force a fresh native state fetch
 * - Always → reconnect to catch up on missed data
 */
function initAppForegroundListener() {
    AppStateMonitor.addBecameActiveListener(() => {
        Log.info('[NetworkState] App became active');
        if (isInHardStop() && !shouldForceOffline) {
            NetInfo.refresh();
        }
        // Always reconnect on foreground to catch up on missed Pusher events
        reconnect();
    });
}

export default {
    isInHardStop,
    setHasRadio,
    setSustainedFailures,
    setForceOffline,
    onReachabilityRestored,
    initAppForegroundListener,
};
