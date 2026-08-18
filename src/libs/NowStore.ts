/**
 * 1s-polled minute clock consumed by `useNow`. Only notifies on minute boundaries so consumers (`HH:mm`, day-of-week) re-render at most once per minute.
 * Kept out of `useNow.ts` so its React Compiler memoization stays consistent across Babel/OXC.
 */

const POLL_INTERVAL_MS = 1000;
const MS_PER_MINUTE = 60_000;

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
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

function tick() {
    if (!advanceIfStale()) {
        return;
    }
    for (const listener of listeners) {
        listener();
    }
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (intervalId === null) {
        intervalId = setInterval(tick, POLL_INTERVAL_MS);
    }
    // Refresh once at subscribe time so the first paint after a long gap (device sleep, module imported but no consumer for a while) does not remain on the stale module-import snapshot. Notify any siblings still holding the old value.
    if (advanceIfStale()) {
        for (const other of listeners) {
            other();
        }
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };
}

function getSnapshot(): Date {
    return snapshot;
}

export {subscribe, getSnapshot};
