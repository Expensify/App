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
    getMemoryInfo()
        .then((memoryInfo) => {
            const freeMemoryMB = memoryInfo.freeMemoryMB;
            const usedMemoryMB = memoryInfo.usedMemoryMB;
            let logLevel: Sentry.SeverityLevel = 'info';

            /**
             * Memory Threshold Strategy (based on platform capabilities):
             * 
             * WEB:
             *   - Has jsHeapSizeLimit API ✅
             *   - Use percentage: (usedMemory / jsHeapSizeLimit) * 100
             *   - Thresholds: >90% error, >75% warning
             * 
             * ANDROID:
             *   - Has getMaxMemory() for VM heap limit ✅
             *   - Use percentage: (usedMemory / maxMemory) * 100
             *   - Thresholds: >85% error, >70% warning
             * 
             * iOS:
             *   - NO API for jetsam limit ❌
             *   - Use absolute MB values (conservative approach)
             *   - Thresholds: >800MB error, >500MB warning
             *   - Note: Actual jetsam limit varies by device (typically 20-30% of device RAM)
             */
            if (memoryInfo.platform === 'web') {
                // Web: Use percentage of JS heap limit
                const usagePercent = memoryInfo.usedMemoryBytes !== null && memoryInfo.maxMemoryBytes !== null ? (memoryInfo.usedMemoryBytes / memoryInfo.maxMemoryBytes) * 100 : null;

                if (usagePercent !== null) {
                    if (usagePercent > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_WEB_CRITICAL) {
                        logLevel = 'error';
                    } else if (usagePercent > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_WEB_WARNING) {
                        logLevel = 'warning';
                    }
                }
            } else if (memoryInfo.platform === 'android') {
                // Android: Use percentage of VM heap limit (from getMaxMemory)
                if (memoryInfo.usagePercentage !== null) {
                    if (memoryInfo.usagePercentage > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_ANDROID_CRITICAL) {
                        logLevel = 'error';
                    } else if (memoryInfo.usagePercentage > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_ANDROID_WARNING) {
                        logLevel = 'warning';
                    }
                }
            } else if (memoryInfo.platform === 'ios') {
                // iOS: Use absolute MB values (no reliable heap limit API)
                if (usedMemoryMB !== null) {
                    if (usedMemoryMB > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_IOS_CRITICAL_MB) {
                        logLevel = 'error';
                    } else if (usedMemoryMB > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_IOS_WARNING_MB) {
                        logLevel = 'warning';
                    }
                }
            }

            const timestamp = Date.now();
            const timestampISO = new Date(timestamp).toISOString();

            const maxMB = memoryInfo.maxMemoryBytes ? Math.round(memoryInfo.maxMemoryBytes / (1024 * 1024)) : null;

            Sentry.addBreadcrumb({
                category: 'system.memory',
                message: `RAM Check: ${usedMemoryMB ?? '?'}MB / ${maxMB ?? '?'}MB limit`,
                level: logLevel,
                timestamp: timestamp / 1000,
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
                lastUpdated: timestampISO,
            });
        })
        .catch(() => {
            // Silently ignore errors to avoid impacting app performance
            // Memory tracking is non-critical and should not cause issues
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
