import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import NetInfo from '@react-native-community/netinfo';
import {toDate} from 'date-fns-tz';
import Onyx from 'react-native-onyx';

import {getCommandURL} from './ApiUtils';
import getEnvironment from './Environment/getEnvironment';
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
let pendingReachabilityRecovery = false;
let configuredReachabilityUrl: string | undefined;

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
        // A reconnect that coincides with one already in flight is collapsed at push time by the
        // reconnect coverage resolver (resolveReconnectDuplicationConflictAction): a redundant one is
        // dropped, a wider one runs after. It consults the ongoing request and the waiting queue.

        // Jitter (0–5s) staggers reconnection across clients after a server-wide outage
        // to avoid a stampede of ReconnectApp calls hitting the backend simultaneously.
        const jitter = Math.floor(Math.random() * CONST.NETWORK.RECONNECT_STAMPEDE_JITTER_MS);
        setTimeout(() => notifyReconnectListeners(), jitter);
    }
}

/**
 * The debug paths clear their hard stop right away, so when the refreshed Ping confirms
 * reachability the app already looks online and the listener would ignore it. The token
 * allows that one recovery. Resetting prev makes the listener see a transition again.
 */
function armReachabilityRecovery() {
    prevIsInternetReachable = null;
    pendingReachabilityRecovery = true;
    NetInfo.refresh();
}

/**
 * Called when shouldForceOffline changes in Onyx (debug tool).
 */
function setForceOffline(force: boolean) {
    shouldForceOffline = force;
    Log.info(`[NetworkState] shouldForceOffline set to ${force}`);
    updateState();

    if (!force) {
        armReachabilityRecovery();
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

        armReachabilityRecovery();
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

/**
 * Like getDBTimeWithSkew, but applies networkTimeSkew in both directions so the result tracks the server
 * clock even when the client runs ahead. getDBTimeWithSkew only pushes forward (to avoid reordering), so it
 * can't be reused. Keeps the Concierge session boundary and question comparable to server-stamped replies.
 * Relies on networkTimeSkew being set; before it is known the value falls back to the raw client clock.
 *
 * notBeforeDBTime clamps the result forward so it never predates that time — used to keep successive optimistic
 * sends monotonic when skew shifts negative between them (otherwise a later send could sort above an earlier one).
 */
function getServerAnchoredDBTime(timestamp: string | number = '', notBeforeDBTime?: string): string {
    const datetime = timestamp ? new Date(timestamp) : new Date();
    let anchoredMs = datetime.valueOf() + networkTimeSkew;
    if (notBeforeDBTime) {
        const floorMs = toDate(notBeforeDBTime, {timeZone: 'UTC'}).valueOf();
        if (Number.isFinite(floorMs) && anchoredMs <= floorMs) {
            anchoredMs = floorMs + 1;
        }
    }
    return formatDBTime(new Date(anchoredMs));
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

        armReachabilityRecovery();
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

function buildReachabilityUrl(): string {
    return `${getCommandURL({command: 'Ping'})}accountID=${accountID ?? 'unknown'}`;
}

/**
 * Configure NetInfo with the reachability URL and subscribe to state changes.
 * Must unsubscribe before calling configure() — configure tears down NetInfo internal state.
 */
function configureAndSubscribe() {
    if (unsubscribeNetInfo) {
        unsubscribeNetInfo();
        unsubscribeNetInfo = null;
    }

    configuredReachabilityUrl = buildReachabilityUrl();

    if (!CONFIG.IS_USING_LOCAL_WEB) {
        NetInfo.configure({
            reachabilityUrl: configuredReachabilityUrl,
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

        // Treat a confirmed-reachable event as a recovery only when the app was actually offline
        // or a debug path asked for one. Everything else (boot, re-subscription, refresh() re-emits)
        // is a re-read of an unchanged network and must not fire reconnectApp.
        if (!shouldForceOffline && state.isInternetReachable === true && prevIsInternetReachable !== true) {
            if (getIsOffline() || pendingReachabilityRecovery) {
                pendingReachabilityRecovery = false;
                Log.info(`[NetworkState] Internet reachability restored (${prevIsInternetReachable}→true)`);
                onReachabilityRestored();
            } else {
                Log.info(`[NetworkState] Ignoring reachability re-confirmation (${prevIsInternetReachable}→true) since the app was never offline`);
            }
        }
        prevIsInternetReachable = state.isInternetReachable;
    });
}

// Subscribe to NetInfo once getEnvironment() resolves so the first ping uses the correct root.
// queueMicrotask defers configureAndSubscribe past the current tick so ApiUtils' own
// SHOULD_USE_STAGING_SERVER Onyx callback — which is the source of truth for getApiRoot() — has
// already updated its cached flag. Without this defer, configureAndSubscribe samples ApiUtils'
// stale module-level flag and bakes the wrong reachabilityUrl into NetInfo.
getEnvironment().then(() => {
    queueMicrotask(configureAndSubscribe);
});

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

// Re-target the reachability ping when the staging-server toggle flips at runtime.
// queueMicrotask waits for ApiUtils' callback on the same key, which owns the flag behind
// getApiRoot(). Skip the rebuild when the URL is unchanged: rebuilding tears down NetInfo
// state and fires extra Pings, and the raw toggle can flip without changing the URL.
Onyx.connectWithoutView({
    key: ONYXKEYS.SHOULD_USE_STAGING_SERVER,
    callback: () => {
        queueMicrotask(() => {
            if (buildReachabilityUrl() === configuredReachabilityUrl) {
                return;
            }
            configureAndSubscribe();
        });
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
    getServerAnchoredDBTime,
    refresh,
    simulatePoorConnection,
};
