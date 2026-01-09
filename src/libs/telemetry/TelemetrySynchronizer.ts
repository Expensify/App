/**
 * This file contains the logic for sending additional data to Sentry.
 *
 * It uses Onyx.connectWithoutView as nothing here is related to the UI. We only send data to the external provider and want to keep this outside of the render loop.
 */
import * as Sentry from '@sentry/react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import AppStateMonitor from '@libs/AppStateMonitor';
import Log from '@libs/Log';
import {getActivePolicies} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session, TryNewDot} from '@src/types/onyx';
import getMemoryInfo from './getMemoryInfo';

/**
 * Connect to Onyx to retrieve information about the user's active policies.
 */
let session: OnyxEntry<Session>;
let activePolicyID: OnyxEntry<string>;
let policies: OnyxCollection<Policy>;
let tryNewDot: OnyxEntry<TryNewDot>;

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (value) => {
        if (!value) {
            return;
        }
        activePolicyID = value;
        sendPoliciesContext();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        if (!value?.email) {
            return;
        }
        session = value;
        sendPoliciesContext();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        policies = value;
        sendPoliciesContext();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (value) => {
        tryNewDot = value;
        sendTryNewDotCohortTag();
    },
});

function sendPoliciesContext() {
    if (!policies || !session?.email || !activePolicyID) {
        return;
    }
    const activePolicies = getActivePolicies(policies, session.email).map((policy) => policy.id);
    Sentry.setTag(CONST.TELEMETRY.TAG_ACTIVE_POLICY, activePolicyID);
    Sentry.setContext(CONST.TELEMETRY.CONTEXT_POLICIES, {activePolicyID, activePolicies});
}

function sendTryNewDotCohortTag() {
    const cohort = tryNewDot?.nudgeMigration?.cohort;
    if (!cohort) {
        return;
    }
    Sentry.setTag(CONST.TELEMETRY.TAG_NUDGE_MIGRATION_COHORT, cohort);
}
/**
 * Send memory usage context to Sentry
 * Called on app start, when app comes to foreground, and periodically every 2 minutes
 */
function sendMemoryContext() {
    getMemoryInfo()
        .then((memoryInfo) => {
            const totalOrMax = memoryInfo.maxMemoryBytes ?? memoryInfo.totalMemoryBytes;
            const freeMemoryMB = totalOrMax && memoryInfo.usedMemoryBytes ? Math.round((totalOrMax - memoryInfo.usedMemoryBytes) / (1024 * 1024)) : null;
            const usedMemoryMB = memoryInfo.usedMemoryBytes ? Math.round(memoryInfo.usedMemoryBytes / (1024 * 1024)) : null;

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
                if (freeMemoryMB < CONST.TELEMETRY.MEMORY_THRESHOLD_CRITICAL) {
                    logLevel = 'error';
                } else if (freeMemoryMB < CONST.TELEMETRY.MEMORY_THRESHOLD_WARNING) {
                    logLevel = 'warning';
                }
            } else if (memoryInfo.usagePercentage && memoryInfo.usagePercentage > 90) {
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
        })
        .catch((error) => {
            Log.hmmm('[SentrySync] Failed to get memory info', {
                error,
            });
        });
}

/**
 * Store interval ID and cleanup function for cleanup on hot reload (development only)
 * In production, this will be cleaned up when the app terminates
 */
let memoryTrackingIntervalID: ReturnType<typeof setInterval> | undefined;
let memoryTrackingListenerCleanup: (() => void) | undefined;

/**
 * Clear existing interval and listener before creating new ones
 * This prevents interval/listener stacking on hot reload in development
 */
function initializeMemoryTracking() {
    // Cleanup existing interval
    if (memoryTrackingIntervalID) {
        clearInterval(memoryTrackingIntervalID);
        memoryTrackingIntervalID = undefined;
    }

    // Cleanup existing listener
    if (memoryTrackingListenerCleanup) {
        memoryTrackingListenerCleanup();
        memoryTrackingListenerCleanup = undefined;
    }

    // Initialize memory tracking
    sendMemoryContext();

    // Update memory when app comes to foreground
    memoryTrackingListenerCleanup = AppStateMonitor.addBecameActiveListener(sendMemoryContext);

    // Update memory periodically (every 2 minutes)
    // This is safe given Android's 5-second rate limit on getUsedMemory()
    memoryTrackingIntervalID = setInterval(sendMemoryContext, 2 * 60 * 1000);
}

// Initialize memory tracking
initializeMemoryTracking();
