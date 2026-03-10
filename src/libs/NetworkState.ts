import {setIsOffline} from './actions/Network';
import {reconnect} from './actions/Reconnect';
import AppStateMonitor from './AppStateMonitor';
import Log from './Log';
import {pause, unpause} from './Network/SequentialQueue';
import {onProbeSuccess, probeNow, start as startProbe, stop as stopProbe} from './RecoveryProbe';

let noRadioActive = false;
let sustainedFailuresActive = false;
let shouldForceOffline = false;

onProbeSuccess(() => onRecoveryProbeSuccess());

function isInHardStop(): boolean {
    return noRadioActive || sustainedFailuresActive || shouldForceOffline;
}

function updateState() {
    const offline = isInHardStop();
    setIsOffline(offline, `hard stop: noRadio=${noRadioActive}, sustainedFailures=${sustainedFailuresActive}, forceOffline=${shouldForceOffline}`);

    if (offline) {
        pause();
        // Only probe for real connectivity triggers — shouldForceOffline is a debug tool
        // that should keep the app offline unconditionally
        if (!shouldForceOffline) {
            startProbe();
        } else {
            stopProbe();
        }
    } else {
        stopProbe();
        unpause();
    }
}

/**
 * Called by the NetInfo listener when the OS reports radio status changes.
 * `hasRadio=false` means airplane mode / WiFi off / no cellular.
 */
function setNoRadio(hasRadio: boolean) {
    const wasActive = noRadioActive;
    noRadioActive = !hasRadio;

    if (!wasActive && noRadioActive) {
        Log.info('[NetworkState] Hard stop: NO_RADIO — OS reports no network interface');
        updateState();
    } else if (wasActive && !noRadioActive) {
        Log.info('[NetworkState] NO_RADIO cleared — OS reports radio is back, will probe for connectivity');
        // Don't clear hard stop yet — the recovery probe will verify actual connectivity
        // But if sustained failures isn't active and forceOffline isn't on, we can try
        if (!sustainedFailuresActive && !shouldForceOffline) {
            // Fire immediate probe to check connectivity
            probeNow();
        }
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
 * Called by RecoveryProbe when probe succeeds during hard stop.
 * Clears all hard stops and triggers reconnect.
 */
function onRecoveryProbeSuccess() {
    Log.info('[NetworkState] Recovery probe succeeded — clearing hard stops and reconnecting');
    noRadioActive = false;
    sustainedFailuresActive = false;
    updateState();

    // Trigger app data sync
    reconnect();
}

/**
 * Wire app foreground listener.
 * - If in hard stop → immediate probe
 * - Always → reconnect to catch up on missed data
 */
function initAppForegroundListener() {
    AppStateMonitor.addBecameActiveListener(() => {
        Log.info('[NetworkState] App became active');
        if (isInHardStop() && !shouldForceOffline) {
            probeNow();
        }
        // Always reconnect on foreground to catch up on missed Pusher events
        reconnect();
    });
}

export default {
    isInHardStop,
    setNoRadio,
    setSustainedFailures,
    setForceOffline,
    onRecoveryProbeSuccess,
    initAppForegroundListener,
};
