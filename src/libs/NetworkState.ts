import NetInfo from '@react-native-community/netinfo';
import Onyx from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import DateUtils from './DateUtils';
import {onSustainedFailureChange, reset as resetFailureCounters} from './FailureTracker';
import Log from './Log';

let hasRadio = true;
let sustainedFailuresActive = false;
let shouldForceOffline = false;
let simulatedOffline = false;
let lastOfflineAt: string | undefined;

// NetInfo state
let accountID: number | undefined;
let unsubscribeNetInfo: (() => void) | null = null;
let prevIsInternetReachable: boolean | null | undefined;
let isPoorConnectionSimulated: boolean | undefined;
let networkTimeSkew = 0;

// Subscriber sets
const listeners = new Set<() => void>();
const reconnectListeners = new Set<() => void>();

// Wire FailureTracker → NetworkState so sustained failures trigger offline state.
onSustainedFailureChange((active) => setSustainedFailures(active));

function getIsOffline(): boolean {
    return !hasRadio || sustainedFailuresActive || shouldForceOffline || simulatedOffline;
}

function getLastOfflineAt(): string | undefined {
    return lastOfflineAt;
}

/**
 * Subscribe to any offline state change.
 * Returns an unsubscribe function.
 */
function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
}

/**
 * Subscribe to internet-confirmed-reachable events.
 * Returns an unsubscribe function.
 */
function onReachabilityConfirmed(cb: () => void): () => void {
    reconnectListeners.add(cb);
    return () => {
        reconnectListeners.delete(cb);
    };
}

function notifyListeners() {
    for (const cb of listeners) {
        cb();
    }
}

function notifyReconnectListeners() {
    for (const cb of reconnectListeners) {
        cb();
    }
}

function updateState() {
    const offline = getIsOffline();

    if (offline && !lastOfflineAt) {
        lastOfflineAt = new Date().toISOString();
    } else if (!offline) {
        lastOfflineAt = undefined;
    }

    notifyListeners();
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
 * Clears all hard stops and notifies reconnect listeners.
 */
function onReachabilityRestored() {
    Log.info('[NetworkState] Internet reachability restored — clearing hard stops');
    hasRadio = true;
    sustainedFailuresActive = false;
    resetFailureCounters();
    updateState();

    // Notify reconnect listeners (Reconnect.ts will handle app data sync)
    notifyReconnectListeners();
}

/**
 * Returns the current time plus skew in milliseconds in the format expected by the database
 */
function getDBTimeWithSkew(timestamp: string | number = ''): string {
    if (networkTimeSkew > 0) {
        const datetime = timestamp ? new Date(timestamp) : new Date();
        return DateUtils.getDBTime(datetime.valueOf() + networkTimeSkew);
    }
    return DateUtils.getDBTime(timestamp);
}

// --- Poor connection simulation ---

let poorConnectionTimerID: NodeJS.Timeout | undefined;

function simulatePoorConnection(shouldSimulate: boolean) {
    // Starts random network status change when shouldSimulatePoorConnection is turned on
    if (!isPoorConnectionSimulated && shouldSimulate) {
        isPoorConnectionSimulated = true;
        setRandomNetworkStatus(true);
        return;
    }

    // Restore real state when simulation is turned off
    if (isPoorConnectionSimulated && !shouldSimulate) {
        isPoorConnectionSimulated = false;
        clearTimeout(poorConnectionTimerID);
        poorConnectionTimerID = undefined;
        simulatedOffline = false;
        NetInfo.fetch().then((state) => {
            const radio = state.isConnected !== false;
            setHasRadio(radio);
            Log.info(`[NetworkState] Poor connection simulation turned off. Radio: ${radio}`);
        });
    }
}

/** Sets online/offline connection randomly every 2-5 seconds */
function setRandomNetworkStatus(initialCall = false) {
    if (!isPoorConnectionSimulated && !initialCall) {
        return;
    }

    const randomOffline = Math.random() < 0.5;
    const randomInterval = Math.random() * (5000 - 2000) + 2000;
    Log.info(`[NetworkState] Simulating ${randomOffline ? 'offline' : 'online'} for ${randomInterval}ms`);

    simulatedOffline = randomOffline;
    updateState();
    poorConnectionTimerID = setTimeout(setRandomNetworkStatus, randomInterval);
}

// --- NetInfo configuration and subscription ---

/**
 * Configure NetInfo with the reachability URL and subscribe to state changes.
 * Must unsubscribe before calling configure() — configure tears down NetInfo internal state.
 */
function configureAndSubscribe() {
    if (unsubscribeNetInfo) {
        unsubscribeNetInfo();
        unsubscribeNetInfo = null;
    }

    if (!CONFIG.IS_USING_LOCAL_WEB) {
        NetInfo.configure({
            reachabilityUrl: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/Ping?accountID=${accountID ?? 'unknown'}`,
            reachabilityMethod: 'GET',
            reachabilityTest: (response) => {
                if (!response.ok) {
                    return Promise.resolve(false);
                }
                return response
                    .json()
                    .then((json: {jsonCode: number}) => Promise.resolve(json.jsonCode === 200))
                    .catch(() => Promise.resolve(false));
            },
            reachabilityRequestTimeout: CONST.NETWORK.MAX_PENDING_TIME_MS,
            // Use JS fetch polling (api/Ping) on all platforms instead of native OS reachability.
            // This aligns behavior across web and mobile: poll every 60s when reachable, 5s when unreachable.
            useNativeReachability: false,
        });
    }

    unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        const radio = state.isConnected !== false;
        Log.info(`[NetworkState] NetInfo state change: isConnected=${state.isConnected}, isInternetReachable=${state.isInternetReachable}, type=${state.type}`);

        // Always track real radio/reachability state so values are never stale
        // when shouldForceOffline is turned off. Only gate the reconnect side effect.
        setHasRadio(radio);

        if (!shouldForceOffline && state.isInternetReachable === true && prevIsInternetReachable !== true) {
            Log.info('[NetworkState] Internet reachability restored');
            onReachabilityRestored();
        }
        prevIsInternetReachable = state.isInternetReachable;
    });
}

// Subscribe to NetInfo immediately so logged-out screens (login, offline indicator)
// have network detection from the start. Reconfigure when accountID changes to
// update the reachability URL.
configureAndSubscribe();

// --- Onyx subscriptions (inputs for state computation) ---

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        const newAccountID = session?.accountID;
        if (newAccountID === accountID) {
            return;
        }
        accountID = newAccountID;
        configureAndSubscribe();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }

        networkTimeSkew = network?.timeSkew ?? 0;

        simulatePoorConnection(!!network.shouldSimulatePoorConnection);

        const currentShouldForceOffline = !!network.shouldForceOffline;
        if (currentShouldForceOffline !== shouldForceOffline) {
            setForceOffline(currentShouldForceOffline);
        }
    },
});

/**
 * Force NetInfo to re-fetch native network state.
 * Useful when the app comes to foreground while in a hard stop —
 * bypasses stale isInternetReachable cache (see NetInfo issue #326).
 */
function refresh() {
    NetInfo.refresh();
}

export {getIsOffline, getLastOfflineAt, subscribe, onReachabilityConfirmed, setHasRadio, setSustainedFailures, setForceOffline, getDBTimeWithSkew, refresh};
