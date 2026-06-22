import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';

// Tracks the synthetic transition opened by beginRevealUnderRHP. Closed by notifyRevealUnderRHPReady
// from WorkspaceInitialPage's first onLayout. Auto-expires after MAX_TRANSITION_DURATION_MS.
let pendingRevealReadinessHandle: TransitionHandle | null = null;

/**
 * Opens a synthetic transition that gates the RHP slide-out until the revealed workspace screen
 * has laid out. Call this right before revealRouteBeforeDismissingModal for workspace creation.
 * On wide layout this is a no-op since the destination is visible immediately.
 */
function beginRevealUnderRHP() {
    if (!getIsNarrowLayout()) {
        return;
    }
    if (pendingRevealReadinessHandle) {
        TransitionTracker.endTransition(pendingRevealReadinessHandle);
    }
    pendingRevealReadinessHandle = TransitionTracker.startTransition();
}

/**
 * Signals that the workspace screen revealed under the RHP has laid out, allowing the pending
 * RHP slide-out to run over a painted screen. No-op when no reveal is pending or the synthetic
 * transition already expired via its safety timeout.
 */
function notifyRevealUnderRHPReady() {
    if (!pendingRevealReadinessHandle) {
        return;
    }
    TransitionTracker.endTransition(pendingRevealReadinessHandle);
    pendingRevealReadinessHandle = null;
}

export default {beginRevealUnderRHP, notifyRevealUnderRHPReady};
