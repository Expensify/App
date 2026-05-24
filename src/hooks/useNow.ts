import {useSyncExternalStore} from 'react';

/**
 * Polls at 1s to recover quickly from device sleep/wake, but only notifies on minute boundaries
 * so consumers (`HH:mm`, day-of-week) re-render at most once per minute.
 */

const POLL_INTERVAL_MS = 1000;

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let lastMinute = new Date().getMinutes();
let snapshot = new Date();

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
        // Re-anchor on first subscribe so a sleep/wake gap doesn't immediately fire a stale tick.
        lastMinute = new Date().getMinutes();
        snapshot = new Date();
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

function useNow(): Date {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useNow;
