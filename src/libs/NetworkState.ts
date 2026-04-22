import NetInfo from '@react-native-community/netinfo';
import Onyx from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {onSustainedFailureChange, reset as resetFailureCounters} from './FailureTracker';
import Log from './Log';

let hasRadio = true;
let sustainedFailuresActive = false;
let shouldForceOffline = false;
let failAllRequests = false;
let internetUnreachable = false;
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
    return !hasRadio || internetUnreachable || sustainedFailuresActive || shouldForceOffline || simulatedOffline;
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
 * Called by the NetInfo listener when isInternetReachable transitions to false.
 * With useNativeReachability:false, this means api/Ping failed — a real request outcome,
 * not an OS heuristic. See contributingGuides/NETWORK_STATE_DETECTION.md for details.
 */
function setInternetUnreachable(unreachable: boolean) {
    const wasUnreachable = internetUnreachable;
    internetUnreachable = unreachable;

    if (!wasUnreachable && unreachable) {
        Log.info('[NetworkState] Hard stop: INTERNET_UNREACHABLE — api/Ping reports server unreachable');
        updateState();
    } else if (wasUnreachable && !unreachable) {
        Log.info('[NetworkState] INTERNET_UNREACHABLE cleared');
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

        // A successful request proved connectivity — trigger reconnect to backfill
        // missed Onyx updates. Without this, a backend outage recovery (where NetInfo
        // never transitions false→true) would leave the UI online but stale.
        // Duplicate reconnectApp() calls are safe — SQ deduplicates them.

        // Jitter (0–5s) staggers reconnection across clients after a server-wide outage
        // to avoid a stampede of ReconnectApp calls hitting the backend simultaneously.
        const jitter = Math.floor(Math.random() * CONST.NETWORK.RECONNECT_STAMPEDE_JITTER_MS);
        setTimeout(() => notifyReconnectListeners(), jitter);
    }
}

/**
 * Called when shouldForceOffline changes in Onyx (debug tool).
 */
function setForceOffline(force: boolean) {
    shouldForceOffline = force;
    Log.info(`[NetworkState] shouldForceOffline set to ${force}`);
    updateState();

    if (!force) {
        // Reset so the NetInfo listener sees a genuine transition (e.g. null→true)
        // and fires onReachabilityRestored(). Without this, prevIsInternetReachable
        // is already true (we track real state during force-offline) so the listener
        // sees true→true and skips reconnect.
        prevIsInternetReachable = null;
        NetInfo.refresh();
    }
}

/**
 * Called when shouldFailAllRequests changes in Onyx (test tool).
 * When turned off, clears the artificial sustained failures that
 * FailureTracking middleware accumulated and triggers recovery.
 * Unlike real outages (where NetInfo detects recovery via Ping),
 * shouldFailAllRequests only affects requests through HttpUtils —
 * NetInfo's own Ping stays healthy, so no reachability transition
 * ever fires. We must clear sustained failures explicitly.
 */
function setFailAllRequests(failAll: boolean) {
    failAllRequests = failAll;
    Log.info(`[NetworkState] shouldFailAllRequests set to ${failAll}`);

    if (!failAll && sustainedFailuresActive) {
        sustainedFailuresActive = false;
        resetFailureCounters();
        updateState();

        prevIsInternetReachable = null;
        NetInfo.refresh();
    }
}

/**
 * Called by the NetInfo listener when isInternetReachable transitions to true.
 * Clears all hard stops and notifies reconnect listeners.
 */
function onReachabilityRestored() {
    Log.info('[NetworkState] Internet reachability restored — clearing hard stops');
    hasRadio = true;
    internetUnreachable = false;
    sustainedFailuresActive = false;
    resetFailureCounters();
    updateState();

    // Notify reconnect listeners (Reconnect.ts will handle app data sync)
    notifyReconnectListeners();
}

/**
 * Formats a Date as "yyyy-MM-dd HH:mm:ss.SSS" (DB format).
 * Inlined from DateUtils.getDBTime to avoid a circular dependency:
 * memoize → stats → Log → Network → SequentialQueue → NetworkState → DateUtils → memoize
 */
function formatDBTime(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Returns the current time plus skew in milliseconds in the format expected by the database
 */
function getDBTimeWithSkew(timestamp: string | number = ''): string {
    const datetime = timestamp ? new Date(timestamp) : new Date();
    if (networkTimeSkew > 0) {
        return formatDBTime(new Date(datetime.valueOf() + networkTimeSkew));
    }
    return formatDBTime(datetime);
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
        updateState();

        // Reset so NetInfo listener sees a transition and fires onReachabilityRestored().
        prevIsInternetReachable = null;
        NetInfo.refresh();
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

        // When isInternetReachable transitions to false, api/Ping failed — go offline.
        // Fire on any non-false→false transition (true→false, null→false, undefined→false)
        // to catch cold start with no internet and post-recovery resets where prev is null.
        // Only skip false→false (redundant, already offline).
        if (state.isInternetReachable === false && prevIsInternetReachable !== false) {
            setInternetUnreachable(true);
        }

        // Treat false→true and null→true as genuine recovery. Both mean NetInfo previously
        // lost reachability (false = confirmed unreachable, null = lost track during outage)
        // and has now confirmed it's back. Only block undefined→true — that's the initial
        // NetInfo event on subscribe which delivers current state, not a recovery. Firing
        // onReachabilityRestored() on boot would duplicate openApp()/reconnectApp().
        if (!shouldForceOffline && state.isInternetReachable === true && prevIsInternetReachable !== true && prevIsInternetReachable !== undefined) {
            Log.info(`[NetworkState] Internet reachability restored (${prevIsInternetReachable}→true)`);
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
            // NETWORK key was cleared (e.g. sign-out via clearStorageAndRedirect).
            // Reset in-memory flags so the sign-in flow doesn't think we're offline.
            simulatePoorConnection(false);
            if (shouldForceOffline) {
                setForceOffline(false);
            }
            if (failAllRequests) {
                setFailAllRequests(false);
            }
            return;
        }

        networkTimeSkew = network?.timeSkew ?? 0;

        simulatePoorConnection(!!network.shouldSimulatePoorConnection);

        const currentShouldForceOffline = !!network.shouldForceOffline;
        if (currentShouldForceOffline !== shouldForceOffline) {
            setForceOffline(currentShouldForceOffline);
        }

        const currentFailAllRequests = !!network.shouldFailAllRequests;
        if (currentFailAllRequests !== failAllRequests) {
            setFailAllRequests(currentFailAllRequests);
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

export {
    getIsOffline,
    getLastOfflineAt,
    subscribe,
    onReachabilityConfirmed,
    setHasRadio,
    setInternetUnreachable,
    setSustainedFailures,
    setForceOffline,
    setFailAllRequests,
    getDBTimeWithSkew,
    refresh,
    simulatePoorConnection,
};
