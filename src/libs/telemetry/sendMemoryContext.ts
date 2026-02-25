import * as Sentry from '@sentry/react-native';
import AppStateMonitor from '@libs/AppStateMonitor';
import CONST from '@src/CONST';
import formatMemoryBreadcrumb from './formatMemoryBreadcrumb';
import getMemoryInfo from './getMemoryInfo';
import getMemoryLogLevel from './getMemoryLogLevel';

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

            /**
             * Memory Threshold Strategy (based on platform capabilities):
             *
             * WEB:
             *   - Has jsHeapSizeLimit API ✅
             *   - Use percentage: (usedMemory / jsHeapSizeLimit) * 100
             *   - Thresholds: >85% error, >70% warning
             *
             * ANDROID:
             *   - getUsedMemory() returns RSS (process memory including native + heap + libs)
             *   - getMaxMemory() returns heap limit (Java heap only) - incompatible for comparison
             *   - Temporary: Use % of device RAM (RSS / totalMemory * 100)
             *   - Thresholds: >85% error, >70% warning
             *   - Future: Use native onTrimMemory() callbacks for system memory pressure
             *
             * iOS:
             *   - NO API for jetsam limit ❌
             *   - Use absolute MB values (conservative approach)
             *   - Thresholds: >600MB error, >300MB warning (supports iPhone 8+)
             *   - Note: iPhone 8/X jetsam ~300-350MB, iPhone 11+ ~400-600MB
             */

            const logLevel = getMemoryLogLevel(memoryInfo);

            const timestamp = Date.now();
            const timestampISO = new Date(timestamp).toISOString();

            const breadcrumbMessage = formatMemoryBreadcrumb(memoryInfo, usedMemoryMB);

            Sentry.addBreadcrumb({
                category: 'system.memory',
                message: breadcrumbMessage,
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
