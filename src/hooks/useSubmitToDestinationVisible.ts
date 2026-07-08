import {endSubmitFollowUpActionSpan, getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import type {SubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef} from 'react';

type Trigger = ValueOf<typeof CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER>;

/**
 * End the submit-to-destination-visible span when the destination becomes visible.
 * - trigger FOCUS: ends the span when the screen gains focus (e.g. ReportScreen for dismiss-and-open-report / dismiss-modal-only).
 * - trigger LAYOUT: returns a callback to attach to onLayout; ends the span when layout runs (e.g. SearchMoneyRequestReportPage).
 * - triggers [FOCUS, LAYOUT]: tries both — one shared hasEndedRef guard prevents double-ending.
 * Resets the "already ended" guard on blur so the next visit can end the span again.
 */
function useSubmitToDestinationVisible(
    followUpActions: readonly SubmitFollowUpAction[],
    reportID: string | undefined,
    trigger: typeof CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.FOCUS,
): void;
function useSubmitToDestinationVisible(
    followUpActions: readonly SubmitFollowUpAction[],
    reportID: string | undefined,
    trigger: typeof CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.LAYOUT,
): (event?: LayoutChangeEvent) => void;
function useSubmitToDestinationVisible(followUpActions: readonly SubmitFollowUpAction[], reportID: string | undefined, triggers: readonly Trigger[]): (event?: LayoutChangeEvent) => void;
function useSubmitToDestinationVisible(
    followUpActions: readonly SubmitFollowUpAction[],
    reportID: string | undefined,
    triggerOrTriggers: Trigger | readonly Trigger[],
): void | ((event?: LayoutChangeEvent) => void) {
    const hasEndedRef = useRef(false);
    const triggers = Array.isArray(triggerOrTriggers) ? triggerOrTriggers : [triggerOrTriggers];
    const usesFocus = triggers.includes(CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.FOCUS);
    const usesLayout = triggers.includes(CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.LAYOUT);

    const tryEnd = useCallback(() => {
        if (hasEndedRef.current) {
            return;
        }
        const pending = getPendingSubmitFollowUpAction();
        if (!pending || !followUpActions.includes(pending.followUpAction)) {
            return;
        }
        if (pending.reportID !== undefined && pending.reportID !== reportID) {
            return;
        }
        hasEndedRef.current = true;
        endSubmitFollowUpActionSpan(pending.followUpAction, reportID);
    }, [followUpActions, reportID]);

    const reset = useCallback(() => {
        hasEndedRef.current = false;
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (usesFocus && reportID) {
                tryEnd();
            }
            return reset;
        }, [usesFocus, reportID, tryEnd, reset]),
    );

    // Array overload always returns the callback (tryEnd is a safe no-op when
    // there's no pending span). Single-trigger FOCUS overload returns void.
    if (Array.isArray(triggerOrTriggers)) {
        return tryEnd;
    }
    return usesLayout ? tryEnd : undefined;
}

export default useSubmitToDestinationVisible;
