import * as Sentry from '@sentry/react-native';
import AppStateMonitor from '@libs/AppStateMonitor';
import CONST from '@src/CONST';
import getMemoryInfo from './getMemoryInfo';

let memoryTrackingIntervalID: ReturnType<typeof setInterval> | undefined;
let memoryTrackingListenerCleanup: (() => void) | undefined;

/**
 * Send memory usage context to Sentry
 * Called on app start, when app comes to foreground, and periodically every 2 minutes
 */
function sendMemoryContext() {
    getMemoryInfo().then((memoryInfo) => {
        const freeMemoryMB = memoryInfo.freeMemoryMB;
        const usedMemoryMB = memoryInfo.usedMemoryMB;
        let logLevel: Sentry.SeverityLevel = 'info';
        /**
         * Log Level Thresholds (Based on OS resource management):
         * * 1. < 50MB (Error): Critical memory exhaustion. The OS's memory killer
         * (Jetsam on iOS / Low Memory Killer on Android) is likely to terminate the process immediately.
         * * 2. < 120MB (Warning): System starts sending 'didReceiveMemoryWarning' signals.
         * The app is unstable and any sudden allocation spike will lead to a crash.
         * * 3. > 120MB (Info): Safe operational zone for most modern mobile devices.
         */
        if (freeMemoryMB !== null) {
            if (freeMemoryMB < CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_CRITICAL) {
                logLevel = 'error';
            } else if (freeMemoryMB < CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_WARNING) {
                logLevel = 'warning';
            }
        } else if (memoryInfo.usagePercentage && memoryInfo.usagePercentage > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_CRITICAL_PERCENTAGE) {
            logLevel = 'error';
        }

        Sentry.addBreadcrumb({
            category: 'system.memory',
            message: `RAM Check: ${usedMemoryMB ?? '?'}MB used / ${freeMemoryMB ?? '?'}MB free`,
            level: logLevel,
            data: {
                ...memoryInfo,
                freeMemoryMB,
                usedMemoryMB,
            },
        });

        Sentry.setContext(CONST.TELEMETRY.CONTEXT_MEMORY, {
            ...memoryInfo,
            freeMemoryMB,
            lowMemoryThreat: logLevel !== 'info',
            lastUpdated: new Date().toISOString(),
        });
    });
}

function initializeMemoryTracking() {
    if (memoryTrackingIntervalID) {
        clearInterval(memoryTrackingIntervalID);
        memoryTrackingIntervalID = undefined;
    }

    if (memoryTrackingListenerCleanup) {
        memoryTrackingListenerCleanup();
        memoryTrackingListenerCleanup = undefined;
    }

    sendMemoryContext();
    memoryTrackingListenerCleanup = AppStateMonitor.addBecameActiveListener(sendMemoryContext);
    memoryTrackingIntervalID = setInterval(sendMemoryContext, CONST.TELEMETRY.CONFIG.MEMORY_TRACKING_INTERVAL);
}

initializeMemoryTracking();

function cleanupMemoryTracking() {
    if (memoryTrackingIntervalID) {
        clearInterval(memoryTrackingIntervalID);
        memoryTrackingIntervalID = undefined;
    }

    if (memoryTrackingListenerCleanup) {
        memoryTrackingListenerCleanup();
        memoryTrackingListenerCleanup = undefined;
    }
}

export {cleanupMemoryTracking, initializeMemoryTracking};
export default sendMemoryContext;
