/**
 * Gates the RHP (Right Hand Panel) slide-out while the new workspace screen is revealed beneath it during
 * the workspace creation flow specifically. This helper exists only for that flow — see the warning below.
 *
 * Background: when workspace creation finishes inside the RHP, it sends the user to the new workspace via
 * `Navigation.revealRouteBeforeDismissingModal`. That call first inserts the destination fullscreen route
 * *underneath* the still-open RHP, then slides the RHP away — so the user gets a single dismiss animation
 * that uncovers the destination, instead of a dismiss-then-navigate sequence. For that to look right, the
 * destination must already be painted by the time the RHP starts sliding out; otherwise the slide-out
 * reveals an empty/blank screen for a frame.
 *
 * The problem this solves: on narrow layout the new workspace is revealed onto a fullscreen split whose
 * content (WorkspaceInitialPage) is lazy-loaded, so it paints a frame *after* the RHP has already begun
 * sliding out — which flashed the workspaces list / a blank card (#90985). To fix only that, these helpers
 * open a "synthetic" transition in TransitionTracker right before the reveal. TransitionTracker holds the
 * RHP slide-out (and anything queued after the transition) until every active transition ends; our synthetic
 * one ends when WorkspaceInitialPage reports its first real layout (see notifyRevealUnderRHPReady), so the
 * RHP slides away over a painted screen. It auto-expires after TransitionTracker's safety timeout if that
 * layout never arrives, so it can never wedge navigation. On wide layout the destination is visible
 * immediately, so the whole thing is a no-op.
 *
 * Do not reuse this for other flows, and do not turn it into a shared "reveal" utility. It is a deliberately
 * narrow workaround for the one lazy-fullscreen-under-RHP *paint* race described above. Other reveal/dismiss
 * flows (e.g. expense creation) have their own, more involved dismiss strategies built directly on
 * `revealRouteBeforeDismissingModal` and `TransitionTracker` (see submitDismissStrategies.ts) — they do not
 * route through here and must not. This gate also has sharp edges by design: it stores a single module-level
 * handle (so two reveals running at once would clobber each other) and it leans on one specific page calling
 * notifyRevealUnderRHPReady from its own onLayout, which couples navigation timing to that page's render
 * lifecycle. If a future flow just needs to run work after the RHP dismiss animation, use
 * `revealRouteBeforeDismissingModal`'s `afterTransition` option instead. Only reach for a gate like this if
 * you hit the exact same race: a lazy-loaded fullscreen screen revealed under the RHP that paints after the
 * slide-out begins.
 */
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
