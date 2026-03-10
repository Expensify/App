import NetInfo from '@react-native-community/netinfo';
import CONST from '@src/CONST';
import Log from './Log';
import {generateRandomInt} from './NumberUtils';

const probeSuccessListeners = new Set<() => void>();

function onProbeSuccess(listener: () => void): () => void {
    probeSuccessListeners.add(listener);
    return () => {
        probeSuccessListeners.delete(listener);
    };
}

let probeTimeoutID: NodeJS.Timeout | null = null;
let currentInterval = CONST.NETWORK.RECOVERY_PROBE_INITIAL_MS;
let isRunning = false;

/**
 * Fire a single probe using NetInfo.refresh().
 * NetInfo is configured with our reachabilityUrl (api/Ping) so refresh() will check actual server connectivity.
 */
function probe() {
    Log.info(`[RecoveryProbe] Probing... (interval: ${currentInterval}ms)`);

    NetInfo.refresh()
        .then((state) => {
            const isReachable = state.isInternetReachable === true;
            Log.info(`[RecoveryProbe] Probe result: isInternetReachable=${state.isInternetReachable}, isConnected=${state.isConnected}`);

            if (isReachable) {
                Log.info('[RecoveryProbe] Server is reachable — recovery confirmed');
                stop();
                for (const listener of probeSuccessListeners) {
                    listener();
                }
            } else {
                // Probe failed — schedule next with backoff
                scheduleNext();
            }
        })
        .catch((error: unknown) => {
            Log.info('[RecoveryProbe] Probe failed with error', false, String(error));
            scheduleNext();
        });
}

function scheduleNext() {
    if (!isRunning) {
        return;
    }

    // Jittered backoff: double interval, cap at max, add jitter
    currentInterval = Math.min(currentInterval * 2, CONST.NETWORK.RECOVERY_PROBE_CAP_MS);
    const jitter = generateRandomInt(0, Math.floor(currentInterval * 0.2));
    const delay = currentInterval + jitter;

    Log.info(`[RecoveryProbe] Next probe in ${delay}ms`);
    probeTimeoutID = setTimeout(probe, delay);
}

/**
 * Start the recovery probe cycle.
 * Called when entering a hard stop.
 */
function start() {
    if (isRunning) {
        return;
    }

    Log.info('[RecoveryProbe] Starting recovery probe cycle');
    isRunning = true;
    currentInterval = CONST.NETWORK.RECOVERY_PROBE_INITIAL_MS;

    // First probe after initial interval
    probeTimeoutID = setTimeout(probe, currentInterval);
}

/**
 * Stop the recovery probe cycle.
 * Called when hard stop is cleared.
 */
function stop() {
    if (!isRunning) {
        return;
    }

    Log.info('[RecoveryProbe] Stopping recovery probe cycle');
    isRunning = false;
    if (probeTimeoutID) {
        clearTimeout(probeTimeoutID);
        probeTimeoutID = null;
    }
    currentInterval = CONST.NETWORK.RECOVERY_PROBE_INITIAL_MS;
}

/**
 * Fire an immediate probe (e.g. when app comes to foreground during hard stop).
 */
function probeNow() {
    if (!isRunning) {
        start();
        return;
    }

    Log.info('[RecoveryProbe] Immediate probe requested');
    if (probeTimeoutID) {
        clearTimeout(probeTimeoutID);
        probeTimeoutID = null;
    }
    probe();
}

export {start, stop, probeNow, onProbeSuccess};
