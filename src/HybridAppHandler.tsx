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

    // Timestamp captured when JS first executes in HybridAppHandler.
    // Used to measure the native-to-JS bridge gap.
    // eslint-disable-next-line react-hooks/purity
    const jsEntryTimestamp = useRef(Date.now());

    // Store durations of early spans (created before root transition span exists).
    // These are later attached as attributes on the root span.
    const onyxHydrationDuration = useRef<number | undefined>(undefined);
    const getSettingsDuration = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || onyxHydrationStarted.current) {
            return;
        }
        onyxHydrationStarted.current = true;
        // Note: no parentSpan — the root transition span doesn't exist yet at this point
        // (it's created later in getHybridAppSettings callback). This span runs as an
        // independent sibling. Its duration is recorded as an attribute on the root span.
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

        const onyxHydrationEnd = Date.now();
        endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.ONYX_HYDRATION);

        // Note: no parentSpan — same as ONYX_HYDRATION, the root transition span
        // doesn't exist yet. Duration is recorded as an attribute on the root span.
        const getSettingsStart = Date.now();
        startSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.GET_HYBRID_APP_SETTINGS, {
            name: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.GET_HYBRID_APP_SETTINGS,
            op: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.GET_HYBRID_APP_SETTINGS,
        });

        getHybridAppSettings().then((hybridAppSettings: HybridAppSettings | null) => {
            const getSettingsEnd = Date.now();
            endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_STAGES.GET_HYBRID_APP_SETTINGS);

            // Store early span durations for later attachment to the root span
            onyxHydrationDuration.current = onyxHydrationEnd - jsEntryTimestamp.current;
            getSettingsDuration.current = getSettingsEnd - getSettingsStart;

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
                const transitionStartTimestamp = hybridAppSettings.hybridApp.transitionStartTimestamp;
                const rootSpan = startSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION, {
                    name: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION,
                    op: CONST.TELEMETRY.SPAN_OD_ND_TRANSITION,
                    startTime: transitionStartTimestamp,
                });

                // Attach early span durations as attributes on the root span,
                // since these spans couldn't be children (root didn't exist yet).
                rootSpan.setAttribute('js_entry_time', jsEntryTimestamp.current);
                rootSpan.setAttribute('onyx_hydration_duration_ms', onyxHydrationDuration.current ?? -1);
                rootSpan.setAttribute('get_settings_duration_ms', getSettingsDuration.current ?? -1);
            }

            finalizeTransitionFromOldDot(hybridAppSettings);
        });
    }, [finalizeTransitionFromOldDot, isLoadingTryNewDot]);

    return null;
}

export default HybridAppHandler;
