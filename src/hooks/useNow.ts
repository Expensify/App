import {useSyncExternalStore} from 'react';

/**
 * Polls at 1s to recover quickly from device sleep/wake, but only notifies on minute boundaries
 * so consumers (`HH:mm`, day-of-week) re-render at most once per minute.
 */

const POLL_INTERVAL_MS = 1000;
const MS_PER_MINUTE = 60_000;

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
// Null-initialized + reset on last unsubscribe so a consumer mounting after an idle gap sees the current `Date`, not a stale one.
let snapshot: Date | null = null;
let lastMinute = -1;

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
            snapshot = null;
            lastMinute = -1;
        }
    };
}

function getSnapshot(): Date {
    if (snapshot === null) {
        snapshot = new Date();
        lastMinute = Math.floor(snapshot.getTime() / MS_PER_MINUTE);
    }
    return snapshot;
}

function useNow(): Date {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useNow;
