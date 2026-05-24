import {useSyncExternalStore} from 'react';

/**
 * Polls at 1s to recover quickly from device sleep/wake, but only notifies on minute boundaries
 * so consumers (`HH:mm`, day-of-week) re-render at most once per minute.
 */

const POLL_INTERVAL_MS = 1000;

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
// Snapshot is initialized lazily on first `getSnapshot` (not at module load) so the first consumer
// after a long idle period sees the current `Date`, not the import-time one. Reset to null when the
// last subscriber unmounts so the next mount also starts fresh.
let snapshot: Date | null = null;
let lastMinute = -1;

function tick() {
    const now = new Date();
    if (now.getMinutes() === lastMinute) {
        return;
    }
    lastMinute = now.getMinutes();
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
        lastMinute = snapshot.getMinutes();
    }
    return snapshot;
}

function useNow(): Date {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useNow;
