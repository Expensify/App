/**
 * Kept out of `useNow.ts` so React Compiler memoization stays consistent across Babel and OXC.
 * Unsubscribing is the only teardown: React re-runs `subscribe` only when its identity changes, so clearing
 * `listeners` from outside would strand every mounted consumer on a frozen clock.
 */

const MS_PER_MINUTE = 60_000;

/** Fires just past the boundary rather than exactly on it, so a timer that runs early does not re-read the same minute. */
const TICK_MARGIN_MS = 10;

const listeners = new Set<() => void>();
let timeoutId: ReturnType<typeof setTimeout> | null = null;
// Advanced by `tick`, `subscribe`, and `getSnapshot` only while nothing is subscribed. Once a listener exists an
// advance from `getSnapshot` would consume a minute transition the pending `tick` then skips notifying.
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
    try {
        if (advanceIfStale()) {
            for (const listener of listeners) {
                listener();
            }
        }
    } finally {
        // Rescheduled even if a listener threw, since nothing else re-arms the chain.
        if (listeners.size > 0) {
            scheduleNextTick();
        }
    }
}

function subscribe(listener: () => void): () => void {
    // `advanceIfStale` consumes the minute transition, so whoever was already subscribed has to hear about it here: the
    // pending tick will see the same minute and skip its own notify.
    if (advanceIfStale()) {
        for (const other of listeners) {
            other();
        }
    }
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
    // The timer is stopped while nothing is subscribed, so the value is as old as the gap since the last unmount.
    if (listeners.size === 0) {
        advanceIfStale();
    }
    return snapshot;
}

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
