import type {SeverityLevel} from '@sentry/react-native';
import * as Sentry from '@sentry/react-native';
import type React from 'react';
import {AppState} from 'react-native';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

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

function startBootsplashMonitor(gateStatusRef: React.RefObject<BootsplashGateStatus | null>): () => void {
    const intervalId = setInterval(() => {
        const currentGateStatus = gateStatusRef.current;
        const appState = AppState.currentState;
        Log.info('[BootSplash] splash screen status', false, {appState, splashScreenState: currentGateStatus?.splashScreenState});

        if (currentGateStatus?.splashScreenState !== CONST.BOOT_SPLASH_STATE.VISIBLE && currentGateStatus?.splashScreenState !== undefined) {
            clearInterval(intervalId);
            return;
        }

        Sentry.captureMessage('[BootSplash] splash screen is still visible', {
            level: 'warning',
            extra: {...currentGateStatus, appState},
            fingerprint: ['bootsplash-stuck'],
        });
    }, 10_000);

    return () => clearInterval(intervalId);
}

export {addBootsplashBreadcrumb, startBootsplashMonitor};
export type {BootsplashGateStatus};
