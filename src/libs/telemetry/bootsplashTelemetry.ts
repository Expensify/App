import Log from '@libs/Log';

import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

import type {SeverityLevel} from '@sentry/react-native';
import type React from 'react';

import * as Sentry from '@sentry/react-native';
import {AppState} from 'react-native';

function addBootsplashBreadcrumb(message: string, data?: Record<string, string>, level: SeverityLevel = 'info'): void {
    Sentry.addBreadcrumb({
        category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_BOOTSPLASH_FLOW,
        message,
        level,
        data,
    });
}

type BootsplashGateStatus = {
    splashScreenState: string | undefined;
    isOnyxMigrated: boolean;
    isCheckingPublicRoom: boolean;
    hasAttemptedToOpenPublicRoom: boolean;
    isNavigationReady: boolean;
    preferredLocale: Locale | undefined;
    shouldInit: boolean;
    shouldHideSplash: boolean;
    isAuthenticated: boolean;
    updateRequired: boolean | undefined;
    lastVisitedPath: string | undefined;
};

/** How often the monitor samples the bootsplash gate. */
const BOOTSPLASH_POLL_INTERVAL_MS = 10_000;

/**
 * Stuck-splash reports forwarded to Sentry before the monitor goes quiet. A splash that never hides would
 * otherwise report once per poll for the whole session, and the later reports repeat what the first few
 * already said. Six covers the first minute, which is where a recoverable stall resolves.
 */
const MAX_STUCK_REPORTS = 6;

function startBootsplashMonitor(gateStatusRef: React.RefObject<BootsplashGateStatus | null>): () => void {
    const startedAt = Date.now();
    let stuckReportCount = 0;

    const intervalId = setInterval(() => {
        const currentGateStatus = gateStatusRef.current;
        const appState = AppState.currentState;
        Log.info('[BootSplash] splash screen status', false, {appState, splashScreenState: currentGateStatus?.splashScreenState});

        if (currentGateStatus?.splashScreenState !== CONST.BOOT_SPLASH_STATE.VISIBLE && currentGateStatus?.splashScreenState !== undefined) {
            clearInterval(intervalId);
            return;
        }

        if (stuckReportCount >= MAX_STUCK_REPORTS) {
            return;
        }
        stuckReportCount++;

        // A stuck splash is a diagnostic signal, not a crash, so it goes to Sentry logs rather than the error
        // stream. `stuckForMs` is what the repeated reports are actually for: how long the gate stayed shut.
        Sentry.logger.warn('[BootSplash] splash screen is still visible', {
            ...currentGateStatus,
            appState,
            stuckForMs: Date.now() - startedAt,
            reportNumber: stuckReportCount,
        });
    }, BOOTSPLASH_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
}

export {addBootsplashBreadcrumb, startBootsplashMonitor};
export type {BootsplashGateStatus};
