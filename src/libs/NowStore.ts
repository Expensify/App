/**
 * 1s-polled minute clock consumed by `useNow`. Only notifies on minute boundaries so consumers (`HH:mm`, day-of-week) re-render at most once per minute.
 * Kept out of `useNow.ts` so its React Compiler memoization stays consistent across Babel/OXC.
 */

const POLL_INTERVAL_MS = 1000;
const MS_PER_MINUTE = 60_000;

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
// Seeded eagerly and refreshed on subscribe so `getSnapshot` stays pure (StrictMode calls it twice per render).
let snapshot: Date = new Date();
let lastMinute = Math.floor(snapshot.getTime() / MS_PER_MINUTE);

function tick() {
    const now = new Date();
    // Monotonic minute index (not `getMinutes()` 0–59) — catches sleep/wake gaps that land on the same minute-of-hour (10:30 → 11:30).
    const currentMinute = Math.floor(now.getTime() / MS_PER_MINUTE);
    if (currentMinute === lastMinute) {
        return;
    }
    lastMinute = currentMinute;
    snapshot = now;
    for (const listener of listeners) {
        listener();
    }
}

function refreshSnapshot() {
    const now = new Date();
    const currentMinute = Math.floor(now.getTime() / MS_PER_MINUTE);
    if (currentMinute === lastMinute) {
        return;
    }
    lastMinute = currentMinute;
    snapshot = now;
}

function subscribe(listener: () => void): () => void {
    // Refresh before the first render observes it, otherwise a re-subscribe after an idle gap stalls up to ~60s on stale snapshot.
    refreshSnapshot();
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

function getSnapshot(): Date {
    return snapshot;
}

export {subscribe, getSnapshot};
