/**
 * Minute clock consumed by `useNow`. Only notifies on minute boundaries so consumers (`HH:mm`, day-of-week)
 * re-render at most once per minute.
 * Kept out of `useNow.ts` so its React Compiler memoization stays consistent across Babel/OXC.
 */

const MS_PER_MINUTE = 60_000;

const listeners = new Set<() => void>();
let timeoutId: ReturnType<typeof setTimeout> | null = null;
// Seeded at module load. Refreshed by `tick` and by `subscribe`. Never advanced from `getSnapshot` so the useSyncExternalStore purity contract holds (repeated reads in one render return the same reference).
let snapshot: Date = new Date();
let lastMinute = Math.floor(snapshot.getTime() / MS_PER_MINUTE);

function advanceIfStale(): boolean {
    const now = new Date();
    // Monotonic minute index (not `getMinutes()` 0-59) so sleep/wake gaps that land on the same minute-of-hour (10:30 → 11:30) still count as changes.
    const currentMinute = Math.floor(now.getTime() / MS_PER_MINUTE);
    if (currentMinute === lastMinute) {
        return false;
    }
    lastMinute = currentMinute;
    snapshot = now;
    return true;
}

/** Schedule the next tick aligned to the upcoming minute boundary, with a small safety margin so drift does not accumulate. */
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
    // Refresh (and notify existing siblings) BEFORE adding the new listener, so the fresh subscriber does not receive a redundant onStoreChange in addition to React's mount-time getSnapshot comparison.
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
