/**
 * Minute clock consumed by `useNow`, notifying only on minute boundaries. Kept out of `useNow.ts` so its React Compiler
 * memoization stays consistent across Babel/OXC. Unsubscribing is the only teardown: React re-runs `subscribe` just when
 * its identity changes, so clearing `listeners` from outside would strand every mounted consumer.
 */

const MS_PER_MINUTE = 60_000;

/** Fires just past the boundary rather than exactly on it, so a timer that runs early does not re-read the same minute. */
const TICK_MARGIN_MS = 10;

const listeners = new Set<() => void>();
let timeoutId: ReturnType<typeof setTimeout> | null = null;
// Advanced by `tick` and `subscribe`, never by `getSnapshot`, which must stay pure for `useSyncExternalStore`.
let snapshot: Date = new Date();
let lastMinute = Math.floor(snapshot.getTime() / MS_PER_MINUTE);

function advanceIfStale(): boolean {
    const now = new Date();
    // Monotonic index rather than `getMinutes()`, so a sleep/wake gap landing on the same minute-of-hour still counts.
    const currentMinute = Math.floor(now.getTime() / MS_PER_MINUTE);
    if (currentMinute === lastMinute) {
        return false;
    }
    lastMinute = currentMinute;
    snapshot = now;
    return true;
}

/** Aligned to the next minute boundary, with a small margin so drift does not accumulate. */
function scheduleNextTick() {
    if (timeoutId !== null) {
        return;
    }
    const msUntilNextMinute = MS_PER_MINUTE - (Date.now() % MS_PER_MINUTE);
    timeoutId = setTimeout(tick, msUntilNextMinute + TICK_MARGIN_MS);
}

function tick() {
    // Release the fired timer first, else a resubscribe during the notify loop below schedules a second chain.
    timeoutId = null;
    if (advanceIfStale()) {
        for (const listener of listeners) {
            listener();
        }
    }
    if (listeners.size > 0) {
        scheduleNextTick();
    }
}

function subscribe(listener: () => void): () => void {
    // Refresh the snapshot so the new subscriber reads a current value, but do not notify: React re-reads `getSnapshot`
    // after `subscribe` returns, and the pending tick already owns telling everyone else.
    advanceIfStale();
    listeners.add(listener);
    scheduleNextTick();
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
}

function getSnapshot(): Date {
    return snapshot;
}

/** Test-only reset so suites that manipulate the wall clock start from a clean module state. */
function resetForTests(): void {
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    listeners.clear();
    snapshot = new Date();
    lastMinute = Math.floor(snapshot.getTime() / MS_PER_MINUTE);
}

export {subscribe, getSnapshot, resetForTests};
