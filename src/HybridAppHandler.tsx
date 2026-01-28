import {useCallback, useEffect} from 'react';
import CONFIG from './CONFIG';
import CONST from './CONST';
import useOnyx from './hooks/useOnyx';
import {getHybridAppSettings} from './libs/actions/HybridApp';
import type HybridAppSettings from './libs/actions/HybridApp/types';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import Log from './libs/Log';
import {endSpan, startSpan} from './libs/telemetry/activeSpans';
import ONYXKEYS from './ONYXKEYS';
import {useSplashScreenActions, useSplashScreenState} from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

function HybridAppHandler() {
    const {splashScreenState} = useSplashScreenState();
    const {setSplashScreenState} = useSplashScreenActions();
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);

    const finalizeTransitionFromOldDot = useCallback(
        (hybridAppSettings: HybridAppSettings) => {
            const loggedOutFromOldDot = !!hybridAppSettings.hybridApp.loggedOutFromOldDot;

            setupNewDotAfterTransitionFromOldDot(hybridAppSettings, tryNewDot).then(() => {
                if (splashScreenState !== CONST.BOOT_SPLASH_STATE.VISIBLE) {
                    return;
                }

                endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION);

                setSplashScreenState(loggedOutFromOldDot ? CONST.BOOT_SPLASH_STATE.HIDDEN : CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            });
        },
        [setSplashScreenState, splashScreenState, tryNewDot],
    );

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || isLoadingTryNewDot) {
            return;
        }

        getHybridAppSettings().then((hybridAppSettings: HybridAppSettings | null) => {
            if (!hybridAppSettings) {
                // Native method can send non-null value only once per NewDot lifecycle. It prevents issues with multiple initializations during reloads on debug builds.
                Log.info('[HybridApp] `getHybridAppSettings` called more than once during single NewDot lifecycle. Skipping initialization.');
                return;
            }

            if (hybridAppSettings.hybridApp.pressedTryNewExpensify) {
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
