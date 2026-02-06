import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {startProfiling, stopProfiling} from 'react-native-release-profiler';
import {Memoize} from '@libs/memoize';
import Performance from '@libs/Performance';
import ONYXKEYS from '@src/ONYXKEYS';
import {disableLoggingAndFlushLogs, setShouldStoreLogs} from './Console';
import toggleProfileTool from './ProfilingTool';
import {shouldShowProfileTool} from './TestTool';

type ProfilingData = {
    profilePath?: string;
    memoizeStats: ReturnType<typeof Memoize.stopMonitoring>;
    performanceMeasures?: ReturnType<typeof Performance.getPerformanceMeasures>;
};

// Auto-off timeout for troubleshoot recording (10 minutes)
const AUTO_OFF_TIMEOUT_MS = 10 * 60 * 1000;

// Module-level state
let autoOffTimeout: NodeJS.Timeout | null = null;
let shouldRecordTroubleshootData: OnyxEntry<boolean>;
let troubleshootRecordingStartTime: OnyxEntry<number | null>;
let isRecordingLoaded = false;
let isStartTimeLoaded = false;
let isInitialized = false;

/**
 * Clear the auto-off timeout if it exists
 */
function clearAutoOffTimeout() {
    if (!autoOffTimeout) {
        return;
    }

    clearTimeout(autoOffTimeout);
    autoOffTimeout = null;
}

/**
 * Stop profiling and get profiling data.
 * Used for manual disable to get profile path and stats before cleanup.
 * @param fileName - The filename to save the profile trace as
 * @returns Profile path, memoize stats, and performance measures
 */
async function stopProfilingAndGetData(fileName: string): Promise<ProfilingData> {
    const showProfileTool = shouldShowProfileTool();

    // Stop profiler and save to file (only if profiling is available)
    const profilePath = showProfileTool ? await stopProfiling(true, fileName) : undefined;

    // Get stats before stopping monitoring
    const memoizeStats = Memoize.stopMonitoring();
    const performanceMeasures = showProfileTool ? Performance.getPerformanceMeasures() : undefined;

    // Stop monitoring
    Performance.disableMonitoring();
    toggleProfileTool(false);

    return {profilePath, memoizeStats, performanceMeasures};
}

/**
 * Disable troubleshoot recording, stop profiling, and clean up logs.
 * Used for auto-off and invalid state cleanup.
 */
function clearRecordingOnyxState() {
    Onyx.set(ONYXKEYS.TROUBLESHOOT_RECORDING_START_TIME, null);
    Onyx.set(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, false);
}

function disableRecording() {
    clearAutoOffTimeout();

    // Stop profiling and performance monitoring
    Performance.disableMonitoring();
    Memoize.stopMonitoring();
    toggleProfileTool(false);

    // Disable logging and flush logs
    disableLoggingAndFlushLogs();

    // Update Onyx state
    clearRecordingOnyxState();
}

/**
 * Clean up Onyx state and flush logs.
 * Used after manual disable when profiling was already stopped via stopProfilingAndGetData.
 */
function cleanupAfterDisable() {
    clearAutoOffTimeout();
    disableLoggingAndFlushLogs();
    clearRecordingOnyxState();
}

/**
 * Schedule auto-off after the given time
 */
function scheduleAutoOff(remainingTime: number) {
    clearAutoOffTimeout();
    autoOffTimeout = setTimeout(() => {
        disableRecording();
        autoOffTimeout = null;
    }, remainingTime);
}

/**
 * Enable troubleshoot recording, start profiling, and enable log storage.
 */
function enableRecording() {
    clearAutoOffTimeout();

    // Enable log storage
    setShouldStoreLogs(true);

    // Start profiling and performance monitoring if available
    if (shouldShowProfileTool()) {
        Memoize.startMonitoring();
        Performance.enableMonitoring();
        startProfiling();
        toggleProfileTool(true);
    }

    // Update Onyx state and schedule auto-off
    Onyx.set(ONYXKEYS.TROUBLESHOOT_RECORDING_START_TIME, Date.now());
    scheduleAutoOff(AUTO_OFF_TIMEOUT_MS);
    Onyx.set(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, true);
}

/**
 * Check recording state on app load and handle accordingly.
 * - If recording ON but no start time → disable (invalid state)
 * - If recording ON and start time exists → calculate remaining time or disable if exceeded
 */
function tryInitialize() {
    if (isInitialized || !isRecordingLoaded || !isStartTimeLoaded) {
        return;
    }
    isInitialized = true;

    if (!shouldRecordTroubleshootData) {
        return;
    }

    // Recording is ON but no start time - invalid state, disable
    if (!troubleshootRecordingStartTime) {
        disableRecording();
        return;
    }

    // Calculate remaining time
    const elapsedTime = Date.now() - troubleshootRecordingStartTime;

    if (elapsedTime >= AUTO_OFF_TIMEOUT_MS) {
        // Time exceeded, disable recording
        disableRecording();
    } else {
        // Schedule auto-off for remaining time
        const remainingTime = AUTO_OFF_TIMEOUT_MS - elapsedTime;
        scheduleAutoOff(remainingTime);
    }
}

/**
 * Listen for changes to the troubleshoot recording flag.
 * On app load, triggers initialization to handle auto-off timer.
 */
Onyx.connectWithoutView({
    key: ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA,
    initWithStoredValues: true,
    callback: (value) => {
        shouldRecordTroubleshootData = value;
        isRecordingLoaded = true;
        tryInitialize();
    },
});

/**
 * Listen for changes to the recording start time.
 * On app load, triggers initialization to calculate remaining time for auto-off.
 */
Onyx.connectWithoutView({
    key: ONYXKEYS.TROUBLESHOOT_RECORDING_START_TIME,
    initWithStoredValues: true,
    callback: (value) => {
        troubleshootRecordingStartTime = value;
        isStartTimeLoaded = true;
        tryInitialize();
    },
});

/**
 * Set whether or not to record troubleshoot data
 * @param shouldRecord Whether or not to record troubleshoot data
 */
function setShouldRecordTroubleshootData(shouldRecord: boolean) {
    clearAutoOffTimeout();

    if (shouldRecord) {
        Onyx.set(ONYXKEYS.TROUBLESHOOT_RECORDING_START_TIME, Date.now());
        scheduleAutoOff(AUTO_OFF_TIMEOUT_MS);
        Onyx.set(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, true);
    } else {
        clearRecordingOnyxState();
    }
}

export {setShouldRecordTroubleshootData, enableRecording, disableRecording, stopProfilingAndGetData, cleanupAfterDisable};
export type {ProfilingData};
