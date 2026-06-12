import {useCallback, useRef} from 'react';
import {endSubmitFollowUpActionSpan, getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';

type Options = {
    requireLayout?: boolean;
};

/**
 * Shared callback for ending submit-expense navigation spans on Search pages.
 *
 * - `requireLayout: true` (narrow): dual-gate requiring both focus + layout signals
 *   before ending, except for DISMISS_MODAL_ONLY where focus alone suffices (the page
 *   is already mounted and laid out so onLayout won't re-fire).
 * - `requireLayout: false` (wide): ends immediately on any signal (pre-insert is
 *   narrow-only so the dual-gate isn't needed).
 */
function useEndSubmitNavigationSpans({requireLayout = true}: Options = {}): (wasListEmpty: boolean, source: 'focus' | 'layout') => void {
    const hadFocusRef = useRef(false);
    const hadLayoutRef = useRef(false);

    return useCallback(
        (wasListEmpty: boolean, source: 'focus' | 'layout') => {
            if (requireLayout) {
                if (source === 'focus') {
                    hadFocusRef.current = true;
                } else {
                    hadLayoutRef.current = true;
                }

                const pendingForGate = getPendingSubmitFollowUpAction();
                const isDismissOnly = pendingForGate?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY;
                const hasBothSignals = hadFocusRef.current && hadLayoutRef.current;
                const hasFocusOnly = hadFocusRef.current && isDismissOnly;

                if (!hasBothSignals && !hasFocusOnly) {
                    return;
                }

                hadFocusRef.current = false;
                hadLayoutRef.current = false;
            }

            // Re-read after the gate check - the value is synchronous module state so it
            // can't change between the two reads in the same tick, but reading once here
            // keeps the logic self-contained for the actual end-span decision.
            const pending = getPendingSubmitFollowUpAction();
            if (pending && pending.followUpAction !== CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT) {
                endSubmitFollowUpActionSpan(pending.followUpAction, undefined, {
                    [CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true,
                    [CONST.TELEMETRY.ATTRIBUTE_WAS_LIST_EMPTY]: wasListEmpty,
                });
            }
        },
        [requireLayout],
    );
}

export default useEndSubmitNavigationSpans;
