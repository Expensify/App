/**
 * 1s-polled minute clock consumed by `useNow`. Only notifies on minute boundaries so consumers (`HH:mm`, day-of-week) re-render at most once per minute.
 * Kept out of `useNow.ts` so its React Compiler memoization stays consistent across Babel/OXC.
 */

const POLL_INTERVAL_MS = 1000;
const MS_PER_MINUTE = 60_000;

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let snapshot: Date = new Date();
let lastMinute = Math.floor(snapshot.getTime() / MS_PER_MINUTE);

/**
 * Advances `snapshot` when the wall-clock minute has moved past `lastMinute`. Returns whether the snapshot changed
 * so callers can decide to notify. Safe to call from either `getSnapshot` (StrictMode double-invokes it per render)
 * or `tick`, because the returned identity is stable within a minute.
 */
function advanceIfStale(): boolean {
    const now = new Date();
    // Monotonic minute index (not `getMinutes()` 0–59) — catches sleep/wake gaps that land on the same minute-of-hour (10:30 → 11:30).
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
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };
}

/**
 * Advances the snapshot inline if the minute has moved, so the very first render (before `subscribe` fires) sees a
 * fresh Date rather than the module-import snapshot. The check is a single Math.floor comparison and returns the
 * same reference within a minute, so StrictMode double-invocation and per-render reads stay identity-stable.
 */
function getSnapshot(): Date {
    advanceIfStale();
    return snapshot;
}

export {subscribe, getSnapshot};
