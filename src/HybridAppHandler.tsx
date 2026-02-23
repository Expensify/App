import {useCallback, useEffect, useRef} from 'react';
import CONFIG from './CONFIG';
import CONST from './CONST';
import useOnyx from './hooks/useOnyx';
import {getHybridAppSettings} from './libs/actions/HybridApp';
import type HybridAppSettings from './libs/actions/HybridApp/types';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import Log from './libs/Log';
import {endSpan, getSpan, startSpan} from './libs/telemetry/activeSpans';
import ONYXKEYS from './ONYXKEYS';
import {useSplashScreenActions, useSplashScreenState} from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

function HybridAppHandler() {
    const {splashScreenState} = useSplashScreenState();
    const {setSplashScreenState} = useSplashScreenActions();
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const onyxHydrationStarted = useRef(false);

    // Start Onyx hydration span on mount (standalone — before root transition span exists)
    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || onyxHydrationStarted.current) {
            return;
        }
        onyxHydrationStarted.current = true;
        startSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.ONYX_HYDRATION, {
            name: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.ONYX_HYDRATION,
            op: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.ONYX_HYDRATION,
        });
    }, []);

    const finalizeTransitionFromOldDot = useCallback(
        (hybridAppSettings: HybridAppSettings) => {
            const loggedOutFromOldDot = !!hybridAppSettings.hybridApp.loggedOutFromOldDot;

            setupNewDotAfterTransitionFromOldDot(hybridAppSettings, tryNewDot).then(() => {
                if (splashScreenState !== CONST.BOOT_SPLASH_STATE.VISIBLE) {
                    return;
                }

                const transitionSpanName = loggedOutFromOldDot ? CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_LOGGED_OUT : CONST.TELEMETRY.SPAN_OD_ND_TRANSITION;
                if (loggedOutFromOldDot) {
                    setSplashScreenState(CONST.BOOT_SPLASH_STATE.HIDDEN);
                    endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_LOGGED_OUT);
                } else {
                    startSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.SPLASH_HIDE, {
                        name: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.SPLASH_HIDE,
                        op: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.SPLASH_HIDE,
                        parentSpan: getSpan(transitionSpanName),
                    });
                    setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
                }
            });
        },
        [setSplashScreenState, splashScreenState, tryNewDot],
    );

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || isLoadingTryNewDot) {
            return;
        }

        // End Onyx hydration span — tryNewDot is now loaded
        endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.ONYX_HYDRATION);

        // Start getHybridAppSettings span (standalone — before root transition span exists)
        startSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.GET_HYBRID_APP_SETTINGS, {
            name: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.GET_HYBRID_APP_SETTINGS,
            op: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.GET_HYBRID_APP_SETTINGS,
        });

        getHybridAppSettings().then((hybridAppSettings: HybridAppSettings | null) => {
            endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.GET_HYBRID_APP_SETTINGS);

            if (!hybridAppSettings) {
                // Native method can send non-null value only once per NewDot lifecycle. It prevents issues with multiple initializations during reloads on debug builds.
                Log.info('[HybridApp] `getHybridAppSettings` called more than once during single NewDot lifecycle. Skipping initialization.');
                return;
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
    }, [finalizeTransitionFromOldDot, isLoadingTryNewDot]);

    return null;
}

export default HybridAppHandler;
