import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports -- No higher-level Navigation API for waiting on transitions without navigating
import TransitionTracker from '@libs/Navigation/TransitionTracker';
// eslint-disable-next-line no-restricted-imports -- Type import from same restricted module
import type {CancelHandle} from '@libs/Navigation/TransitionTracker';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';

const SAFETY_TIMEOUT_MULTIPLIER = 3;

/**
 * During dismiss_modal_and_open_report, defers heavy non-content components
 * (composer, invisible handlers) so the first render is lighter.
 * Real content (header + messages) still renders immediately.
 *
 * The deferral lifts once the navigation transition completes (plus one
 * animation frame for paint), with a safety timeout as a fallback.
 */
function useDeferNonEssentials(reportIDFromRoute: string | undefined): boolean {
    const [shouldDeferNonEssentials, setShouldDeferNonEssentials] = useState(() => {
        const pending = getPendingSubmitFollowUpAction();
        return pending?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT && pending?.reportID === reportIDFromRoute;
    });

    const animationFrameRef = useRef(0);
    const transitionHandleRef = useRef<CancelHandle | null>(null);
    const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!shouldDeferNonEssentials) {
                return;
            }
            transitionHandleRef.current = TransitionTracker.runAfterTransitions({
                callback: () => {
                    animationFrameRef.current = requestAnimationFrame(() => setShouldDeferNonEssentials(false));
                },
                waitForUpcomingTransition: true,
            });
            // *3: shorter than the orchestrator's *5 because this only defers rendering
            // of non-essential components - the user already sees the report content.
            safetyTimeoutRef.current = setTimeout(() => setShouldDeferNonEssentials(false), CONST.MAX_TRANSITION_DURATION_MS * SAFETY_TIMEOUT_MULTIPLIER);
            return () => {
                transitionHandleRef.current?.cancel();
                cancelAnimationFrame(animationFrameRef.current);
                if (safetyTimeoutRef.current) {
                    clearTimeout(safetyTimeoutRef.current);
                }
            };
        }, [shouldDeferNonEssentials]),
    );

    return shouldDeferNonEssentials;
}

export default useDeferNonEssentials;
