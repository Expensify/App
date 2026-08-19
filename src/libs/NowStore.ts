/**
 * Minute clock consumed by `useNow`. Only notifies on minute boundaries so consumers (`HH:mm`, day-of-week)
 * re-render at most once per minute.
 * Kept out of `useNow.ts` so its React Compiler memoization stays consistent across Babel/OXC.
 */

const MS_PER_MINUTE = 60_000;

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
    const msUntilNextMinute = MS_PER_MINUTE - (Date.now() % MS_PER_MINUTE);
    timeoutId = setTimeout(tick, msUntilNextMinute + 10);
}

function tick() {
    if (advanceIfStale()) {
        for (const listener of listeners) {
            listener();
        }
    }
    if (listeners.size > 0) {
        scheduleNextTick();
    } else {
        timeoutId = null;
    }
}

function subscribe(listener: () => void): () => void {
    // Refresh before adding the listener, so the new subscriber is not notified on top of React's own mount-time check.
    if (advanceIfStale()) {
        for (const other of listeners) {
            other();
        }
    }
    listeners.add(listener);
    if (timeoutId === null) {
        scheduleNextTick();
    }
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
