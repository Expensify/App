/**
 * Priority arbiter for focus-moving systems. Callers `tryClaim()` before `.focus()`; higher priorities veto lower within a cycle.
 * Cycles reset on navigation state change, or after CYCLE_TIMEOUT_MS of silence (prevents stale priorities blocking legitimate later claims).
 */

const INITIAL = 1;
const AUTO = 2;
const RETURN = 3;

type Priority = typeof INITIAL | typeof AUTO | typeof RETURN;

const Priorities = {INITIAL, AUTO, RETURN} as const;

const CYCLE_TIMEOUT_MS = 2000;

let currentPriority: Priority | 0 = 0;
let lastClaimTimestamp = 0;

// Equal-priority re-claims succeed (>=) so RETURN retries after transient aria-hidden don't self-veto.
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
