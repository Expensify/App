/**
 * Priority-based arbitration between the systems that attempt to move focus
 * when a screen gains focus. Callers consult tryClaim() before calling
 * `.focus()`; higher-priority claims within the same cycle veto lower ones.
 *
 * Cycles reset on navigation state change (explicit) or after a silent window
 * elapses (prevents stale priorities from blocking legitimate later claims,
 * e.g. a side-panel close long after the last nav transition).
 */

const INITIAL = 1;
const AUTO = 2;
const RETURN = 3;

type Priority = typeof INITIAL | typeof AUTO | typeof RETURN;

const Priorities = {INITIAL, AUTO, RETURN} as const;

const CYCLE_TIMEOUT_MS = 2000;

let currentPriority: Priority | 0 = 0;
let lastClaimTimestamp = 0;

// Equal-priority re-claims are allowed (>= succeeds): two successive RETURN claims within the same cycle must both win so retries after a transient aria-hidden don't self-veto.
function tryClaim(priority: Priority): boolean {
    const now = Date.now();
    if (now - lastClaimTimestamp > CYCLE_TIMEOUT_MS) {
        currentPriority = 0;
    }
    if (priority < currentPriority) {
        return false;
    }
    currentPriority = priority;
    lastClaimTimestamp = now;
    return true;
}

function resetCycle(): void {
    currentPriority = 0;
    lastClaimTimestamp = 0;
}

export {tryClaim, resetCycle, Priorities, CYCLE_TIMEOUT_MS};
export type {Priority};
