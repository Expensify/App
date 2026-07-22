import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';

/**
 * Keeps the MFA modal marker's synthetic browser entry aligned with
 * `state.history` across `Navigation.goBack`.
 *
 * Example: state.history = [A, B, MFA], goBack pops B.
 *   Without bracket: useLinking issues `history.go(-2)` and lands the browser
 *     on A's old snapshot — the MFA marker entry is gone and a later
 *     browser-back skips past the post-pop screen.
 *   With bracket: strip → pop → re-attach. Each toggle drives useLinking to
 *     push/replace a fresh browser entry mapped to the post-pop path.
 *
 * Browser-back mid-bracket needs no special handling: re-attach lands the
 * marker on whatever route useLinking navigated to, listener path stays intact.
 */

const MFA_MARKER = CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR;

let stripInProgress = false;

function isMfaMarkerStripInProgress(): boolean {
    return stripInProgress;
}

function toggleMfaMarker(isVisible: boolean): void {
    navigationRef.dispatch({
        type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MFA_MODAL_NAVIGATOR_WITH_HISTORY,
        payload: {isVisible},
    });
}

/** Invalidates a pending re-attach so its callback no-ops. Used on modal close. */
function cancelPendingMfaMarkerReattach(): void {
    stripInProgress = false;
}

/**
 * Strips the marker, runs `pop`, then schedules the re-attach via `scheduleReattach`.
 * Caller owns the transition-aware scheduler (kept here as a parameter so the helper
 * doesn't reach into the internal TransitionTracker primitive).
 */
function popAndRealignMfaMarker(pop: () => void, scheduleReattach: (callback: () => void) => void): void {
    if (navigationRef.getRootState()?.history?.at(-1) !== MFA_MARKER) {
        pop();
        return;
    }

    stripInProgress = true;
    toggleMfaMarker(false);
    try {
        pop();
    } finally {
        scheduleReattach(() => {
            if (!stripInProgress) {
                return;
            }
            stripInProgress = false;
            toggleMfaMarker(true);
        });
    }
}

export {cancelPendingMfaMarkerReattach, isMfaMarkerStripInProgress, popAndRealignMfaMarker, toggleMfaMarker};
