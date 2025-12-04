import Onyx, {OnyxEntry} from 'react-native-onyx';
import {startProfiling} from 'react-native-release-profiler';
import {Memoize} from '@libs/memoize';
import Performance from '@libs/Performance';
import ONYXKEYS from '@src/ONYXKEYS';
import {disableLoggingAndFlushLogs, setShouldStoreLogs} from './Console';
import toggleProfileTool from './ProfilingTool';
import {shouldShowProfileTool} from './TestTool';

// Auto-off timeout for troubleshoot recording (10 minutes)
const AUTO_OFF_TIMEOUT_MS = 10 * 60 * 1000;

// Module-level state
let autoOffTimeout: NodeJS.Timeout | null = null;
let shouldRecordTroubleshootData: OnyxEntry<boolean>;
let troubleshootRecordingStartTime: OnyxEntry<number>;
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
 * Disable troubleshoot recording, stop profiling, and clean up logs.
 * Used for auto-off and invalid state cleanup.
 */
function disableRecording() {
    clearAutoOffTimeout();

    // Stop profiling and performance monitoring
    Performance.disableMonitoring();
    Memoize.stopMonitoring();
    toggleProfileTool(false);

    // Disable logging and flush logs
    disableLoggingAndFlushLogs();

    // Update Onyx state
    Onyx.set(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, false);
    Onyx.set(ONYXKEYS.TROUBLESHOOT_RECORDING_START_TIME, null);
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
Onyx.connect({
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
Onyx.connect({
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
        Onyx.set(ONYXKEYS.TROUBLESHOOT_RECORDING_START_TIME, null);
        Onyx.set(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, false);
    }
}

export {setShouldRecordTroubleshootData, enableRecording, disableRecording};
