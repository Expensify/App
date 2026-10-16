import {useEffect, useRef} from 'react';

import type HybridAppSettings from './libs/actions/HybridApp/types';

import CONFIG from './CONFIG';
import CONST from './CONST';
import useOnyx from './hooks/useOnyx';
import {getHybridAppSettings} from './libs/actions/HybridApp';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import Log from './libs/Log';
import {endSpan, startSpan} from './libs/telemetry/activeSpans';
import {addBootsplashBreadcrumb} from './libs/telemetry/bootsplashTelemetry';
import {scheduleInitialDatabaseSizeMeasurement} from './libs/telemetry/databaseSizeTracker';
import ONYXKEYS from './ONYXKEYS';
import {useSplashScreenActions} from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

function HybridAppHandler() {
    const {setSplashScreenState} = useSplashScreenActions();
    const hasRequestedHybridAppSettingsRef = useRef(false);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const [credentials, credentialsMetadata] = useOnyx(ONYXKEYS.CREDENTIALS);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const isLoadingCredentials = isLoadingOnyxValue(credentialsMetadata);

    const finalizeTransitionFromOldDot = (hybridAppSettings: HybridAppSettings) => {
        const loggedOutFromOldDot = !!hybridAppSettings.hybridApp.loggedOutFromOldDot;

        setupNewDotAfterTransitionFromOldDot(hybridAppSettings, tryNewDot, credentials).then(() => {
            if (loggedOutFromOldDot) {
                endSpan(CONST.TELEMETRY.SPAN_APP_STARTUP);
                endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT);
                endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_LOGGED_OUT);
                scheduleInitialDatabaseSizeMeasurement();
            } else {
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            }
        });
    };

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || isLoadingTryNewDot || isLoadingCredentials || hasRequestedHybridAppSettingsRef.current) {
            return;
        }

        // Native settings can be consumed only once. Prevent dependency changes from requesting them again in the same JavaScript runtime.
        hasRequestedHybridAppSettingsRef.current = true;
        addBootsplashBreadcrumb('HybridAppHandler: Requesting settings');
        getHybridAppSettings().then((hybridAppSettings: HybridAppSettings | null) => {
            if (!hybridAppSettings) {
                // A new JavaScript runtime receives null because native does not replay settings after a reload.
                Log.info('[HybridApp] `getHybridAppSettings` returned null after a JavaScript reload. Restoring the hidden splash state.');
                addBootsplashBreadcrumb('HybridAppHandler: null settings, restoring hidden state');
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.HIDDEN);
                return;
            }

            addBootsplashBreadcrumb('HybridAppHandler: Settings received', {loggedOutFromOldDot: String(!!hybridAppSettings.hybridApp.loggedOutFromOldDot)});

            // Resolve splash state ASAP — this is the earliest moment we know
            // whether the native splash is on screen or not
            if (hybridAppSettings.hybridApp.loggedOutFromOldDot) {
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.HIDDEN);
            } else {
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.VISIBLE);
            }

            if (hybridAppSettings.hybridApp.loggedOutFromOldDot) {
                startSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_LOGGED_OUT, {
                    name: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_LOGGED_OUT,
                    op: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_LOGGED_OUT,
                    startTime: hybridAppSettings.hybridApp.transitionStartTimestamp,
                });
            } else if (hybridAppSettings.hybridApp.pressedTryNewExpensify) {
                startSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION, {
                    name: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION,
                    op: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION,
                    startTime: hybridAppSettings.hybridApp.transitionStartTimestamp,
                });
            }

            finalizeTransitionFromOldDot(hybridAppSettings);
        });
    }, [finalizeTransitionFromOldDot, isLoadingTryNewDot, isLoadingCredentials, setSplashScreenState]);

    return null;
}

export default HybridAppHandler;
