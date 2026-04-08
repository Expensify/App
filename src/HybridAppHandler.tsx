import {useEffect} from 'react';
import CONFIG from './CONFIG';
import CONST from './CONST';
import useOnyx from './hooks/useOnyx';
import {getHybridAppSettings} from './libs/actions/HybridApp';
import type HybridAppSettings from './libs/actions/HybridApp/types';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import Log from './libs/Log';
import {endSpan, startSpan} from './libs/telemetry/activeSpans';
import {addBootsplashBreadcrumb} from './libs/telemetry/bootsplashTelemetry';
import ONYXKEYS from './ONYXKEYS';
import {useSplashScreenActions} from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

function HybridAppHandler() {
    const {setSplashScreenState} = useSplashScreenActions();
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);

    const finalizeTransitionFromOldDot = (hybridAppSettings: HybridAppSettings) => {
        const loggedOutFromOldDot = !!hybridAppSettings.hybridApp.loggedOutFromOldDot;

        setupNewDotAfterTransitionFromOldDot(hybridAppSettings, tryNewDot).then(() => {
            if (loggedOutFromOldDot) {
                endSpan(CONST.TELEMETRY.SPAN_APP_STARTUP);
                endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT);
                endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_LOGGED_OUT);
            } else {
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            }
        });
    };

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || isLoadingTryNewDot) {
            return;
        }

        addBootsplashBreadcrumb('HybridAppHandler: Requesting settings');
        getHybridAppSettings().then((hybridAppSettings: HybridAppSettings | null) => {
            if (!hybridAppSettings) {
                // Native method can send non-null value only once per NewDot lifecycle. It prevents issues with multiple initializations during reloads on debug builds.
                Log.info('[HybridApp] `getHybridAppSettings` called more than once during single NewDot lifecycle. Skipping initialization.');
                addBootsplashBreadcrumb('HybridAppHandler: null settings, skipping');
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
    }, [finalizeTransitionFromOldDot, isLoadingTryNewDot, setSplashScreenState]);

    return null;
}

export default HybridAppHandler;
